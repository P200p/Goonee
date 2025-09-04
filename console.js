// BookmarkletTool.js
(function(){
    // Determine base origin from current script so assets load cross-site
    const currentScript = document.currentScript || (function(){ const s=document.getElementsByTagName('script'); return s[s.length-1]; })();
    // Base directory URL (works for https:// and file://). Example: https://site/app/ -> used to resolve assets.
    const BASE_URL = (function(){
      try{
        const base = currentScript && currentScript.src ? new URL(currentScript.src, location.href) : new URL(location.href);
        // Return directory of the script
        return new URL('./', base).href.replace(/\/$/, '/')
      }catch(e){
        return '';
      }
    })();
  
    // Expose for other modules (e.g., main.js) to load sibling assets correctly
    try { window.__HC_BASE_URL = BASE_URL; } catch(_) {}
    // Flags derived from current script URL
    const SCRIPT_URL = (function(){ try{ return new URL(currentScript && currentScript.src ? currentScript.src : location.href, location.href); }catch(_){ return null; } })();
    const NOSW = !!(SCRIPT_URL && /(?:[?&])(nosw|no_sw|sw=0|noserviceworker)=1/i.test(SCRIPT_URL.search));
    const BASE_ORIGIN = (function(){ try{ return new URL(BASE_URL, location.href).origin; }catch(_){ return ''; } })();
    const SAME_ORIGIN = BASE_ORIGIN === location.origin;
  
    function ensureStyle(){
      const d=document;
      if (!d.querySelector('link[data-hc-style]')){
        const link=d.createElement('link');
        link.rel='stylesheet';
        link.href= BASE_URL + 'style.css?t=' + Date.now();
        link.setAttribute('data-hc-style','1');
        link.onload = function(){ /* stylesheet loaded */ };
        link.onerror = function(){
          // Fallback minimal styles if stylesheet cannot be loaded (e.g., CSP/file://)
          try { injectFallbackCSS(); } catch(_){ /* ignore */ }
          console.warn('[HC] style.css failed to load, applied minimal inline styles as fallback');
        };
        d.head.appendChild(link);
      }
    }
  
    function injectFallbackCSS(){
      if (document.getElementById('__hc_fallback_css')) return;
      const s = document.createElement('style');
      s.id='__hc_fallback_css';
      s.textContent = `
        :root{--accent:#00ff41;--accent2:#00cc33;--accentText:#00ffc3;--bgPanel:rgba(0,0,0,.96);--bgInput:#002200;--bgOutput:#001b12;--status:#00ff83}
        .matrix-bg{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;opacity:.08;z-index:0}
        .console-panel{position:fixed;top:24px;left:24px;width:420px;height:320px;background:var(--bgPanel);border:2px solid var(--accent);border-radius:10px;box-shadow:0 8px 28px rgba(0,255,65,.25);z-index:100000;min-width:280px;min-height:200px;overflow:auto}
        .console-header{background:linear-gradient(90deg,var(--accent),var(--accent2));color:#001a0a;padding:8px 10px;cursor:move;display:flex;gap:8px;justify-content:space-between;align-items:center;font-weight:600;user-select:none;touch-action:none}
        .console-body{height:calc(100% - 40px);display:flex;flex-direction:column;overflow:auto}
        .toolbar{background:rgba(0,255,65,.08);padding:6px;border-bottom:1px solid var(--accent);display:flex;gap:6px;flex-wrap:wrap}
        .btn{background:rgba(0,255,65,.18);border:1px solid var(--accent);color:var(--accentText);padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px}
        .btn:hover{background:rgba(0,255,65,.26)}
        .main-content{flex:1;display:flex;flex-direction:column;padding:4px;gap:4px;overflow:auto}
        .section-title{color:#61ffa7;font-size:7px;font-weight:300}
        .code-input{background:var(--bgInput); border:1px solid var(--accent);color:#d6ffe8;padding:8px;border-radius:6px;font-size:6px;min-height:50px;max-height:200px;width:100%;max-width:100%;box-sizing:border-box;resize:vertical;overflow:auto}
        .output{background:var(--bgOutput);border:1px solid var(--accent);color:#aaffd6;padding:8px;border-radius:6px;font-size:16px;white-space:pre-wrap;overflow:auto;min-height:50px;max-height:100px;width:100%;max-width:100%;box-sizing:border-box;resize:vertical}
        .status-bar{background:rgba(0,255,65,.08);padding:4px 8px;border-top:1px solid var(--accent);font-size:11px;color:var(--status)}
        .resize-handle{position:absolute;bottom:0;right:0;left:0;width:18px;height:18px;cursor:se-resize;background:linear-gradient(-45deg,transparent 40%,var(--accent) 40%,var(--accent) 60%,transparent 60%);touch-action:none}
        @media (max-width:568px){
          .console-panel{top:2vh;left:2vw;width:96vw;height:68vh}
          .toolbar{gap:3px;overflow-x:auto;white-space:nowrap;-webkit-overflow-scrolling:touch}
          .btn{padding:5px 6px;font-size:7px}
          .main-content{padding:3px;gap:3px}
        }
      `;
      document.head.appendChild(s);
    }
  
    function injectHTML(){
      const d=document;
      if (!d.getElementById('matrixCanvas')){
        const canvas=d.createElement('canvas');
        canvas.className='matrix-bg';
        canvas.id='matrixCanvas';
        d.body.appendChild(canvas);
      }
  
      if (d.getElementById('consolePanel')) return;
  
      const panel=d.createElement('div');
      panel.className='console-panel';
      panel.id='consolePanel';
      panel.innerHTML = `
        <div class="console-header" id="consoleHeader">
          <div class="console-title">
            <span>🔧</span>
            <span class="glitch">Hacker Console Mini</span>
          </div>
          <div class="console-controls">
            <button class="control-btn minimize" title="Minimize/Restore" onclick="minimizeConsole()">−</button>
            <button class="control-btn close" onclick="closeConsole()">×</button>
          </div>
        </div>
        <div class="console-body">
          <div class="toolbar">
            <button class="btn" onclick="runBookmarklet()">▶️ Run</button>
            <button class="btn" onclick="clearCode()">🧹 Clear</button>
            <button class="btn" onclick="copyOutput()">📋 Copy Output</button>
            <button class="btn" onclick="saveSnippet()">💾 Save Snippet</button>
            <button class="btn" onclick="randomTheme()">🎨 Random Theme</button>
            <select class="btn" id="snippetSelect" title="Saved snippets"></select>
            <button class="btn" onclick="loadSnippet()">⤴️ Load</button>
            <button class="btn" onclick="deleteSnippet()">🗑️ Delete</button>
            <button class="btn" onclick="toggleEruda()">🧪 Eruda</button>
          </div>
          <div class="main-content">
            <div class="bookmarklet-section">
              <div class="section-title">📋 Bookmarklet Code</div>
              <textarea class="code-input" id="codeInput" placeholder="javascript:(function(){\n  // Your bookmarklet code here\n  alert('Hello from bookmarklet!');\n})();"></textarea>
            </div>
            <div class="bookmarklet-section">
              <div class="section-title">🧾 Output</div>
              <pre class="output" id="outputLog"></pre>
            </div>
          </div>
          <div class="status-bar">
            <span id="statusText">Ready • Drag to move • Resize from corner</span>
          </div>
        </div>
        <div class="resize-handle" id="resizeHandle"></div>
      `;
      document.body.appendChild(panel);

      // Attach drag & resize handlers inline (no external deps)
      try{
        const header = panel.querySelector('#consoleHeader');
        let drag = {on:false, sx:0, sy:0, l:0, t:0};
        if (header) {
          header.addEventListener('pointerdown', (e)=>{
            if (e.target.tagName === 'BUTTON') return;
            const ev = /** @type {any} */ (e);
            if (ev.button!==0) return;
            drag.on=true; drag.sx=ev.clientX; drag.sy=ev.clientY;
            const r=panel.getBoundingClientRect(); drag.l=r.left; drag.t=r.top;
            try { header.setPointerCapture(ev.pointerId); } catch(_){ }
            e.preventDefault();
          });
          header.addEventListener('pointermove', (e)=>{
            const ev = /** @type {any} */ (e);
            e.preventDefault();
            if(!drag.on) return;
            const dx=ev.clientX-drag.sx, dy=ev.clientY-drag.sy;
            panel.style.left = Math.max(0, drag.l+dx) + 'px';
            panel.style.top  = Math.max(0, drag.t+dy) + 'px';
          });
          header.addEventListener('pointerup', ()=>{ drag.on=false; });
          header.addEventListener('pointercancel', ()=>{ drag.on=false; });
        }

        const handle = panel.querySelector('#resizeHandle');
        let rs = {on:false, sx:0, sy:0, w:0, h:0};
        if (handle) {
          handle.addEventListener('pointerdown', (e)=>{
            const ev = /** @type {any} */ (e);
            if (ev.button!==0) return;
            rs.on=true; rs.sx=ev.clientX; rs.sy=ev.clientY;
            const r=panel.getBoundingClientRect(); rs.w=r.width; rs.h=r.height;
            try { handle.setPointerCapture(ev.pointerId); } catch(_){ }
            e.preventDefault();
          });
          handle.addEventListener('pointermove', (e)=>{
            const ev = /** @type {any} */ (e);
            e.preventDefault();
            if(!rs.on) return;
            const dx=ev.clientX-rs.sx, dy=ev.clientY-rs.sy;
            panel.style.width = Math.max(280, rs.w+dx) + 'px';
            panel.style.height = Math.max(200, rs.h+dy) + 'px';
          });
          handle.addEventListener('pointerup', ()=>{ rs.on=false; });
          handle.addEventListener('pointercancel', ()=>{ rs.on=false; });
        }
      }catch(_){ /* ignore */ }
    }
  
    function getPanel(){ return document.getElementById('consolePanel'); }
  
    function showConsole(){
      const panel=getPanel();
      if (panel){
        panel.style.display='block';
        try{ initPanelExtras(); }catch(_){ }
        return;
      }
      ensureStyle();
      injectHTML();
      try{ initPanelExtras(); }catch(_){ }
      // After creation, also apply mobile size if needed
      try{
        const p = getPanel();
        if (p && window.innerWidth <= 768){
          p.style.width = '96vw';
          p.style.height = '68vh';
          p.style.left = '2vw';
          p.style.top = '2vh';
        }
      }catch(_){ /* ignore */ }
    }
  
    function hideConsole(){
      const panel=getPanel();
      if (panel){ panel.style.display='none'; }
    }
  
    function toggleConsole(){
      const panel=getPanel();
      if (!panel){ showConsole(); return; }
      panel.style.display = (panel.style.display==='none' || getComputedStyle(panel).display==='none') ? 'block' : 'none';
      if (panel.style.display==='block') panel.focus();
    }
  
    // Public API
    window.launchConsole = showConsole;
    window.showConsole = showConsole;
    window.hideConsole = hideConsole;
    window.toggleConsole = toggleConsole;
  
    // Keyboard shortcut: Ctrl+`
    if (!window.__hcShortcutBound){
      window.__hcShortcutBound = true;
      window.addEventListener('keydown', function(e){
        if ((e.ctrlKey || e.metaKey) && e.key === '`'){
          e.preventDefault();
          toggleConsole();
        }
      });
    }
  
    // Minimal helpers for I/O
    function logOutput(msg){
      try{
        const out = document.getElementById('outputLog');
        if (!out) return;
        const line = (typeof msg === 'string') ? msg : JSON.stringify(msg, null, 2);
        out.textContent += (line + '\n');
        out.scrollTop = out.scrollHeight;
      }catch(_){/* noop */}
    }
    // Typed global alias to satisfy TS checks for properties on window
    const G = /** @type {any} */ (window);

    G.copyOutput = function(){
      const out = document.getElementById('outputLog');
      if (!out) return;
      const t = out.textContent || '';
      navigator.clipboard.writeText(t).then(()=>{
        const s=document.getElementById('statusText'); if(s){ s.textContent='Output copied to clipboard'; }
      }).catch(()=>{
        try{
          const ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }catch(_){/* ignore */}
      });
    }

    // Bookmarklet actions and simple panel controls
    G.runBookmarklet = function(){
      try{
        const ta = document.getElementById('codeInput');
        const status = document.getElementById('statusText');
        let code = '';
        if (ta instanceof HTMLTextAreaElement) { code = ta.value.trim(); }
        if (!code) { if(status) status.textContent = 'No code to run'; return; }
        if(status) status.textContent = 'Running…';
        // Support code that is a full bookmarklet starting with javascript:
        const src = code.startsWith('javascript:') ? code.slice('javascript:'.length) : code;
        // Evaluate in page context
        try {
          // eslint-disable-next-line no-eval
          const ret = eval(src);
          if (typeof ret !== 'undefined') { logOutput(ret); }
          if(status) status.textContent = 'Done';
        } catch(err){
          logOutput(err && err.stack ? err.stack : String(err));
          if(status) status.textContent = 'Error';
        }
      }catch(err){
        logOutput(err && err.stack ? err.stack : String(err));
      }
    }

    G.clearCode = function(){
      const ta = document.getElementById('codeInput');
      const out = document.getElementById('outputLog');
      const status = document.getElementById('statusText');
      if (ta instanceof HTMLTextAreaElement) { ta.value = ''; }
      if (out) { out.textContent = ''; }
      if (status) { status.textContent = 'Cleared'; }
    }

    G.minimizeConsole = function(){
      const panel = document.getElementById('consolePanel');
      if (!panel) return;
      const header = panel.querySelector('.console-header');
      const body = panel.querySelector('.console-body');
      const handle = panel.querySelector('#resizeHandle');
      const bg = document.getElementById('matrixCanvas');
      const isCollapsed = panel.getAttribute('data-collapsed')==='1';
      const status = document.getElementById('statusText');
      if (!isCollapsed){
        if (panel instanceof HTMLElement) {
          // Save previous size (fallback to computed if inline empty)
          if (!panel.dataset.prevW){
            panel.dataset.prevW = panel.style.width || (panel.getBoundingClientRect().width + 'px');
          }
          if (!panel.dataset.prevH){
            panel.dataset.prevH = panel.style.height || (panel.getBoundingClientRect().height + 'px');
          }
        }
        if (body && body instanceof HTMLElement) body.style.display='none';
        if (handle && handle instanceof HTMLElement) handle.style.display='none';
        if (header && header instanceof HTMLElement && panel instanceof HTMLElement) {
          panel.style.height = header.offsetHeight + 'px';
        }
        if (bg && bg instanceof HTMLElement) bg.style.display='none';
        panel.setAttribute('data-collapsed','1');
        if(status) status.textContent = 'Minimized';
      }else{
        if (body && body instanceof HTMLElement) body.style.display='block';
        if (handle && handle instanceof HTMLElement) handle.style.display='block';
        panel.removeAttribute('data-collapsed');
        if (panel instanceof HTMLElement){
          if (panel.dataset.prevW) { panel.style.width = panel.dataset.prevW; delete panel.dataset.prevW; }
          if (panel.dataset.prevH) { panel.style.height = panel.dataset.prevH; delete panel.dataset.prevH; }
        }
        if (bg && bg instanceof HTMLElement) bg.style.display='block';
        if(status) status.textContent = 'Restored';
      }
    }

    G.maximizeConsole = function(){
      const panel = document.getElementById('consolePanel');
      if (!panel) return;
      try{
        const wasCollapsed = panel.getAttribute('data-collapsed')==='1';
        const body = panel.querySelector('.console-body');
        const handle = panel.querySelector('#resizeHandle');
        if (body && body instanceof HTMLElement) body.style.display='block';
        if (handle && handle instanceof HTMLElement) handle.style.display='block';
        panel.removeAttribute('data-collapsed');
        if (wasCollapsed && panel instanceof HTMLElement) {
          // Restore previous size if we have it; otherwise go fullscreen
          if (panel.dataset.prevW) panel.style.width = panel.dataset.prevW;
          if (panel.dataset.prevH) panel.style.height = panel.dataset.prevH;
        }
        // Ensure panel is within viewport
        if (!panel.style.width || !panel.style.height) {
          panel.style.left = '0';
          panel.style.top = '0';
          panel.style.width = '100vw';
          panel.style.height = '100vh';
        }
      }catch(_){/* ignore */}
      const status = document.getElementById('statusText'); if(status) status.textContent = 'Maximized';
    }

    // Reset position/size to defaults (no localStorage)
    G.resetConsole = function(){
      const panel = document.getElementById('consolePanel');
      if (!panel) return;
      try{
        panel.removeAttribute('data-collapsed');
        const body = panel.querySelector('.console-body');
        const handle = panel.querySelector('#resizeHandle');
        if (body && body instanceof HTMLElement) body.style.display='block';
        if (handle && handle instanceof HTMLElement) handle.style.display='block';
        // Default desktop size, mobile responsive handled by showConsole()
        panel.style.left = '24px';
        panel.style.top = '24px';
        panel.style.width = '420px';
        panel.style.height = '320px';
        const status = document.getElementById('statusText'); if(status) status.textContent = 'Reset to default';
      }catch(_){/* ignore */}
    }

    // Snippet management (localStorage)
    const SNIP_KEY = 'hc_snippets_v1';
    function readSnips(){
      try{ return JSON.parse(localStorage.getItem(SNIP_KEY) || '[]'); }catch(_){ return []; }
    }
    function writeSnips(list){
      try{ localStorage.setItem(SNIP_KEY, JSON.stringify(list)); }catch(_){ }
    }
    function refreshSnippetSelect(){
      const sel = document.getElementById('snippetSelect');
      if (!sel) return;
      if (!(sel instanceof HTMLSelectElement)) return;
      const list = readSnips();
      const prevIndex = sel.selectedIndex;
      sel.innerHTML = '';
      list.forEach((it, idx)=>{
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = it.name || ('Snippet '+(idx+1));
        sel.appendChild(opt);
      });
      if (list.length > 0){
        sel.selectedIndex = (prevIndex >= 0 && prevIndex < list.length) ? prevIndex : 0;
      }
    }
    G.saveSnippet = function(){
      const ta = document.getElementById('codeInput');
      if (!(ta instanceof HTMLTextAreaElement)) return;
      const code = ta.value.trim();
      if (!code) return;
      let name = prompt('Snippet name?', 'My Snippet');
      if (name === null) { // user cancelled
        const status = document.getElementById('statusText'); if(status) status.textContent = 'Save cancelled';
        return;
      }
      name = String(name).trim();
      if (!name) name = 'My Snippet';
      const list = readSnips();
      list.push({name, code});
      writeSnips(list);
      refreshSnippetSelect();
      // Select the newly saved snippet and sync to textarea
      const sel = document.getElementById('snippetSelect');
      if (sel instanceof HTMLSelectElement){
        sel.selectedIndex = Math.max(0, list.length - 1);
      }
      ta.value = code;
      const status = document.getElementById('statusText'); if(status) status.textContent = 'Snippet saved';
    }
    G.deleteSnippet = function(){
      const sel = document.getElementById('snippetSelect');
      const ta = document.getElementById('codeInput');
      if (!(sel instanceof HTMLSelectElement)) return;
      const list = readSnips();
      const idx = sel.selectedIndex >= 0 ? sel.selectedIndex : 0;
      if (!list.length || !list[idx]){ const s=document.getElementById('statusText'); if(s) s.textContent='No snippet to delete'; return; }
      const target = list[idx];
      const ok = confirm(`Delete snippet "${target.name || ('Snippet '+(idx+1))}" ?`);
      if (!ok) { const s=document.getElementById('statusText'); if(s) s.textContent='Delete cancelled'; return; }
      list.splice(idx, 1);
      writeSnips(list);
      refreshSnippetSelect();
      // Adjust selection
      if (sel.options.length){ sel.selectedIndex = Math.min(idx, sel.options.length - 1); }
      // Sync textarea to new selection or clear if none
      if (ta instanceof HTMLTextAreaElement){
        if (sel.options.length){
          const i = sel.selectedIndex;
          const l2 = readSnips();
          ta.value = (l2[i] && l2[i].code) ? l2[i].code : '';
        } else {
          ta.value = '';
        }
      }
      const status = document.getElementById('statusText'); if(status) status.textContent = 'Snippet deleted';
    }
    G.loadSnippet = function(){
      const sel = document.getElementById('snippetSelect');
      const ta = document.getElementById('codeInput');
      if (!(sel instanceof HTMLSelectElement) || !(ta instanceof HTMLTextAreaElement)) return;
      const list = readSnips();
      let idx = parseInt(sel.value, 10);
      if (isNaN(idx)) idx = (sel.selectedIndex >= 0 ? sel.selectedIndex : 0);
      if (list.length && !list[idx] && idx === 0) idx = 0;
      if (!isNaN(idx) && list[idx]){
        ta.value = list[idx].code || '';
        const status = document.getElementById('statusText'); if(status) status.textContent = 'Snippet loaded';
      }
    }

    // Theme randomizer (persist only theme)
    const THEME_KEY = 'hc_theme_v1';
    const THEMES = [
      {accent:'#00ff41',accent2:'#00cc33',accentText:'#00ffc3',bgPanel:'rgba(0,0,0,.96)',bgInput:'#002200',bgOutput:'#001b12',status:'#00ff83'},
      {accent:'#00e1ff',accent2:'#0077ff',accentText:'#b8f3ff',bgPanel:'rgba(2,8,23,.96)',bgInput:'#001a33',bgOutput:'#001326',status:'#6dd6ff'},
      {accent:'#ff9900',accent2:'#ff5500',accentText:'#ffe0b3',bgPanel:'rgba(20,10,0,.96)',bgInput:'#261a00',bgOutput:'#1a1200',status:'#ffcc66'},
      {accent:'#ff3d7f',accent2:'#a71d5d',accentText:'#ffd1e6',bgPanel:'rgba(23,0,12,.96)',bgInput:'#330016',bgOutput:'#260011',status:'#ff8ab3'}
    ];
    function applyThemeVars(panel, t){
      if (!(panel instanceof HTMLElement)) return;
      panel.style.setProperty('--accent', t.accent);
      panel.style.setProperty('--accent2', t.accent2);
      panel.style.setProperty('--accentText', t.accentText);
      panel.style.setProperty('--bgPanel', t.bgPanel);
      panel.style.setProperty('--bgInput', t.bgInput);
      panel.style.setProperty('--bgOutput', t.bgOutput);
      panel.style.setProperty('--status', t.status);
    }
    function readTheme(){ try{ return JSON.parse(localStorage.getItem(THEME_KEY)||'null'); }catch(_){ return null; } }
    function writeTheme(t){ try{ localStorage.setItem(THEME_KEY, JSON.stringify(t)); }catch(_){ } }
    G.randomTheme = function(){
      const panel = document.getElementById('consolePanel');
      if (!panel) return;
      const t = THEMES[Math.floor(Math.random()*THEMES.length)];
      applyThemeVars(panel, t);
      writeTheme(t); // persist only theme
      const status = document.getElementById('statusText'); if(status) status.textContent = 'Theme applied';
    }

    // Lazy Eruda integration (not loaded by default)
    const ERUDA_KEY = 'hc_eruda_on';
    const ERUDA_URL = (window && /** @type {any} */(window).ERUDA_URL) || 'https://cdn.jsdelivr.net/npm/eruda@3/eruda.min.js';
    function isErudaLoaded(){ return typeof /** @type {any} */(window).eruda !== 'undefined'; }
    /** @returns {Promise<void>} */
    function loadEruda(){
      return new Promise((resolve, reject)=>{
        if (isErudaLoaded()) { resolve(undefined); return; }
        const id='__hc_eruda_loader';
        if (document.getElementById(id)){
          const chk=setInterval(()=>{ if(isErudaLoaded()){ clearInterval(chk); resolve(undefined); } }, 80);
          setTimeout(()=>{ clearInterval(chk); isErudaLoaded()?resolve(undefined):reject(new Error('Eruda timeout')); }, 10000);
          return;
        }
        const s=document.createElement('script'); s.id=id; s.src=ERUDA_URL; s.async=true;
        s.onload=()=> resolve(undefined);
        s.onerror=()=> reject(new Error('Failed to load Eruda'));
        document.documentElement.appendChild(s);
      });
    }
    function setErudaState(on){ try{ localStorage.setItem(ERUDA_KEY, on?'1':'0'); }catch(_){ } }
    function getErudaState(){ try{ return localStorage.getItem(ERUDA_KEY)==='1'; }catch(_){ return false; } }
    G.toggleEruda = async function(){
      const status = document.getElementById('statusText');
      try{
        if (!isErudaLoaded()){
          if (status) status.textContent = 'Loading Eruda…';
          await loadEruda();
          /** @type {any} */(window).eruda && /** @type {any} */(window).eruda.init();
        }
        const E = /** @type {any} */(window).eruda;
        if (!E) return;
        const visible = E._devTools && E._devTools._isShow; // internal but works
        if (visible) { E.hide(); setErudaState(false); if(status) status.textContent='Eruda hidden'; }
        else { E.show(); setErudaState(true); if(status) status.textContent='Eruda shown'; }
      }catch(err){ if(status) status.textContent='Eruda error'; }
    }

    // Init helpers when panel is shown/created
    function initPanelExtras(){
      const panel = document.getElementById('consolePanel');
      if (!panel) return;
      // Apply saved theme if any
      const t = readTheme();
      if (t) applyThemeVars(panel, t);
      // Populate snippets
      refreshSnippetSelect();
      // Bind change -> auto-fill code input from selected snippet
      try{
        const sel = document.getElementById('snippetSelect');
        const ta = document.getElementById('codeInput');
        if (sel instanceof HTMLSelectElement && ta instanceof HTMLTextAreaElement){
          sel.addEventListener('change', function(){
            const list = readSnips();
            const i = sel.selectedIndex;
            if (i >= 0 && list[i]){ ta.value = list[i].code || ''; }
          });
        }
      }catch(_){ /* ignore */ }
      // Ensure touch-action none on draggable elements
      const header = panel.querySelector('#consoleHeader');
      const handle = panel.querySelector('#resizeHandle');
      if (header && header instanceof HTMLElement) header.style.touchAction='none';
      if (handle && handle instanceof HTMLElement) handle.style.touchAction='none';
      // Restore eruda visibility if saved on
      try{
        if (getErudaState()){
          loadEruda().then(()=>{ const E=/** @type {any} */(window).eruda; if(E){ E.init(); E.show(); } });
        }
      }catch(_){ }
    }

    G.closeConsole = function(){
      const panel = document.getElementById('consolePanel');
      if (!panel) return;
      panel.style.display = 'none';
      const status = document.getElementById('statusText'); if(status) status.textContent = 'Closed';
    }
  
    // Auto open if requested via data-auto or ?auto=1
    const auto = (currentScript && currentScript.getAttribute && currentScript.getAttribute('data-auto')==='1') ||
                 (currentScript && currentScript.src && /[?&]auto=1/.test(currentScript.src)) ||
                 (typeof window.HC_AUTO!== 'undefined' && !!window.HC_AUTO);
    if (auto){ showConsole(); }
})();
