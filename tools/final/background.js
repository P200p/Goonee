chrome.runtime.onInstalled.addListener(() => {
  console.log("Shark Tools Extension ติดตั้งเรียบร้อยแล้ว");
});
// Background DB helpers so content scripts (web pages) can request extension-stored files/config
const DB_NAME = 'bundle_extension_db';
const DB_VERSION = 1;
function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains('files')) db.createObjectStore('files');
      if(!db.objectStoreNames.contains('config')) db.createObjectStore('config');
    };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function bgGetFile(key){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction('files','readonly');
    const r = tx.objectStore('files').get(key);
    r.onsuccess = ()=>resolve(r.result);
    r.onerror = ()=>reject(r.error);
  });
}

async function bgGetConfig(){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction('config','readonly');
    const r = tx.objectStore('config').get('items');
    r.onsuccess = ()=>resolve(r.result || []);
    r.onerror = ()=>reject(r.error);
  });
}

// Auto-inject user scripts when tabs finish loading (respecting scope)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    if (changeInfo && changeInfo.status === 'complete' && tab && /^https?:/.test(tab.url || '')) {
      const items = await bgGetConfig().catch(()=>[]);
      for (const it of items || []) {
        try {
          // only auto-inject items that explicitly opt-in via autoRun
          if (!it || !it.autoRun) continue;
          // scope check: host-scoped items only run on matching host
          if (it && it.scope === 'host' && it.scopeHost) {
            try {
              const u = new URL(tab.url);
              if (!u.hostname.toLowerCase().includes((it.scopeHost||'').toLowerCase())) continue;
            } catch(e){ continue; }
          }
          let code = '';
          if (it && it.scriptId) {
            const blob = await bgGetFile(it.scriptId).catch(()=>null);
            if (blob) code = await blob.text().catch(()=>'');
          } else if (it && it.scriptBuiltin) {
            try {
              const res = await fetch(it.scriptBuiltin).catch(()=>null);
              if (res && res.ok) code = await res.text();
            } catch(_){}
          }
    if (code && code.trim()) {
            try {
              await chrome.scripting.executeScript({
                target: { tabId },
                world: 'MAIN',
                func: (src) => {
                  try {
                    const s = document.createElement('script');
                    s.textContent = src;
                    (document.head || document.documentElement).appendChild(s);
                    s.remove();
                  } catch (e) { console.error('injected script error', e); }
                },
                args: [code]
              });
            } catch(e){ console.warn('executeScript inject failed', e); }
          }
        } catch(e) { console.warn('item inject error', e); }
      }
    }
  } catch(e){ console.error('tabs.onUpdated handler failed', e); }
});

// รับคำสั่งจาก setting/content เพื่อรันโค้ดหรือกระจายข้อความ
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('background onMessage', msg, sender && sender.tab && sender.tab.id);
  if (!msg || !msg.type) return;

  if (msg.type === 'get-config') {
    (async () => {
      try {
        const items = await bgGetConfig();
        sendResponse({ ok: true, items });
      } catch (e) {
        console.error('get-config failed', e);
        sendResponse({ ok: false, error: String(e) });
      }
    })();
    return true;
  }

  if (msg.type === 'get-file' && msg.key) {
    (async () => {
      try {
        const blob = await bgGetFile(msg.key);
        if (!blob) { sendResponse({ ok: false }); return; }
        const ab = await blob.arrayBuffer();
        sendResponse({ ok: true, buffer: ab, type: blob.type });
      } catch (e) {
        console.error('get-file failed', e);
        sendResponse({ ok: false, error: String(e) });
      }
    })();
    return true;
  }

  // Return file content as text (convenience for content scripts)
  if (msg.type === 'get-file-text' && msg.key) {
    (async () => {
      try {
        const blob = await bgGetFile(msg.key);
        if (!blob) { sendResponse({ ok: false }); return; }
        try {
          const txt = await blob.text();
          sendResponse({ ok: true, text: txt, type: blob.type });
        } catch (e) {
          console.error('get-file-text: blob.text() failed', e);
          sendResponse({ ok: false, error: String(e) });
        }
      } catch (e) {
        console.error('get-file-text failed', e);
        sendResponse({ ok: false, error: String(e) });
      }
    })();
    return true;
  }

  if (msg.type === 'exec-all') {
    (async () => {
      try {
        let tabId = (sender && sender.tab && sender.tab.id) || null;
        if (!tabId) {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tabs && tabs[0]) tabId = tabs[0].id;
        }
        if (!tabId) { sendResponse({ ok: false, error: 'no-target-tab' }); return; }
        const items = await bgGetConfig().catch(()=>[]);
        for (const it of items || []) {
          try {
            // respect autoRun flag for exec-all as well (only inject if autoRun is true)
            if (!it || !it.autoRun) continue;
            if (it && it.scope === 'host' && it.scopeHost) {
              try { const u = new URL((await chrome.tabs.get(tabId)).url); if (!u.hostname.toLowerCase().includes((it.scopeHost||'').toLowerCase())) continue; } catch(e){ continue; }
            }
            let code = '';
            if (it && it.scriptId) {
              const blob = await bgGetFile(it.scriptId).catch(()=>null);
              if (blob) code = await blob.text().catch(()=>'');
            } else if (it && it.scriptBuiltin) {
              try { const res = await fetch(it.scriptBuiltin).catch(()=>null); if (res && res.ok) code = await res.text(); } catch(_){}
            }
            if (code && code.trim()) {
              try {
                await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: (src)=>{ const s=document.createElement('script'); s.textContent=src; (document.head||document.documentElement).appendChild(s); s.remove(); }, args:[code] });
              } catch(e){ console.warn('exec-all executeScript failed', e); }
            }
          } catch(e){ console.warn('exec-all item failed', e); }
        }
        sendResponse({ ok: true });
      } catch (e) { console.error('exec-all failed', e); sendResponse({ ok: false, error: String(e) }); }
    })();
    return true;
  }

  if (msg.type === 'exec-code') {
    const code = msg.code || '';
    (async () => {
      try {
        // หาว่า tab ที่ส่งมาคือ tab ไหน ถ้าไม่มี ให้ใช้ active tab
        let tabId = (sender && sender.tab && sender.tab.id) || null;
        if (!tabId) {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tabs && tabs[0]) tabId = tabs[0].id;
        }
        if (!tabId) {
          sendResponse({ ok: false, error: 'no-target-tab' });
          return;
        }

        // Inject script text into page MAIN world to avoid page CSP blocking blob urls
        try {
          const res = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            world: 'MAIN',
            func: (src) => {
              try {
                const s = document.createElement('script');
                s.textContent = src;
                (document.head || document.documentElement).appendChild(s);
                s.remove();
              } catch (e) {
                console.error('exec-code inject error', e);
              }
            },
            args: [code]
          });
          console.log('exec-code injected', { tabId, res });
          sendResponse({ ok: true });
        } catch (e) {
          console.error('exec-code executeScript failed', e);
          sendResponse({ ok: false, error: String(e) });
        }
      } catch (e) {
        console.error('exec-code failed', e);
        sendResponse({ ok: false, error: String(e) });
      }
    })();
    // indicate we'll call sendResponse asynchronously
    return true;
  }

  if (msg.type === 'broadcast' && msg.payload) {
    // forward payload to all tabs (content scripts will receive it)
    chrome.tabs.query({}, (tabs) => {
      for (const t of tabs) {
        try {
          chrome.tabs.sendMessage(t.id, msg.payload, (resp) => {
            if (chrome.runtime.lastError) {
              console.warn('broadcast sendMessage failed for tab', t.id, chrome.runtime.lastError.message);
            }
          });
        } catch (e) { console.warn('broadcast sendMessage exception', e); }
      }
    });
  }
});
