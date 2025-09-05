// @ts-nocheck
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
  // Removed unused flags to avoid lint warnings

  function ensureStyle(){
    const d=document;
    if (!d.querySelector('link[data-hc-style]')){
      const link=d.createElement('link');
      link.rel='stylesheet';
      // Use a non-conflicting stylesheet name; fallback CSS will also be injected to guarantee styling
      link.href= BASE_URL + 'go-style.css?t=' + Date.now();
      link.setAttribute('data-hc-style','1');
      link.onload = function(){ /* stylesheet loaded */ };
      link.onerror = function(){
        try { injectFallbackCSS(); } catch(_){ }
        console.warn('[HC] go-style.css failed to load, applied minimal inline styles as fallback');
      };
      d.head.appendChild(link);
      // Proactively ensure our scoped styles exist to avoid dependency on external CSS
      try { injectFallbackCSS(); } catch(_){ }
    }
  }

  function injectFallbackCSS(){
if (document.getElementById('__hc_fallback_css')) return;
const s = document.createElement('style');
s.id = '__hc_fallback_css';
s.textContent = `
  :root {
    --accent: #00ff41;
    --accent2: #00cc33;
    --accentText: #00ffc3;
    --bgPanel: rgba(0,0,0,.96);
    --bgInput: #002200;
    --bgOutput: #001b12;
    --status: #00ff83;
  }
  .go-matrix-bg {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: .08;
    z-index: 0;
  }
  .go-console-panel {
    position: fixed;
    top: 24px;
    left: 24px;
    width: 100px;
    height: 50px;
    background: var(--bgPanel);
    border: 2px solid var(--accent);
    border-radius: 5px;
    box-shadow: 0 8px 28px rgba(0,255,65,.25);
    z-index: 100000;
    min-width: 100px;
    min-height: 20px;
    overflow: auto;
    resize: both;
  }
  .go-console-header {
    background: linear-gradient(90deg,var(--accent),var(--accent2));
    color: #001a0a;
    padding: 4px 7px;
    cursor: move;
    display: flex;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    user-select: none;
    touch-action: none;
  }
  .go-console-controls { display:flex; gap: 12px; }
  .go-console-body {
    height: calc(100% - 40px);
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
  .go-toolbar {
    background: rgba(0,255,65,.08);
    padding: 2px;
    border-bottom: 0.5px solid var(--accent);
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .go-btn {
    background: rgba(0,255,65,.18);
    border: 0.5px solid var(--accent);
    color: var(--accentText);
    padding: 2px 2px;
    border-radius: 2px;
    cursor: pointer;
    font-size: 8px;
  }
  .go-btn:hover {
    background: rgba(0,255,65,.26);
  }
  .go-main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2px;
    gap: 3px;
    overflow: auto;
  }
  .go-section-title {
    color: #61ffa7;
    font-size: 5px;
    font-weight: 300;
  }
  .go-code-input {
    background: var(--bgInput);
    border: 1px solid var(--accent);
    color: #d6ffe8;
    padding: 8px;
    border-radius: 6px;
    font-size: 6px;
    min-height: 50px;
    max-height: 200px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    resize: vertical;
    overflow: auto;
  }
  .go-output {
    background: var(--bgOutput);
    border: 1px solid var(--accent);
    color: #aaffd6;
    padding: 8px;
    border-radius: 6px;
    font-size: 16px;
    white-space: pre-wrap;
    overflow: auto;
    min-height: 50px;
    max-height: 100px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    resize: vertical;
  }
  .go-status-bar {
    background: rgba(0,255,65,.08);
    padding: 2px 2px;
    border-top: 1px solid var(--accent);
    font-size: 11px;
    color: var(--status);
  }
  .go-resize-handle {
    position: absolute;
    width: 14px;
    height: 14px;
    background: linear-gradient(-45deg,transparent 40%,var(--accent) 40%,var(--accent) 60%,transparent 60%);
    touch-action: none;
  }
  #resizeSE { right: 0; bottom: 0; cursor: se-resize; }
  #resizeSW { left: 0;  bottom: 0; cursor: sw-resize; }
  #resizeNE { right: 0; top: 0;    cursor: ne-resize; }
  #resizeNW { left: 0;  top: 0;    cursor: nw-resize; }
  @media (max-width: 568px) {
    .go-console-panel {
      top: 2vh;
      left: 2vw;
      width: 96vw;
      height: 68vh;
    }
    .go-toolbar {
      gap: 2px;
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;
    }
    .go-btn {
      padding: 2px 2px;
      font-size: 7px;
    }
    .go-main-content {
      padding: 3px;
      gap: 3px;
    }
  }
`;
document.head.appendChild(s);
}


  function injectHTML(){
    const d=document;
    if (!d.getElementById('matrixCanvas')){
      const canvas=d.createElement('canvas');
      canvas.className='go-matrix-bg';
      canvas.id='matrixCanvas';
      d.body.appendChild(canvas);
    }

    if (d.getElementById('consolePanel')) return;

    const panel=d.createElement('div');
    panel.className='go-console-panel';
    panel.id='consolePanel';
    panel.innerHTML = `
      <div class="go-console-header" id="consoleHeader">
        <div class="go-console-title">
          <span>🔧</span>
          <span class="glitch">Hacker Console Mini</span>
        </div>
        <div class="go-console-controls">
          <button class="go-btn minimize" title="Minimize/Restore" onclick="minimizeConsole()">−</button>
          <button class="go-btn close" onclick="closeConsole()">×</button>
        </div>
      </div>
      <div class="go-console-body">
        <div class="go-toolbar">
          <button class="go-btn" onclick="runBookmarklet()">▶️ Run</button>
          <button class="go-btn" onclick="clearCode()">🧹 Clear</button>
          <button class="go-btn" onclick="copyOutput()">📋 Copy Output</button>
          <button class="go-btn" onclick="saveSnippet()">💾 Save Snippet</button>
          <button class="go-btn" onclick="randomTheme()">🎨 Random Theme</button>
          <button class="go-btn" onclick="saveLayout()">💾 Save Layout</button>
          <button class="go-btn" onclick="loadLayout()">⤴️ Load Layout</button>
          <button class="go-btn" onclick="resetConsole()">↺ Reset</button>
          <select class="go-btn" id="snippetSelect" title="Saved snippets"></select>
          <button class="go-btn" onclick="loadSnippet()">⤴️ Load</button>
          <button class="go-btn" onclick="deleteSnippet()">🗑️ Delete</button>
          <button class="go-btn" onclick="toggleEruda()">🧪 Eruda</button>
        </div>
        <div class="go-main-content">
          <div class="bookmarklet-section">
            <div class="go-section-title">📋 Bookmarklet Code</div>
            <textarea class="go-code-input" id="codeInput" placeholder="javascript:(function(){\n  // Your bookmarklet code here\n  alert('Hello from bookmarklet!');\n})();"></textarea>
          </div>
          <div class="bookmarklet-section">
            <div class="go-section-title">🧾 Output</div>
            <pre class="go-output" id="outputLog"></pre>
          </div>
        </div>
        <div class="go-status-bar">
          <span id="statusText">Ready • Drag to move • Resize from corners</span>
        </div>
      </div>
      <div class="go-resize-handle" id="resizeNW"></div>
      <div class="go-resize-handle" id="resizeNE"></div>
      <div class="go-resize-handle" id="resizeSW"></div>
      <div class="go-resize-handle" id="resizeSE"></div>
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
          panel.style.left = (drag.l+dx) + 'px';
          panel.style.top  = (drag.t+dy) + 'px';
        });
        header.addEventListener('pointerup', ()=>{ drag.on=false; });
        header.addEventListener('pointercancel', ()=>{ drag.on=false; });
      }

      // Multi-corner resize handles
      const setupHandle = (el, dir)=>{
        if (!el) return;
        let rs = {on:false, sx:0, sy:0, w:0, h:0, l:0, t:0};
        el.addEventListener('pointerdown', (e)=>{
          const ev = /** @type {any} */ (e);
          if (ev.button!==0) return;
          rs.on=true; rs.sx=ev.clientX; rs.sy=ev.clientY;
          const r=panel.getBoundingClientRect();
          rs.w=r.width; rs.h=r.height; rs.l=r.left; rs.t=r.top;
          try { el.setPointerCapture(ev.pointerId); } catch(_){ }
          e.preventDefault();
        });
        el.addEventListener('pointermove', (e)=>{
          const ev = /** @type {any} */ (e);
          e.preventDefault();
          if(!rs.on) return;
          const dx=ev.clientX-rs.sx, dy=ev.clientY-rs.sy;
          let newW = rs.w, newH = rs.h, newL = rs.l, newT = rs.t;
          const MIN_W = 100, MIN_H = 20;
          if (dir.includes('E')) newW = Math.max(MIN_W, rs.w + dx);
          if (dir.includes('S')) newH = Math.max(MIN_H, rs.h + dy);
          if (dir.includes('W')) { newW = Math.max(MIN_W, rs.w - dx); newL = rs.l + (rs.w - newW); }
          if (dir.includes('N')) { newH = Math.max(MIN_H, rs.h - dy); newT = rs.t + (rs.h - newH); }
          panel.style.width = newW + 'px';
          panel.style.height = newH + 'px';
          panel.style.left = newL + 'px';
          panel.style.top = newT + 'px';
        });
        el.addEventListener('pointerup', ()=>{ rs.on=false; });
        el.addEventListener('pointercancel', ()=>{ rs.on=false; });
      }
      setupHandle(panel.querySelector('#resizeSE'), 'SE');
      setupHandle(panel.querySelector('#resizeSW'), 'SW');
      setupHandle(panel.querySelector('#resizeNE'), 'NE');
      setupHandle(panel.querySelector('#resizeNW'), 'NW');
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
    const header = panel.querySelector('.go-console-header');
    const body = panel.querySelector('.go-console-body');
    const handles = panel.querySelectorAll('.go-resize-handle');
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
      handles && handles.forEach && handles.forEach(h=>{ if(h instanceof HTMLElement) h.style.display='none'; });
      if (header && header instanceof HTMLElement && panel instanceof HTMLElement) {
        panel.style.height = header.offsetHeight + 'px';
      }
      if (bg && bg instanceof HTMLElement) bg.style.display='none';
      panel.setAttribute('data-collapsed','1');
      if(status) status.textContent = 'Minimized';
    }else{
      if (body && body instanceof HTMLElement) body.style.display='block';
      handles && handles.forEach && handles.forEach(h=>{ if(h instanceof HTMLElement) h.style.display='block'; });
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
      const body = panel.querySelector('.go-console-body');
      const handles = panel.querySelectorAll('.go-resize-handle');
      if (body && body instanceof HTMLElement) body.style.display='block';
      handles && handles.forEach && handles.forEach(h=>{ if(h instanceof HTMLElement) h.style.display='block'; });
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
      const body = panel.querySelector('.go-console-body');
      const handles = panel.querySelectorAll('.go-resize-handle');
      if (body && body instanceof HTMLElement) body.style.display='block';
      handles && handles.forEach && handles.forEach(h=>{ if(h instanceof HTMLElement) h.style.display='block'; });
      // Default desktop size, mobile responsive handled by showConsole()
      panel.style.left = '24px';
      panel.style.top = '24px';
      panel.style.width = '420px';
      panel.style.height = '320px';
      const status = document.getElementById('statusText'); if(status) status.textContent = 'Reset to default';
    }catch(_){/* ignore */}
  }

  // Optional: layout persistence only on explicit actions
  const LAYOUT_KEY = 'hc_layout_v1';
  G.saveLayout = function(){
    const panel = document.getElementById('consolePanel');
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const data = {
      left: panel.style.left || (r.left + 'px'),
      top: panel.style.top || (r.top + 'px'),
      width: panel.style.width || (r.width + 'px'),
      height: panel.style.height || (r.height + 'px')
    };
    try{ localStorage.setItem(LAYOUT_KEY, JSON.stringify(data)); }catch(_){ }
    const status = document.getElementById('statusText'); if(status) status.textContent = 'Layout saved';
  }
  G.loadLayout = function(){
    
