(function(){
  'use strict';
  // Goonee Console v2 - Floating Launcher -> Expandable Panel (mobile + PC)
  // Single-file, Shadow DOM, no external deps. Safe to inject via bookmarklet/userscript/extension.

  const WIN = window;
  if (WIN.__GOONEE_CONSOLE2__) return; // singleton
  WIN.__GOONEE_CONSOLE2__ = true;

  // Namespaced storage keys
  const NS = 'goonee:console2';
  const KEY_SNIPPETS = NS + ':snippets_v1';
  const KEY_LAYOUT = NS + ':layout_v1';
  const KEY_THEME = NS + ':theme_v1';
  const KEY_ERUDA = NS + ':eruda_on';

  // Simple storage abstraction with backup
  const store = {
    read(key, fallback){
      try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : (fallback ?? null); } catch(_){ return fallback ?? null; }
    },
    write(key, value){
      try {
        const json = JSON.stringify(value);
        localStorage.setItem(key, json);
        // keep a backup copy
        localStorage.setItem(key+':bak', json);
        return true;
      } catch(_){ return false; }
    },
    backup(key){
      try { const s = localStorage.getItem(key+':bak'); return s ? JSON.parse(s) : null; } catch(_){ return null; }
    }
  };

  // --- THEME DEFINITIONS (from console.js) ---
  const THEMES = [
    {accent:'#00ff41',accent2:'#00cc33',accentText:'#00ffc3',bgPanel:'rgba(0,0,0,.96)',bgInput:'#002200',bgOutput:'#001b12',status:'#00ff83'},
    {accent:'#00e1ff',accent2:'#0077ff',accentText:'#b8f3ff',bgPanel:'rgba(2,8,23,.96)',bgInput:'#001a33',bgOutput:'#001326',status:'#6dd6ff'},
    {accent:'#ff9900',accent2:'#ff5500',accentText:'#ffe0b3',bgPanel:'rgba(20,10,0,.96)',bgInput:'#261a00',bgOutput:'#1a1200',status:'#ffcc66'},
    {accent:'#ff3d7f',accent2:'#a71d5d',accentText:'#ffd1e6',bgPanel:'rgba(23,0,12,.96)',bgInput:'#330016',bgOutput:'#260011',status:'#ff8ab3'}
  ];

  // Shadow DOM root
  const host = document.createElement('div');
  host.id = 'goonee-console2-host';
  host.style.all = 'initial';
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647';
  host.style.inset = 'auto 16px 16px auto';
  const root = host.attachShadow({ mode: 'open' });

  // CSS inside shadow
  const style = document.createElement('style');
  style.textContent = `
    :host{ all: initial;
      --accent: #00ff41; --accent2: #00cc33; --accentText: #00ffc3;
      --bgPanel: rgba(0,0,0,.96); --bgInput: #002200; --bgOutput: #001b12; --status: #00ff83;
    }
    .gc2-launcher{ position: fixed; right: 16px; bottom: 16px; width: 54px; height: 54px; border-radius: 50%;
      background: var(--bgPanel); border: 2px solid var(--accent); box-shadow: 0 8px 24px rgba(0,255,65,.35);
      display:flex; align-items:center; justify-content:center; color:var(--accent); font: 600 20px/1 system-ui, -apple-system, Segoe UI, Roboto; cursor: pointer; touch-action:none; }
    .gc2-launcher:hover{ transform: translateY(-1px); }

    .gc2-panel{ position: fixed; right: 2vw; bottom: 2vh; width: min(96vw, 540px); height: min(72vh, 520px);
      background: var(--bgPanel); border: 2px solid var(--accent); border-radius: 10px; color: #d6ffe8;
      display: none; flex-direction: column; box-shadow: 0 12px 40px rgba(0,255,65,.28); resize: both; overflow: auto; min-width: 280px; min-height: 200px; }
    .gc2-header{ display:flex; align-items:center; justify-content:space-between; padding: 8px 10px;
      background: linear-gradient(90deg,var(--accent),var(--accent2)); color:#001a0a; font-weight:700; user-select:none; cursor: move; flex-shrink: 0; }
    .gc2-title{ display:flex; gap:8px; align-items:center; }
    .gc2-actions{ display:flex; gap:6px; align-items:center; }
    .gc2-btn{ background: rgba(0,0,0,.05); border: 1px solid #0a3; color:#001a0a; padding: 4px 8px; border-radius: 6px; font: 600 12px/1 system-ui; cursor:pointer; }

    .gc2-toolbar{ display:flex; gap:6px; flex-wrap:wrap; padding:6px; border-bottom:1px solid var(--accent); background: rgba(0,255,65,.08); flex-shrink: 0; }
    .gc2-tbtn{ background: rgba(0,255,65,.18); border: 1px solid var(--accent); color:var(--accentText); padding: 4px 8px; border-radius: 6px; font: 600 12px/1 system-ui; cursor:pointer; }

    .gc2-body{ flex:1; display:flex; flex-direction:column; gap:6px; padding:6px; overflow: auto; }
    .gc2-label{ color:#61ffa7; font: 600 12px/1 system-ui; flex-shrink: 0; }
    .gc2-text{ width:100%; flex: 1; box-sizing: border-box; resize: none;
      background: var(--bgInput); border: 1px solid var(--accent); border-radius: 6px; color:#d6ffe8; padding:8px; font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .gc2-output{ width:100%; flex: 1; white-space: pre-wrap; overflow:auto; background:var(--bgOutput); border:1px solid var(--accent); border-radius:6px; color:#aaffd6; padding:8px; font: 12px/1.4 ui-monospace, monospace; }

    .gc2-footer{ padding:6px 8px; border-top:1px solid var(--accent); color:var(--status); font: 12px/1.2 system-ui; display:flex; justify-content:space-between; align-items:center; flex-shrink: 0; }
    .gc2-badge{ background:#062; color:#9cffb0; border:1px solid #0a4; padding:2px 6px; border-radius:999px; font: 600 10px/1 system-ui; }

    @media (max-width: 720px){ .gc2-panel{ left: 2vw; right: 2vw; width: 96vw; height: 70vh; } }
  `;

  // DOM structure
  const launcher = document.createElement('button');
  launcher.className = 'gc2-launcher';
  launcher.title = 'Goonee Console';
  launcher.textContent = '⚡';

  const panel = document.createElement('div');
  panel.className = 'gc2-panel';

  panel.innerHTML = `
    <div class="gc2-header" id="gc2Header">
      <div class="gc2-title"><span>🦈</span><span>Goonee Console 2</span></div>
      <div class="gc2-actions">
        <button class="gc2-btn" id="gc2Min">—</button>
        <button class="gc2-btn" id="gc2Close">×</button>
      </div>
    </div>
    <div class="gc2-toolbar">
      <button class="gc2-tbtn" id="gc2Run">▶ Run</button>
      <button class="gc2-tbtn" id="gc2Save">💾 Save</button>
      <button class="gc2-tbtn" id="gc2Load">⤴ Load</button>
      <button class="gc2-tbtn" id="gc2Del">🗑 Delete</button>
      <button class="gc2-tbtn" id="gc2Export">📤 Export</button>
      <button class="gc2-tbtn" id="gc2Import">📥 Import</button>
      <button class="gc2-tbtn" id="gc2Theme">🎨 Theme</button>
       <button class="gc2-tbtn" id="gc2SaveLayout">💾 Save Layout</button>
       <button class="gc2-tbtn" id="gc2LoadLayout">⤴️ Load Layout</button>
      <button class="gc2-tbtn" id="gc2Eruda">🧪 Eruda</button>
      <button class="gc2-tbtn" id="gc2SwKill">🧹 SW Kill</button>
      <select class="gc2-tbtn" id="gc2Select" title="Saved snippets"></select>
    </div>
    <div class="gc2-body">
        <div class="gc2-label">📋 Code</div>
        <textarea class="gc2-text" id="gc2Code" placeholder="javascript:(()=>{ alert('Hello from Goonee!') })()"></textarea>
        <div class="gc2-label">🧾 Output</div>
        <pre class="gc2-output" id="gc2Out"></pre>
        <div class="gc2-label">💡 Tips</div>
        <div class="gc2-output" style="min-height:40px; flex-grow: 0;" id="gc2Tips">Ctrl+~ to toggle • Drag header to move • Resize from corners</div>
    </div>
    <div class="gc2-footer">
      <div id="gc2Status">Ready</div>
      <div class="gc2-badge">Goonee</div>
    </div>
  `;

  root.appendChild(style);
  root.appendChild(launcher);
  root.appendChild(panel);
  document.documentElement.appendChild(host);

  // Helpers
  const $ = sel => root.querySelector(sel);
  function setStatus(msg){ const el = $('#gc2Status'); if (el) el.textContent = String(msg); }
  function log(msg){ const out = $('#gc2Out'); if (out) out.textContent += (typeof msg==='string'? msg : JSON.stringify(msg, null, 2)) + "\n"; }

  // Drag launcher (pointer events)
  (function dragLauncher(){
    let drag = {on:false, sx:0, sy:0, r:0, b:0};
    launcher.addEventListener('pointerdown', e=>{
      const ev = /** @type {PointerEvent} */(e);
      drag.on=true; drag.sx=ev.clientX; drag.sy=ev.clientY;
      const rect = host.getBoundingClientRect();
      drag.r = window.innerWidth - rect.right; // right inset
      drag.b = window.innerHeight - rect.bottom; // bottom inset
      try{ launcher.setPointerCapture(ev.pointerId); }catch(_){ }
      e.preventDefault();
    });
    launcher.addEventListener('pointermove', e=>{
      if (!drag.on) return;
      const ev = /** @type {PointerEvent} */(e);
      const dx = ev.clientX - drag.sx;
      const dy = ev.clientY - drag.sy;
      const newRight = Math.max(8, drag.r - dx);
      const newBottom = Math.max(8, drag.b - dy);
      host.style.right = newRight + 'px';
      host.style.bottom = newBottom + 'px';
    });
    const stop=()=>{ drag.on=false; };
    launcher.addEventListener('pointerup', stop); launcher.addEventListener('pointercancel', stop);
  })();

  // Toggle panel
  function openPanel(){ panel.style.display = 'flex'; launcher.style.display = 'none'; setStatus('Opened'); }
  function closePanel(){ panel.style.display = 'none'; launcher.style.display = 'flex'; setStatus('Minimized'); }
  launcher.addEventListener('click', openPanel);
  $('#gc2Min')?.addEventListener('click', closePanel);
  $('#gc2Close')?.addEventListener('click', ()=>{ host.remove(); WIN.__GOONEE_CONSOLE2__ = false; });

  // Move panel via header (within viewport)
  (function dragPanel(){
    const header = $('#gc2Header'); if (!header) return;
    let drag = {on:false, sx:0, sy:0, l:0, t:0};
    header.addEventListener('pointerdown', e=>{
      const ev = /** @type {PointerEvent} */(e);
      if ((ev.target instanceof HTMLElement) && ev.target.tagName === 'BUTTON') return;
      drag.on=true; drag.sx=ev.clientX; drag.sy=ev.clientY;
      const r = panel.getBoundingClientRect(); drag.l = r.left; drag.t = r.top;
      try{ header.setPointerCapture(ev.pointerId); }catch(_){ }
      e.preventDefault();
    });
    header.addEventListener('pointermove', e=>{
      if (!drag.on) return; const ev = /** @type {PointerEvent} */(e);
      const dx = ev.clientX - drag.sx; const dy = ev.clientY - drag.sy;
      const nl = Math.min(Math.max(0, drag.l + dx), window.innerWidth - 80);
      const nt = Math.min(Math.max(0, drag.t + dy), window.innerHeight - 80);
      panel.style.right = 'auto'; panel.style.bottom = 'auto';
      panel.style.left = nl + 'px';
      panel.style.top = nt + 'px';
    });
    const stop=()=>{ drag.on=false; };
    header.addEventListener('pointerup', stop); header.addEventListener('pointercancel', stop);
  })();

  // --- THEME LOGIC ---
  function applyTheme(theme) {
    if (!theme) return;
    host.style.setProperty('--accent', theme.accent);
    host.style.setProperty('--accent2', theme.accent2);
    host.style.setProperty('--accentText', theme.accentText);
    host.style.setProperty('--bgPanel', theme.bgPanel);
    host.style.setProperty('--bgInput', theme.bgInput);
    host.style.setProperty('--bgOutput', theme.bgOutput);
    host.style.setProperty('--status', theme.status);
  }
  $('#gc2Theme')?.addEventListener('click', ()=>{
    const currentTheme = store.read(KEY_THEME) || THEMES[0];
    const currentIndex = THEMES.findIndex(t => t.accent === currentTheme.accent);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const newTheme = THEMES[nextIndex];
    applyTheme(newTheme);
    store.write(KEY_THEME, newTheme);
    setStatus('Theme changed');
  });
  
  // --- LAYOUT PERSISTENCE ---
  $('#gc2SaveLayout')?.addEventListener('click', ()=>{
      const r = panel.getBoundingClientRect();
      const layout = { left: panel.style.left, top: panel.style.top, width: r.width + 'px', height: r.height + 'px' };
      store.write(KEY_LAYOUT, layout);
      setStatus('Layout saved');
  });
  $('#gc2LoadLayout')?.addEventListener('click', ()=>{
      const layout = store.read(KEY_LAYOUT);
      if (layout) {
          panel.style.left = layout.left;
          panel.style.top = layout.top;
          panel.style.width = layout.width;
          panel.style.height = layout.height;
          setStatus('Layout loaded');
      }
  });

  // Snippets model
  function readSnips(){ return store.read(KEY_SNIPPETS, []); }
  function writeSnips(list){ store.write(KEY_SNIPPETS, list); }
  function refreshSelect(){
    const sel = /** @type {HTMLSelectElement|null} */($('#gc2Select')); if (!sel) return;
    const list = readSnips(); const prev = sel.selectedIndex;
    sel.innerHTML = '';
    list.forEach((it, i)=>{ const o = document.createElement('option'); o.value = String(i); o.textContent = it.name || ('Snippet '+(i+1)); sel.appendChild(o); });
    if (list.length) sel.selectedIndex = Math.max(0, Math.min(prev, list.length-1));
  }

  // Autosave (debounced)
  let saveTmr = 0; const codeEl = /** @type {HTMLTextAreaElement|null} */($('#gc2Code'));
  function scheduleAutosave(){
    if (!codeEl) return; const code = codeEl.value;
    clearTimeout(saveTmr); saveTmr = setTimeout(()=>{
      // Save into a special autosave slot index 0, shift older ones
      const list = readSnips();
      if (list.length && list[0] && list[0].__autosave) { list[0].code = code; }
      else { list.unshift({name:'(autosave)', code, __autosave:true}); }
      writeSnips(list); refreshSelect(); setStatus('Autosaved');
    }, 500);
  }
  codeEl?.addEventListener('input', scheduleAutosave);

  // Toolbar actions
  $('#gc2Run')?.addEventListener('click', ()=>{
    const ta = /** @type {HTMLTextAreaElement|null} */($('#gc2Code')); const status = $('#gc2Status'); if (!ta) return;
    const src = String(ta.value||'').trim(); if (!src){ setStatus('No code'); return; }
    const code = src.startsWith('javascript:') ? src.slice('javascript:'.length) : src;
    try{ /* eslint-disable no-eval */ const ret = eval(code); if (typeof ret !== 'undefined') log(ret); setStatus('Done'); }
    catch(err){ log(err && err.stack ? err.stack : String(err)); setStatus('Error'); }
  });

  $('#gc2Save')?.addEventListener('click', ()=>{
    const ta = /** @type {HTMLTextAreaElement|null} */($('#gc2Code')); if (!ta) return;
    const code = String(ta.value||'').trim(); if (!code){ setStatus('Nothing to save'); return; }
    const name = prompt('Snippet name?', 'My Snippet'); if (name === null) { setStatus('Save cancelled'); return; }
    const list = readSnips(); list.push({name: String(name||'My Snippet'), code}); writeSnips(list); refreshSelect(); setStatus('Saved');
  });

  $('#gc2Load')?.addEventListener('click', ()=>{
    const sel = /** @type {HTMLSelectElement|null} */($('#gc2Select')); const ta = /** @type {HTMLTextAreaElement|null} */($('#gc2Code'));
    if (!sel || !ta) return; const list = readSnips(); let idx = parseInt(sel.value, 10); if (isNaN(idx)) idx = sel.selectedIndex;
    if (list[idx]){ ta.value = list[idx].code||''; setStatus('Loaded'); }
  });

  $('#gc2Del')?.addEventListener('click', ()=>{
    const sel = /** @type {HTMLSelectElement|null} */($('#gc2Select')); if (!sel) return; const list = readSnips();
    let idx = parseInt(sel.value, 10); if (isNaN(idx)) idx = sel.selectedIndex; if (!list[idx]){ setStatus('No snippet'); return; }
    const target = list[idx]; if (!confirm(`Delete "${target.name||('Snippet '+(idx+1))}" ?`)){ setStatus('Delete cancelled'); return; }
    list.splice(idx,1); writeSnips(list); refreshSelect(); setStatus('Deleted');
  });

  $('#gc2Export')?.addEventListener('click', ()=>{
    const data = JSON.stringify(readSnips(), null, 2);
    const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='goonee-console2-snippets.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
    setStatus('Exported');
  });

  $('#gc2Import')?.addEventListener('click', ()=>{
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = ()=>{
      const f = inp.files && inp.files[0]; if (!f) return;
      const r = new FileReader(); r.onload = ()=>{
        try{ const list = JSON.parse(String(r.result||'[]')); if (Array.isArray(list)){ writeSnips(list); refreshSelect(); setStatus('Imported'); } else setStatus('Invalid JSON'); }
        catch(_){ setStatus('Invalid JSON'); }
      }; r.readAsText(f);
    };
    inp.click();
  });

  // --- ERUDA INTEGRATION ---
  const ERUDA_URL = (WIN && WIN.ERUDA_URL) || 'https://cdn.jsdelivr.net/npm/eruda@3/eruda.min.js';
  function isErudaLoaded(){ return typeof WIN.eruda !== 'undefined'; }
  async function loadEruda(){
    if (isErudaLoaded()) return;
    return new Promise((resolve, reject)=>{
        const s=document.createElement('script'); s.src=ERUDA_URL; s.async=true;
        s.onload=()=> resolve(); s.onerror=()=> reject(new Error('Failed to load Eruda'));
        document.documentElement.appendChild(s);
    });
  }
  $('#gc2Eruda')?.addEventListener('click', async ()=>{
      try {
          setStatus('Loading Eruda…');
          await loadEruda();
          WIN.eruda.init();
          const visible = WIN.eruda._devTools._isShow;
          if (visible) { WIN.eruda.hide(); store.write(KEY_ERUDA, false); setStatus('Eruda hidden'); }
          else { WIN.eruda.show(); store.write(KEY_ERUDA, true); setStatus('Eruda shown'); }
      } catch(err) { setStatus('Eruda failed to load'); }
  });

  $('#gc2SwKill')?.addEventListener('click', async ()=>{
    try{
      if (!('serviceWorker' in navigator)){ setStatus('No SW support'); return; }
      const regs = await navigator.serviceWorker.getRegistrations();
      let n=0; for (const r of regs){ const ok = await r.unregister(); if (ok) n++; }
      setStatus(`SW unregistered: ${n}`);
    }catch(_){ setStatus('SW kill failed'); }
  });

  // Hotkey Ctrl+`
  window.addEventListener('keydown', (e)=>{
    if ((e.ctrlKey || e.metaKey) && e.key === '`'){
      const vis = panel.style.display !== 'none' && panel.style.display !== '' ? true : false;
      vis ? closePanel() : openPanel();
      e.preventDefault();
    }
  }, { capture: true });

  // Public API for programmatic control
  try {
    /** @type {any} */(window).GO2 = {
      open: openPanel,
      close: closePanel,
      toggle: function(){
        const vis = panel.style.display !== 'none' && panel.style.display !== '' ? true : false;
        vis ? closePanel() : openPanel();
      }
    };
  } catch(_) { /* ignore */ }

  // --- INITIALIZATION ---
  function init() {
    // Apply saved theme
    const savedTheme = store.read(KEY_THEME);
    if (savedTheme) {
      applyTheme(savedTheme);
    }
    
    // Apply saved layout
    const savedLayout = store.read(KEY_LAYOUT);
    if (savedLayout) {
        panel.style.left = savedLayout.left;
        panel.style.top = savedLayout.top;
        panel.style.width = savedLayout.width;
        panel.style.height = savedLayout.height;
    }

    // Populate snippets dropdown
    refreshSelect();

    // Load autosaved code into textarea if present
    const snippets = readSnips();
    if (snippets.length > 0 && snippets[0].__autosave) {
        const codeEl = /** @type {HTMLTextAreaElement|null} */($('#gc2Code'));
        if (codeEl) codeEl.value = snippets[0].code || '';
    }
    
    // Restore Eruda if it was on
    if (store.read(KEY_ERUDA)) {
        $('#gc2Eruda')?.click();
    }
    
    setStatus('Ready • Tap ⚡');
  }

  init();
})();
