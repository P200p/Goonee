// Cross-browser compatibility
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

// Request config/files from background (IndexedDB in extension origin can't be read from arbitrary pages)
async function getConfig(){
  if (typeof browserAPI !== 'undefined' && browserAPI.runtime && browserAPI.runtime.sendMessage) {
    // retry a few times in case the service worker is temporarily inactive
    const maxTries = 3;
    for (let attempt = 1; attempt <= maxTries; attempt++) {
      const resp = await new Promise((resolve) => {
        browserAPI.runtime.sendMessage({ type: 'get-config' }, (r) => {
          resolve({ resp: r, err: browserAPI.runtime.lastError });
        });
      });
      if (resp.err) {
        console.warn('getConfig messaging attempt', attempt, 'failed', resp.err && resp.err.message);
        if (attempt < maxTries) await new Promise(r => setTimeout(r, 200 * attempt));
        continue;
      }
      const r = resp.resp;
      if (r && r.ok) return r.items || [];
      return [];
    }
    console.error('getConfig messaging failed after retries');
    return [];
  }
  // fallback: empty
  return [];
}

// get a file blob via background: background returns an ArrayBuffer and mime-type
async function getFile(key){
  if (!key) return null;
  if (typeof browserAPI !== 'undefined' && browserAPI.runtime && browserAPI.runtime.sendMessage) {
    const maxTries = 3;
    for (let attempt = 1; attempt <= maxTries; attempt++) {
      const resp = await new Promise((resolve) => {
        browserAPI.runtime.sendMessage({ type: 'get-file', key }, (r) => {
          resolve({ resp: r, err: browserAPI.runtime.lastError });
        });
      });
      if (resp.err) {
        console.warn('getFile messaging attempt', attempt, 'failed', resp.err && resp.err.message);
        if (attempt < maxTries) await new Promise(r => setTimeout(r, 200 * attempt));
        continue;
      }
      const r = resp.resp;
      if (!r || !r.ok) return null;
      try{
        const ab = r.buffer;
        const uint8 = new Uint8Array(ab);
        const blob = new Blob([uint8], { type: r.type || 'application/octet-stream' });
        return blob;
      }catch(e){ console.error('getFile decode failed', e); return null; }
    }
    console.error('getFile messaging failed after retries');
    return null;
  }
  return null;
}

function normalizeBuiltinPath(path){
  if(!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path;
  const trimmed = path.replace(/^\.\//, '');
  try{ if (typeof browserAPI !== 'undefined' && browserAPI.runtime && browserAPI.runtime.getURL) return browserAPI.runtime.getURL(trimmed); }catch(e){}
  return trimmed;
}

// Helper function to resolve icon URLs consistently
async function resolveIconUrls(item) {
  let normalURL = null, hoverURL = null;
  
  // Handle normal icon (only builtin paths now)
  if (item.iconBuiltin) normalURL = normalizeBuiltinPath(item.iconBuiltin);
  
  // Handle hover icon (only builtin paths now)
  if (item.iconBuiltinHover) hoverURL = normalizeBuiltinPath(item.iconBuiltinHover);
  
  // Apply consistent fallback logic (same as setting.js)
  const ogUrl = normalizeBuiltinPath('image/og.png');
  if (!hoverURL) hoverURL = ogUrl;
  if (!normalURL) normalURL = hoverURL || ogUrl;
  
  return { normalURL, hoverURL };
}

// allow external messages to refresh config or toggle visibility (refresh-config support)
if (typeof browserAPI !== 'undefined' && browserAPI.runtime && browserAPI.runtime.onMessage) {
  browserAPI.runtime.onMessage.addListener((msg, sender, resp) => {
    if (!msg) return;
    if (msg.type === 'refresh-config' || (msg.type === 'broadcast' && msg.payload && msg.payload.type === 'refresh-config')){
      (async ()=>{
        try{
          if (menuOpen){
            closeMenu();
            await new Promise(r=>setTimeout(r,80));
            await openMenu();
          }
        }catch(e){ console.error('refresh-config failed', e); }
      })();
      // also ask background to (re)inject all matching scripts into this tab
      try {
        if (typeof browserAPI !== 'undefined' && browserAPI.runtime && browserAPI.runtime.sendMessage) {
          browserAPI.runtime.sendMessage({ type: 'exec-all' }, (resp) => {
            if (browserAPI.runtime.lastError) {
              console.warn('content: exec-all sendMessage failed', browserAPI.runtime.lastError);
            } else {
              console.log('content: exec-all response', resp);
            }
          });
        }
      } catch (e) {
        console.warn('content: exec-all messaging exception', e);
      }
    }
    if (msg.type === 'toggle-visibility'){
      mainIcon.style.display = msg.visible ? 'block' : 'none';
    }
  });
}

// ตรวจสอบว่า document.body พร้อมใช้งานแล้วหรือไม่
function ensureBodyReady(callback) {
  if (document.body) {
    callback();
  } else {
    // รอให้ DOM โหลดเสร็จ
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      // ถ้า DOM โหลดเสร็จแล้วแต่ยังไม่มี body ให้รอสักครู่
      setTimeout(() => {
        if (document.body) {
          callback();
        } else {
          console.warn('document.body still not available, trying to create floating icon anyway');
          callback();
        }
      }, 100);
    }
  }
}

// สร้างไอคอนหลัก (main icon)
function createMainIcon() {
  const mainIcon = document.createElement('div');
  mainIcon.id = 'mainMenuIcon';

  // ตรวจสอบว่าไอคอนยังไม่มีอยู่แล้ว
  const existingIcon = document.getElementById('mainMenuIcon');
  if (existingIcon) {
    existingIcon.remove();
    console.log('Removed existing main icon');
  }

  // Inject small stylesheet for rotation and hover-friendly defaults
  (function(){
    try{
      const existingStyle = document.getElementById('shark-tools-inline-style');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const s = document.createElement('style');
      s.id = 'shark-tools-inline-style';
      s.textContent = `
        @keyframes sharktools-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        #mainMenuIcon { transition: transform 220ms ease; }
        /* while menu open, rotate continuously */
        #mainMenuIcon.rotating { animation: sharktools-spin 0.8s linear infinite; transform-origin: center center; }
      `;
      (document.head || document.documentElement).appendChild(s);
    }catch(e){ console.warn('could not inject style for shark tools', e); }
  })();

  const defaultMainImage = browserAPI.runtime.getURL('image/main.png');
  Object.assign(mainIcon.style, {
    position: 'fixed',
    left: '100px',
    top: '100px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundImage: `url(${defaultMainImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'none',
    zIndex: '2147483647'
  });

  // เพิ่มไอคอนเข้าไปใน body หรือ documentElement
  const targetElement = document.body || document.documentElement;
  if (targetElement) {
    targetElement.appendChild(mainIcon);
    console.log('Main icon created and added to page');
  } else {
    console.error('Cannot find target element to append main icon');
    return null;
  }
  
  return mainIcon;
}

// เรียกใช้ฟังก์ชันสร้างไอคอนเมื่อ DOM พร้อม
let mainIcon;
ensureBodyReady(() => {
  mainIcon = createMainIcon();
  if (!mainIcon) {
    console.error('Failed to create main icon');
    return;
  }
  
  // ตั้งค่าการทำงานของไอคอนหลัก
  setupMainIconBehavior();
});

function setupMainIconBehavior() {
  if (!mainIcon) {
    console.error('Main icon not available for setup');
    return;
  }

// inject small stylesheet for rotating animation and sub-icon hover helper
;(function injectMenuStyles(){
  try{
    if (document.getElementById('shark-tools-styles')) return;
    const s = document.createElement('style');
    s.id = 'shark-tools-styles';
    s.textContent = `
      @keyframes shark-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      #mainMenuIcon.rotating { animation: shark-spin 0.6s linear; transform-origin: center center; }
      .sub-icon { transition: opacity 120ms ease, transform 120ms ease; }
      .sub-icon:active { transform: scale(0.96); }
    `;
    (document.head || document.documentElement).appendChild(s);
  }catch(e){ console.warn('injectMenuStyles failed', e); }
})();

// ฟังก์ชันทำให้ element สามารถลากได้ (draggable)
function makeDraggable(el) {
  el.style.touchAction = 'none';
  el.style.userSelect = 'none';
  let startX = null, startY = null, origX = null, origY = null;
  el.addEventListener('pointerdown', function (e) {
    startX = e.clientX; startY = e.clientY;
    origX = parseInt(el.style.left) || 0; origY = parseInt(el.style.top) || 0;
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
  });
  el.addEventListener('pointermove', function (e) {
    if (startX === null) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    el.style.left = (origX + dx) + 'px'; el.style.top = (origY + dy) + 'px';
  });
  el.addEventListener('pointerup', function (e) {
    try { el.releasePointerCapture(e.pointerId); } catch (_) {}
    startX = startY = origX = origY = null;
  });
}
makeDraggable(mainIcon);

let menuOpen = false;
const subIcons = [];

// เปิดเมนูย่อย (สร้างไอคอนย่อยวงกลม)
async function openMenu() {
  try {
    mainIcon.classList.add('rotating');
    const rect = mainIcon.getBoundingClientRect();
    const centerX = rect.left + rect.width/2;
    const centerY = rect.top + rect.height/2;
    const radius = 100;

    // load user-configured items from DB
    let userItems = [];
    try { 
      userItems = await getConfig(); 
    } catch (e) { 
      console.warn('getConfig failed', e); 
      // Continue with empty array if config fails
    }

    // filter user items by scope: global or host
    const currentHost = (location && location.hostname) ? location.hostname : '';
    const filteredUser = (Array.isArray(userItems) ? userItems.slice() : []).filter(it => {
      if (!it || !it.scope) return true; // default to show
      if (it.scope === 'global') return true;
      if (it.scope === 'host') {
        // if scopeHost provided, match that, otherwise match current host
        if (it.scopeHost && it.scopeHost.trim()) {
          try {
            const want = it.scopeHost.trim().toLowerCase();
            return currentHost.toLowerCase().endsWith(want);
          } catch(e){ return false; }
        }
        return true; // if no scopeHost specified, assume host-scope means current host
      }
      return true;
    });

    // Define builtin items (empty array if no builtins needed)
    const builtins = [];
    
    // Merge: filtered user items first, then builtins (you can change ordering as desired)
    const items = filteredUser.concat(builtins);

    const count = items.length;
    
    // If no items, show a message
    if (count === 0) {
      console.log('No items to display in floating menu');
      mainIcon.classList.remove('rotating');
      return;
    }

    const angleStep = (2 * Math.PI) / Math.max(1, count);

  for (let i = 0; i < count; i++) {
    const item = items[i];
    const angle = i * angleStep;
  const sub = document.createElement('img');
  sub.className = 'sub-icon';
    sub.draggable = false;
    Object.assign(sub.style, {
      position: 'fixed',
      left: (centerX + Math.cos(angle)*radius - 20) + 'px',
      top: (centerY + Math.sin(angle)*radius - 20) + 'px',
      width: '40px', height: '40px', cursor: 'pointer',
      userSelect: 'none', touchAction: 'none', zIndex: '2147483647',
      borderRadius: '8px', backgroundColor: '#444'
    });

    // prepare icon: user-provided blob or builtin path
    // Use helper function for consistent icon resolution
    const { normalURL, hoverURL } = await resolveIconUrls(item);

    if (normalURL) sub.src = normalURL; else sub.style.backgroundColor = '#666';

    // hover swap handlers: swap to hoverURL on pointerenter, revert on pointerleave
    const originalSrc = sub.src;
    sub.addEventListener('pointerenter', () => {
      try {
        if (hoverURL && hoverURL !== originalSrc) sub.src = hoverURL;
      } catch(e) {}
    });
    sub.addEventListener('pointerleave', () => {
      try { sub.src = originalSrc; } catch(e) {}
    });

    makeDraggable(sub);
    let subMoved = false;
    sub.addEventListener('pointerdown', () => { subMoved = false; });
    sub.addEventListener('pointermove', () => { subMoved = true; });

    sub.addEventListener('click', async () => {
      if (subMoved) { subMoved = false; return; }
      try {
        // run script: if user-provided script blob
        if (item.scriptId) {
          // Prefer asking background for text to avoid ArrayBuffer decoding issues
          let code = '';
          try {
            const resp = await new Promise((resolve) => {
              try {
                chrome.runtime.sendMessage({ type: 'get-file-text', key: item.scriptId }, (r) => {
                  resolve({ r, err: chrome.runtime.lastError });
                });
              } catch (e) { resolve({ r: null, err: e }); }
            });
            if (resp && resp.err) {
              console.warn('content get-file-text failed', resp.err && resp.err.message);
            } else if (resp && resp.r && resp.r.ok) {
              code = resp.r.text || '';
            }
          } catch(e){ console.warn('content get-file-text exception', e); }

          // fallback: getFile() and blob.text()
          if (!code) {
            try {
              const blob = await getFile(item.scriptId).catch(()=>null);
              if (blob) code = await blob.text().catch(()=>'');
            } catch(e){ console.warn('fallback read blob failed', e); }
          }

          if (code) {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
              console.log('content: sending exec-code to background', { length: code.length });
              chrome.runtime.sendMessage({ type: 'exec-code', code }, (resp) => {
                if (chrome.runtime.lastError) {
                  console.warn('content exec-code sendMessage failed', chrome.runtime.lastError);
                  try { alert('ส่งคำสั่งไม่สำเร็จ: ' + chrome.runtime.lastError.message); } catch(_){ }
                } else {
                  console.log('content exec-code response', resp);
                }
              });
            } else {
              const b = new Blob([code], { type: 'text/javascript' });
              const url = URL.createObjectURL(b);
              const s = document.createElement('script'); s.src = url; s.async = false;
              s.onload = ()=>{ URL.revokeObjectURL(url); s.remove(); };
              (document.head || document.documentElement).appendChild(s);
            }
          } else {
            console.warn('No code retrieved for item', item.id || item.name);
          }
        } else if (item.scriptBuiltin) {
          const url = normalizeBuiltinPath(item.scriptBuiltin);
          try {
            const res = await fetch(url).catch(()=>null);
            if (res && res.ok) {
              const code = await res.text();
              if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({ type: 'exec-code', code }, ()=>{});
              } else {
                const b = new Blob([code], { type: 'text/javascript' });
                const url2 = URL.createObjectURL(b);
                const s = document.createElement('script'); s.src = url2; s.async = false;
                s.onload = ()=>{ URL.revokeObjectURL(url2); s.remove(); };
                (document.head || document.documentElement).appendChild(s);
              }
            }
          } catch(e){ console.warn('failed to fetch builtin script', e); }
        } else if (item.action && typeof item.action === 'function') {
          // builtin tool action
          item.action();
        }
      } catch(err) { console.error('Error executing item', item, err); }
      closeMenu();
    });

    document.body.appendChild(sub);
    // store references for cleanup (no blob URLs to clean up now)
    subIcons.push(sub);
  }
  menuOpen = true;
  } catch (error) {
    console.error('Error in openMenu:', error);
    mainIcon.classList.remove('rotating');
    // Clean up any partially created sub icons
    subIcons.forEach(s => {
      try {
        if (s._createdBlobSrc) { URL.revokeObjectURL(s._createdBlobSrc); }
        if (s._hoverBlobSrc) { URL.revokeObjectURL(s._hoverBlobSrc); }
      } catch(e){}
      s.remove();
    });
    subIcons.length = 0;
    menuOpen = false;
  }
}

// ปิดเมนูย่อย (รีเซ็ต)
function closeMenu() {
  mainIcon.classList.remove('rotating');
  subIcons.forEach(s => {
    // No blob URLs to clean up anymore since we only use builtin paths
    s.remove();
  });
  subIcons.length = 0;
  menuOpen = false;
}

// คลิก main icon เพื่อเปิด/ปิดเมนูย่อย
mainIcon.addEventListener('click', () => {
  if (!menuOpen) openMenu();
  else closeMenu();
});

console.log('Main icon behavior setup completed');
}
