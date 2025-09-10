(function() {
  'use strict';
  const WIN = window;
  if (WIN.__GOONEE_CONSOLE2__) {
    try { WIN.GO2.toggle(); } catch(e){}
    return;
  }
  WIN.__GOONEE_CONSOLE2__ = true;

  const NS = 'goonee:console2';
  const KEY_SNIPPETS = NS + ':snippets_v1', KEY_LAYOUT = NS + ':layout_v1', KEY_THEME = NS + ':theme_v1', KEY_ERUDA = NS + ':eruda_on';

  const store = {
    read(key, fb) { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : (fb ?? null); } catch (e) { return fb ?? null; } },
    write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; } }
  };

  const THEMES = [
    { name: 'Matrix', accent: '#00ff40d7', accent2: '#00ec3bc9', accentText: '#001affff', bgPanel: 'rgba(0, 0, 0, 0.47)', bgInput: '#002200c2', bgOutput: '#025a3db6', status: '#00ff83' },
    { name: 'Cyan', accent: '#00e1ffcb', accent2: '#0077ffdc', accentText: '#ff0000ff', bgPanel: 'rgba(2, 8, 23, 0.63)', bgInput: '#013566b7', bgOutput: '#03305cb4', status: '#6dd6ff' },
    { name: 'Flame', accent: '#ff9900c2', accent2: '#ff5500be', accentText: '#ff0000ff', bgPanel: 'rgba(20, 10, 0, 0.56)', bgInput: '#4d3501', bgOutput: '#4e3700b6', status: '#ffcc66' },
    { name: 'Pink', accent: '#ff3d7ecb', accent2: '#b8095bd5', accentText: '#ff0073ff', bgPanel: 'rgba(23, 0, 12, 0.57)', bgInput: '#810038b7', bgOutput: '#470120b6', status: '#ff8ab3' }
  ];

  const host = document.createElement('div');
  Object.assign(host.style, { all: 'initial', position: 'fixed', zIndex: '2147483647', inset: 'auto 30px 30px auto' });
  const root = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host { all:initial; --accent:#00ff41;--accent2:#00cc33;--accentText:#00ffc3;--bgPanel:rgba(0,0,0,.96);--bgInput:#002200;--bgOutput:#001b12;--status:#00ff83; font-family:system-ui,-apple-system,sans-serif; }
    .gc2-launcher { position:fixed; width:54px; height:54px; border-radius:50%; background:var(--bgPanel); border:2px solid var(--accent); box-shadow:0 8px 24px rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; color:var(--accent); font-size:24px; cursor:pointer; touch-action:none; transition:transform .2s; }
    .gc2-launcher:hover { transform:scale(1.1); }
    .gc2-panel { position:fixed; top:10vh; left:10vw; width:80vw; height:70vh; min-width:280px; min-height:250px; background:var(--bgPanel); border:2px solid var(--accent); border-radius:12px; color:#e0e0e0; display:none; flex-direction:column; box-shadow:0 12px 40px rgba(0,0,0,.6); resize:both; overflow:hidden; }
    .gc2-header { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:linear-gradient(90deg,var(--accent),var(--accent2)); color:#001a0a; font-weight:700; user-select:none; cursor:move; flex-shrink:0; touch-action:none; }
    .gc2-title { display:flex; gap:8px; align-items:center; }
    .gc2-actions button { background:transparent; border:none; color:#001a0a; padding:4px; font-size:16px; font-weight:bold; cursor:pointer; }
    .gc2-toolbar { display:flex; gap:6px; flex-wrap:wrap; padding:6px 8px; border-bottom:1px solid var(--accent); background:rgba(0,0,0,.2); flex-shrink:0; }
    .gc2-tbtn { background:rgba(255,255,255,.08); border:1px solid var(--accent); color:var(--accentText); padding:4px 8px; border-radius:6px; font:600 12px/1.2 system-ui; cursor:pointer; }
    .gc2-tbtn:hover { background:rgba(255,255,255,.15); }
    .gc2-body { flex:1; display:flex; flex-direction:column; gap:6px; padding:8px; overflow:auto; }
    .gc2-label { color:var(--accentText); font-size:12px; font-weight:600; opacity:0.9; }
    .gc2-text { width:100%; flex:1; box-sizing:border-box; resize:none; background:var(--bgInput); border:1px solid var(--accent); border-radius:6px; color:#e0e0e0; padding:8px; font:13px/1.4 'SF Mono', Consolas, Menlo, monospace; }
    .gc2-output { width:100%; flex:0.7; white-space:pre-wrap; overflow:auto; background:var(--bgOutput); border:1px solid var(--accent); border-radius:6px; color:#bde0d5; padding:8px; font:13px/1.4 'SF Mono', Consolas, Menlo, monospace; }
    .gc2-footer { padding:6px 10px; border-top:1px solid var(--accent); color:var(--status); font:12px/1.2 system-ui; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; background:rgba(0,0,0,.2); }
    .gc2-badge { background:#062; color:#9cffb0; border:1px solid #0a4; padding:2px 6px; border-radius:999px; font:600 10px/1 system-ui; }
    @media (max-width:720px) { .gc2-panel{left:2vw;right:2vw;width:96vw;height:70vh;} }
      /* เพิ่ม resizer ขนาดใหญ่เพื่อกดง่ายขึ้น */
    .gc2-resizer {
      position: absolute;
      width: 28px;
      height: 28px;
      right: 6px;
      bottom: 6px;
      border-radius:6px;
      cursor: se-resize;
      background: linear-gradient(135deg, rgba(255,255,255,.04), transparent);
      z-index: 10;
      touch-action: none;
    }
  `;

  const launcher = document.createElement('div');
  launcher.className = 'gc2-launcher';
  launcher.title = 'Goonee Console';
  launcher.innerHTML = '⚡️';
  launcher.style.right = '30px';
  launcher.style.bottom = '30px';

  const panel = document.createElement('div');
  panel.className = 'gc2-panel';
  panel.innerHTML = `
    <div class="gc2-header" id="gc2Header">
      <div class="gc2-title"><span>🦈</span><span>กูนี่คอนโซล 2</span></div>
      <div class="gc2-actions"><button id="gc2Min" title="ย่อ">－</button><button id="gc2Close" title="ปิด">×</button></div>
    </div>
    <div class="gc2-toolbar">
      <button class="gc2-tbtn" id="gc2Run">▶ รัน</button><button class="gc2-tbtn" id="gc2Save">💾 บันทึก</button><button class="gc2-tbtn" id="gc2Load">⤴ โหลด</button><button class="gc2-tbtn" id="gc2Del">🗑 ลบ</button>
      <select class="gc2-tbtn" id="gc2Select" title="สคริปต์ที่บันทึก"></select>
      <button class="gc2-tbtn" id="gc2Theme">🎨 ธีม</button><button class="gc2-tbtn" id="gc2SaveLayout">💾 บันทึกตำแหน่ง</button><button class="gc2-tbtn" id="gc2Eruda">🧪 Eruda</button>
    </div>
    <div class="gc2-toolbar"><button class="gc2-tbtn" id="gc2UnlockForms">🔓 ปลดล็อคฟอร์ม</button><button class="gc2-tbtn" id="gc2EditPage">✏️ แก้ไขเว็บ</button><button class="gc2-tbtn" id="gc2SwKill">🧹 ล้าง SW</button></div>
    <div class="gc2-body">
      <div class="gc2-label">📋 โค้ด (Javascript)</div><textarea class="gc2-text" id="gc2Code" placeholder="javascript:alert('Hello from Goonee!')"></textarea>
      <div class="gc2-label">🧾 ผลลัพธ์</div><pre class="gc2-output" id="gc2Out"></pre>
    </div>
    <div class="gc2-footer"><div id="gc2Status">พร้อมใช้งาน</div><div id="gc2ThemeName" class="gc2-badge">Matrix</div></div>
  `;

  root.append(style, launcher, panel);
  document.documentElement.appendChild(host);

  const $ = sel => root.querySelector(sel);
  const setStatus = msg => { const el = $('#gc2Status'); if (el) el.textContent = String(msg); };
  const log = msg => {
    const out = $('#gc2Out'); if (!out) return;
    out.textContent += (typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2)) + "\n";
    out.scrollTop = out.scrollHeight;
  };

  const togglePanel = (show) => {
    const isVisible = panel.style.display === 'flex';
    const showState = show === undefined ? !isVisible : show;
    panel.style.display = showState ? 'flex' : 'none';
    launcher.style.display = showState ? 'none' : 'flex';
  };

  launcher.addEventListener('click', () => togglePanel(true));
  $('#gc2Min')?.addEventListener('click', () => togglePanel(false));
  $('#gc2Close')?.addEventListener('click', () => { host.remove(); WIN.__GOONEE_CONSOLE2__ = false; });

  const makeDraggable = (trigger, target) => {
    let activePointerId = -1, initialRect, sx, sy;
    const onPointerDown = e => {
        if (e.target.closest('button,select')) return;
        e.preventDefault();
        activePointerId = e.pointerId;
        initialRect = target.getBoundingClientRect();
        sx = e.clientX; sy = e.clientY;
        trigger.setPointerCapture(e.pointerId);
        WIN.addEventListener('pointermove', onPointerMove, { passive: false });
        WIN.addEventListener('pointerup', onPointerUp, { once: true });
        WIN.addEventListener('pointercancel', onPointerUp, { once: true });
    };
    const onPointerMove = e => {
        if (e.pointerId !== activePointerId) return;
        e.preventDefault();
        const dx = e.clientX - sx, dy = e.clientY - sy;
        let newLeft = Math.max(0, Math.min(initialRect.left + dx, WIN.innerWidth - initialRect.width));
        let newTop = Math.max(0, Math.min(initialRect.top + dy, WIN.innerHeight - initialRect.height));
        Object.assign(target.style, { left: newLeft + 'px', top: newTop + 'px', right: 'auto', bottom: 'auto' });
    };
    const onPointerUp = e => {
        if (e.pointerId !== activePointerId) return;
        activePointerId = -1;
        trigger.releasePointerCapture(e.pointerId);
        WIN.removeEventListener('pointermove', onPointerMove);
    };
    trigger.addEventListener('pointerdown', onPointerDown);
  };
 // ...existing code...
  makeDraggable(launcher, launcher);
  makeDraggable($('#gc2Header'), panel);

  // เพิ่ม resizer (พื้นที่จับขยายใหญ่ขึ้น) และ logic การลากเปลี่ยนขนาด
  const resizer = document.createElement('div');
  resizer.className = 'gc2-resizer';
  panel.appendChild(resizer);

  (function(){
    let activePointerId = -1, sx = 0, sy = 0, sw = 0, sh = 0;
    const onPointerDown = e => {
      e.preventDefault();
      activePointerId = e.pointerId;
      sx = e.clientX; sy = e.clientY;
      const r = panel.getBoundingClientRect();
      sw = r.width; sh = r.height;
      try { resizer.setPointerCapture(activePointerId); } catch(e){}
      WIN.addEventListener('pointermove', onPointerMove, { passive: false });
      WIN.addEventListener('pointerup', onPointerUp, { once: true });
      WIN.addEventListener('pointercancel', onPointerUp, { once: true });
    };
    const onPointerMove = e => {
      if (e.pointerId !== activePointerId) return;
      e.preventDefault();
      const dx = e.clientX - sx, dy = e.clientY - sy;
      const left = parseFloat(panel.style.left) || panel.getBoundingClientRect().left;
      const maxW = Math.max(200, Math.min(WIN.innerWidth - left, Math.round(sw + dx)));
      const maxH = Math.max(150, Math.min(WIN.innerHeight - (parseFloat(panel.style.top)||panel.getBoundingClientRect().top), Math.round(sh + dy)));
      panel.style.width = maxW + 'px';
      panel.style.height = maxH + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    };
    const onPointerUp = e => {
      if (e.pointerId !== activePointerId) return;
      activePointerId = -1;
      try { resizer.releasePointerCapture(e.pointerId); } catch(e){}
      WIN.removeEventListener('pointermove', onPointerMove);
    };
    resizer.addEventListener('pointerdown', onPointerDown);
  })();

  const applyTheme = t => {
      if (!t) return;
      Object.keys(t).forEach(k => k !== 'name' && host.style.setProperty(`--${k}`, t[k]));
      const el = $('#gc2ThemeName'); if(el) el.textContent = t.name;
  };
  $('#gc2Theme')?.addEventListener('click', () => {
      const current = host.style.getPropertyValue('--accent').trim();
      const idx = THEMES.findIndex(t => t.accent === current) ?? -1;
      const next = THEMES[(idx + 1) % THEMES.length];
      applyTheme(next); store.write(KEY_THEME, next); setStatus(`เปลี่ยนธีมเป็น ${next.name}`);
  });

  $('#gc2SaveLayout')?.addEventListener('click', () => {
      const r = panel.getBoundingClientRect();
      store.write(KEY_LAYOUT, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
      setStatus('บันทึกตำแหน่งและขนาดแล้ว');
  });

  const codeEl = $('#gc2Code'), snipSel = $('#gc2Select');
  const readSnips = () => store.read(KEY_SNIPPETS, []), writeSnips = list => store.write(KEY_SNIPPETS, list);
  function refreshSelect() {
    if (!snipSel) return;
    const list = readSnips(), prev = snipSel.value;
    snipSel.innerHTML = '';
    list.forEach((it, i) => { const o = document.createElement('option'); o.value=i; o.textContent=it.name||`สคริปต์ ${i+1}`; snipSel.add(o); });
    if (list.length > 0) snipSel.value = prev;
    if (snipSel.selectedIndex === -1 && snipSel.options.length > 0) snipSel.selectedIndex = 0;
    snipSel.dispatchEvent(new Event('change'));
  }
  snipSel?.addEventListener('change', () => {
      const list = readSnips(), idx = snipSel.selectedIndex;
      if (list[idx] && codeEl) codeEl.value = list[idx].code || '';
  });

  $('#gc2Run')?.addEventListener('click', () => {
      if (!codeEl) return;
      const code = codeEl.value.trim(); if (!code) return setStatus('ไม่มีโค้ดให้รัน');
      const src = code.startsWith('javascript:') ? code.slice(11) : code; setStatus('กำลังรัน...');
      try { const ret = (new Function(src))(); if (typeof ret !== 'undefined') log(ret); setStatus('รันโค้ดเสร็จสิ้น'); }
      catch (err) { log(err.stack || String(err)); setStatus('เกิดข้อผิดพลาด'); }
  });
  $('#gc2Save')?.addEventListener('click', () => {
      if (!codeEl) return;
      const code = codeEl.value.trim(); if (!code) return setStatus('ไม่มีโค้ดให้บันทึก');
      const name = prompt('ตั้งชื่อสคริปต์:', `สคริปต์ ${Date.now() % 1000}`); if (name === null) return setStatus('ยกเลิกการบันทึก');
      const list = readSnips(); list.push({ name: String(name || 'สคริปต์'), code });
      writeSnips(list); refreshSelect(); snipSel.value = list.length - 1;
      setStatus(`บันทึก "${name}" แล้ว`);
  });
  $('#gc2Del')?.addEventListener('click', () => {
      if (!snipSel || snipSel.selectedIndex < 0) return;
      const list = readSnips(), idx = snipSel.selectedIndex, target = list[idx];
      if (!target || !confirm(`ลบสคริปต์ "${target.name}"?`)) return setStatus('ยกเลิกการลบ');
      list.splice(idx, 1); writeSnips(list); refreshSelect(); if(codeEl) codeEl.value = '';
      setStatus(`ลบ "${target.name}" แล้ว`);
  });

  $('#gc2UnlockForms')?.addEventListener('click', () => {
      let count = 0;
      document.querySelectorAll('input,textarea,select,button').forEach(el => {
          if(el.disabled||el.readOnly){ el.disabled=false; el.readOnly=false; count++; }
      }); setStatus(`ปลดล็อค ${count} ฟอร์ม`);
  });
  $('#gc2EditPage')?.addEventListener('click', e => {
      const btn = e.target, isEditing = document.body.contentEditable === 'true';
      document.body.contentEditable = !isEditing;
      Object.assign(btn.style, { background: isEditing?'':'#00ff41', color: isEditing?'':'#001a0a' });
      setStatus(isEditing ? 'ปิดโหมดแก้ไขเว็บ' : 'เปิดโหมดแก้ไขเว็บ');
  });
  $('#gc2Eruda')?.addEventListener('click', async () => {
      setStatus('กำลังโหลด Eruda...');
      try {
          if (!WIN.eruda) await new Promise((res,rej) => { const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/eruda';s.onload=res;s.onerror=rej;document.head.append(s); });
          WIN.eruda.init(); WIN.eruda.show(); store.write(KEY_ERUDA, true); setStatus('Eruda พร้อมใช้งาน');
      } catch(err) { setStatus('โหลด Eruda ไม่สำเร็จ'); }
  });
  $('#gc2SwKill')?.addEventListener('click', async () => {
      if (!navigator.serviceWorker) return setStatus('ไม่รองรับ Service Worker');
      try { const regs=await navigator.serviceWorker.getRegistrations(), count=regs.length; await Promise.all(regs.map(r=>r.unregister())); setStatus(`ล้าง Service Worker ${count} ตัวสำเร็จ`); }
      catch (err) { setStatus('ล้าง SW ไม่สำเร็จ'); }
  });

  WIN.addEventListener('keydown', e => { if((e.ctrlKey||e.metaKey)&&e.key==='`'){togglePanel();e.preventDefault();} });

  WIN.GO2 = { open:()=>togglePanel(true), close:()=>togglePanel(false), toggle:togglePanel };

  (() => {
      applyTheme(store.read(KEY_THEME) || THEMES[0]);
      const layout = store.read(KEY_LAYOUT); if (layout) Object.assign(panel.style, layout);
      refreshSelect();
      if(store.read(KEY_ERUDA)) $('#gc2Eruda')?.click();
  })();

})();
