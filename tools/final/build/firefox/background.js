// Firefox-compatible background script (Manifest V2)
console.log("Shark Tools Extension ติดตั้งเรียบร้อยแล้ว (Firefox)");

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
// Firefox uses different API
if (typeof browser !== 'undefined') {
  // Firefox WebExtensions API
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
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
                await browser.tabs.executeScript(tabId, {
                  code: code,
                  runAt: 'document_idle'
                });
              } catch(e){ console.warn('executeScript inject failed', e); }
            }
          } catch(e) { console.warn('item inject error', e); }
        }
      }
    } catch(e){ console.error('tabs.onUpdated handler failed', e); }
  });
} else if (typeof chrome !== 'undefined') {
  // Chrome API (fallback)
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
      if (changeInfo && changeInfo.status === 'complete' && tab && /^https?:/.test(tab.url || '')) {
        const items = await bgGetConfig().catch(()=>[]);
        for (const it of items || []) {
          try {
            if (!it || !it.autoRun) continue;
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
                chrome.tabs.executeScript(tabId, {
                  code: code,
                  runAt: 'document_idle'
                });
              } catch(e){ console.warn('executeScript inject failed', e); }
            }
          } catch(e) { console.warn('item inject error', e); }
        }
      }
    } catch(e){ console.error('tabs.onUpdated handler failed', e); }
  });
}

// รับคำสั่งจาก setting/content เพื่อรันโค้ดหรือกระจายข้อความ
const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;

runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
          const tabs = await (typeof browser !== 'undefined' ? 
            browser.tabs.query({ active: true, currentWindow: true }) :
            new Promise(resolve => chrome.tabs.query({ active: true, currentWindow: true }, resolve))
          );
          if (tabs && tabs[0]) tabId = tabs[0].id;
        }
        if (!tabId) { sendResponse({ ok: false, error: 'no-target-tab' }); return; }
        
        const items = await bgGetConfig().catch(()=>[]);
        for (const it of items || []) {
          try {
            if (!it || !it.autoRun) continue;
            if (it && it.scope === 'host' && it.scopeHost) {
              try { 
                const tabInfo = await (typeof browser !== 'undefined' ? 
                  browser.tabs.get(tabId) : 
                  new Promise(resolve => chrome.tabs.get(tabId, resolve))
                );
                const u = new URL(tabInfo.url); 
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
                if (typeof browser !== 'undefined') {
                  await browser.tabs.executeScript(tabId, { code: code });
                } else {
                  chrome.tabs.executeScript(tabId, { code: code });
                }
              } catch(e){ console.warn('exec-all executeScript failed', e); }
            }
          } catch(e){ console.warn('exec-all item failed', e); }
        }
        sendResponse({ ok: true });
      } catch (e) { 
        console.error('exec-all failed', e); 
        sendResponse({ ok: false, error: String(e) }); 
      }
    })();
    return true;
  }

  if (msg.type === 'exec-code') {
    const code = msg.code || '';
    (async () => {
      try {
        let tabId = (sender && sender.tab && sender.tab.id) || null;
        if (!tabId) {
          const tabs = await (typeof browser !== 'undefined' ? 
            browser.tabs.query({ active: true, currentWindow: true }) :
            new Promise(resolve => chrome.tabs.query({ active: true, currentWindow: true }, resolve))
          );
          if (tabs && tabs[0]) tabId = tabs[0].id;
        }
        if (!tabId) {
          sendResponse({ ok: false, error: 'no-target-tab' });
          return;
        }

        try {
          if (typeof browser !== 'undefined') {
            await browser.tabs.executeScript(tabId, { code: code });
          } else {
            chrome.tabs.executeScript(tabId, { code: code });
          }
          console.log('exec-code injected', { tabId });
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
    return true;
  }

  if (msg.type === 'broadcast' && msg.payload) {
    const tabs = typeof browser !== 'undefined' ? browser.tabs : chrome.tabs;
    tabs.query({}, (tabList) => {
      for (const t of tabList) {
        try {
          tabs.sendMessage(t.id, msg.payload, (resp) => {
            // Handle response if needed
          });
        } catch (e) { console.warn('broadcast sendMessage exception', e); }
      }
    });
  }
});