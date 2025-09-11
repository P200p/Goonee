// Front-end for GamblingAPI_lab.html
// Register SW if available
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw-gamble.js').then(reg => {
    logRaw('ServiceWorker registered');
  }).catch(err => logRaw('SW register failed: ' + err));
}

const $ = id => document.getElementById(id);
const rawLog = $('rawLog');
// Mobile helpers
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouch) document.body.classList.add('mobile');

// Swipe-to-spin configurable
const enableSwipeToSpin = true;
let touchStartY = null;

// Transaction history stored in localStorage for non-dev users
const HISTORY_KEY = 'gamble_lab_history_v1';
function loadHistory(){
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(hist){ localStorage.setItem(HISTORY_KEY, JSON.stringify(hist)); }
function addHistory(entry){ const h = loadHistory(); h.unshift(entry); saveHistory(h); renderHistory(); }
function clearHistory(){ localStorage.removeItem(HISTORY_KEY); renderHistory(); }
function renderHistory(){
  const el = $('historyList'); el.innerHTML='';
  const h = loadHistory();
  if (!h.length) { el.textContent = 'ไม่มีประวัติ'; return; }
  h.slice(0,200).forEach(it => {
    const row = document.createElement('div');
    row.style.padding='6px 4px'; row.style.borderBottom='1px solid #f0f0f0';
    row.textContent = `${new Date(it.ts).toLocaleString()} | ${it.user} | bet ${it.bet} | payout ${it.payout} | bal ${it.balance}`;
    el.appendChild(row);
  });
}

function downloadCsv(){
  const h = loadHistory();
  if (!h.length) return alert('ไม่มีประวัติให้ดาวน์โหลด');
  const rows = [['ts','user','bet','payout','balance']];
  h.forEach(r=>rows.push([new Date(r.ts).toISOString(), r.user, r.bet, r.payout, r.balance]));
  const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='gamble_history.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

$('loginBtn').addEventListener('click', async () => {
  const username = $('username').value.trim() || 'player1';
  try {
    const res = await apiFetch('/api/login', {method:'POST', body: JSON.stringify({username})});
    const data = await res.json();
    $('balance').textContent = data.balance;
    logRaw('login -> ' + JSON.stringify(data));
  } catch (err) { logRaw('login error: '+err); }
});

$('refreshBal').addEventListener('click', async () => {
  const user = $('username').value || 'player1';
  try {
    const res = await apiFetch('/api/balance?user=' + encodeURIComponent(user), {method:'GET'});
    const data = await res.json();
    $('balance').textContent = data.balance;
    logRaw('balance -> ' + JSON.stringify(data));
  } catch (err) { logRaw('balance error: '+err); }
});

$('spinBtn').addEventListener('click', async () => {
  const user = $('username').value || 'player1';
  const bet = Math.max(1, Math.min(1000, Number($('betInput').value || 1)));
  $('spinResult').textContent = 'กำลังหมุน...';
  try {
    // Simple retry example: 2 attempts if 429
    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      const res = await apiFetch('/api/spin', {method:'POST', body: JSON.stringify({username: user, bet})});
      if (res.status === 429) {
        logRaw('rate limited, retrying... attempt '+attempts);
        await delay(300 + attempts*200);
        continue;
      }
  const data = await res.json();
  showReels(data.reels);
  $('balance').textContent = data.balance;
  $('spinResult').textContent = data.payout >= 0 ? 'ชนะ ' + data.payout : 'แพ้ ' + Math.abs(data.payout);
  logRaw('spin -> ' + JSON.stringify(data));
  // save to history
  addHistory({ts: Date.now(), user, bet, payout: data.payout, balance: data.balance});
      break;
    }
  } catch (err) { logRaw('spin error: '+err); $('spinResult').textContent='error'; }
});

// Touch / swipe support for mobile
if (isTouch && enableSwipeToSpin) {
  document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) touchStartY = e.touches[0].clientY;
  }, {passive:true});

  document.addEventListener('touchend', (e) => {
    if (!touchStartY) return;
    const endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : null;
    if (endY === null) return;
    const dy = touchStartY - endY;
    // swipe up to spin
    if (dy > 60) {
      // prevent accidental double spin by disabling briefly
      $('spinBtn').disabled = true;
      $('spinBtn').classList.add('active');
      $('spinBtn').click();
      setTimeout(()=>{$('spinBtn').disabled=false; $('spinBtn').classList.remove('active');}, 1200);
    }
    touchStartY = null;
  }, {passive:true});
}

function showReels(reels){
  $('reels').textContent = reels.map(r => ['🍒','🍋','🔔','⭐','7️⃣','💎'][r] || '?').join(' ');
}

function apiFetch(path, opts = {}){
  // Small contract: automatically add API key header; learners can edit here
  const headers = new Headers(opts.headers || {});
  // Default API key — learners should try changing this to break auth
  headers.set('x-api-key', '<DEMO_KEY>');
  headers.set('Content-Type', 'application/json');

  const controller = new AbortController();
  const timeoutMs = 1200; // learners: try changing timeout
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  logRaw('REQUEST ' + path + ' headers: ' + JSON.stringify(Object.fromEntries(headers.entries())));
  const reqInit = {...opts, headers, signal: controller.signal};
  // Simulated interception hook: if devtools toggled, enqueue and wait for approval
  if (window.__devInterceptEnabled) {
    return new Promise((resolve, reject) => {
      const id = 'req_' + Date.now() + '_' + Math.floor(Math.random()*1000);
      const pending = {id, path, reqInit, resolve, reject};
      window.__devInterceptQueue = window.__devInterceptQueue || [];
      window.__devInterceptQueue.push(pending);
      // notify UI
      window.dispatchEvent(new CustomEvent('devtools:queueChanged'));
      // leave the promise unresolved until user acts in DevTools simulator
    });
  }
  return fetch(path, {...reqInit}).finally(() => clearTimeout(timeout));
}

// DevTools simulator plumbing
window.__devInterceptEnabled = false;
window.__devInterceptQueue = [];

function renderInterceptList(){
  const el = $('interceptList'); el.innerHTML = '';
  const q = window.__devInterceptQueue || [];
  if (!q.length) { el.textContent = 'No intercepted requests'; return; }
  q.forEach(item => {
    const row = document.createElement('div');
    row.style.padding='6px'; row.style.borderBottom='1px solid #222'; row.style.cursor='pointer';
    row.textContent = `${item.id} → ${item.path}`;
    row.onclick = ()=>selectIntercept(item.id);
    el.appendChild(row);
  });
}

let __selectedInterceptId = null;
function selectIntercept(id){ __selectedInterceptId = id; const item = window.__devInterceptQueue.find(x=>x.id===id); if (!item) return; $('editHeaders').value = JSON.stringify(Object.fromEntries(item.reqInit.headers.entries()), null, 2); try{ $('editBody').value = item.reqInit.body || ''; }catch{} }

// UI controls
$('toggleIntercept').addEventListener('change', (e)=>{ window.__devInterceptEnabled = e.target.checked; renderInterceptList(); });
window.addEventListener('devtools:queueChanged', renderInterceptList);

$('sendModified').addEventListener('click', async ()=>{
  if (!__selectedInterceptId) return alert('เลือกคำขอก่อน');
  const idx = window.__devInterceptQueue.findIndex(x=>x.id===__selectedInterceptId);
  if (idx<0) return alert('คำขอไม่พบ');
  const item = window.__devInterceptQueue.splice(idx,1)[0];
  // apply edits
  try{
    const hdrs = JSON.parse($('editHeaders').value || '{}');
    const body = $('editBody').value || item.reqInit.body;
    const headers = new Headers(); Object.entries(hdrs).forEach(([k,v])=>headers.set(k,v));
    const r = await fetch(item.path, {...item.reqInit, headers, body});
  const data = await r.json().catch(()=>({}));
  item.resolve(r);
  logRaw('DevTools sent modified: '+item.path+' → status '+r.status+' body:'+JSON.stringify(data));
  }catch(err){ item.reject(err); logRaw('DevTools send error: '+err); }
  __selectedInterceptId = null; renderInterceptList();
});

$('replayRequest').addEventListener('click', async ()=>{
  if (!__selectedInterceptId) return alert('เลือกคำขอก่อน');
  const idx = window.__devInterceptQueue.findIndex(x=>x.id===__selectedInterceptId);
  if (idx<0) return alert('คำขอไม่พบ');
  const item = window.__devInterceptQueue.splice(idx,1)[0];
  try{
  const r = await fetch(item.path, item.reqInit);
  const data = await r.json().catch(()=>({}));
  item.resolve(r);
  logRaw('DevTools replayed: '+item.path+' → status '+r.status+' body:'+JSON.stringify(data));
  }catch(err){ item.reject(err); logRaw('DevTools replay error: '+err); }
  __selectedInterceptId = null; renderInterceptList();
});

$('unlockApp').addEventListener('click', ()=>{ $('appOverlay').style.display='none'; logRaw('App unlocked via DevTools'); });

$('forgeSend').addEventListener('click', async ()=>{
  try{
    const path = $('forgePath').value||'/api/spin';
    const method = $('forgeMethod').value||'POST';
    const body = $('forgeBody').value||'';
    const r = await apiFetch(path, {method, body});
    const data = await r.json().catch(()=>({}));
    logRaw('Forged '+path+' → '+JSON.stringify(data));
  }catch(err){ logRaw('Forge error: '+err); }
});

// --- Scripts Library ---
const SCRIPTS = {
  autoSpin: {
    title: 'AutoSpin demo (5 spins)',
    code: `// AutoSpin: spin 5 times with current username and bet\n(async ()=>{\n  for(let i=0;i<5;i++){\n    const r = await apiFetch('/api/spin', {method:'POST', body: JSON.stringify({username: document.getElementById('username').value || 'player1', bet: Number(document.getElementById('betInput').value||10)})});\n    const d = await r.json();\n    console.log('spin', i+1, d);\n    await new Promise(r=>setTimeout(r,400));\n  }\n})();`,
    run: async ()=>{
      const log = $('scriptConsole'); log.textContent = '';
      for(let i=0;i<5;i++){
        log.textContent += `Spin ${i+1}...\n`;
        try{
          const r = await apiFetch('/api/spin', {method:'POST', body: JSON.stringify({username: $('username').value||'player1', bet: Number($('betInput').value||10)})});
          const d = await r.json();
          log.textContent += JSON.stringify(d) + '\n\n';
        }catch(err){ log.textContent += 'Error: '+err+'\n\n'; }
        await delay(400);
      }
    }
  },
  showHeaders: {
    title: 'Show current API headers',
  code: `// Show headers prepared by apiFetch\nconst h = new Headers(); h.set('x-api-key','<DEMO_KEY>'); console.log(Object.fromEntries(h.entries()));`,
  run: async ()=>{ const h = new Headers(); h.set('x-api-key','<DEMO_KEY>'); $('scriptConsole').textContent = JSON.stringify(Object.fromEntries(h.entries()), null, 2); }
  },
  interceptModify: {
    title: 'Intercept next request and modify header',
    code: `// This script toggles intercept and shows how to edit headers in DevTools simulator`,
    run: async ()=>{ $('toggleIntercept').checked = true; window.__devInterceptEnabled = true; $('scriptConsole').textContent = 'Interceptor enabled — next request will appear in DevTools list'; }
  }
};

$('runScript').addEventListener('click', async ()=>{
  const key = $('scriptSelect').value; const s = SCRIPTS[key]; if (!s) return; $('scriptConsole').textContent = 'Running: '+s.title+'\n'; await s.run(); });

$('showScript').addEventListener('click', ()=>{ const s = SCRIPTS[$('scriptSelect').value]; if (!s) return; $('scriptConsole').textContent = s.code; });



function logRaw(msg){
  const el = document.createElement('div');
  el.textContent = '['+new Date().toLocaleTimeString()+'] ' + msg;
  rawLog.prepend(el);
}

function delay(ms){return new Promise(r=>setTimeout(r,ms));}

// Auto-login on load for convenience
window.addEventListener('load', () => $('loginBtn').click());

// --- Bet controls wiring ---
$('betMinus').addEventListener('click', ()=>{ const b = Math.max(1, Number($('betInput').value||0)-1); $('betInput').value = b; });
$('betPlus').addEventListener('click', ()=>{ const b = Math.min(1000, Number($('betInput').value||0)+1); $('betInput').value = b; });
$('betInput').addEventListener('change', ()=>{ let v = Number($('betInput').value||0); if (!isFinite(v) || v<1) v=1; if (v>1000) v=1000; $('betInput').value = Math.floor(v); });

// Hook history buttons
$('downloadCsv').addEventListener('click', downloadCsv);
$('clearHistory').addEventListener('click', ()=>{ if (confirm('ลบประวัติทั้งหมด?')) clearHistory(); });

// Ensure history rendered on load
renderHistory();

// render intercept list on load
renderInterceptList();
