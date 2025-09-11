// generate_gcwin_multi.js
// สร้างหน้า Landing หลายสไตล์จากโฟลเดอร์ web/<brand>/
// เอาต์พุต:
// - gc_pages_multi/<style>/<brand>/index.html (หน้าแบรนด์ตามสไตล์)
// - gc_styles_index.html (หน้ารวม ชี้ไปยังทุกสไตล์/แบรนด์)

const fs = require('fs').promises;
const path = require('path');

const ROOT = __dirname;
const WEB_DIR = path.join(ROOT, 'web');
const OUT_ROOT = path.join(ROOT, 'gc_pages_multi');
const STYLES = ['minimal', 'matrix', 'glass', 'hero'];
const STYLES_INDEX = path.join(ROOT, 'gc_styles_index.html');

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

async function getBrandFolders() {
  const entries = await fs.readdir(WEB_DIR, { withFileTypes: true });
  return entries.filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name).sort((a,b)=>a.localeCompare(b));
}

async function readSignupUrl(brand) {
  try {
    const url = (await fs.readFile(path.join(WEB_DIR, brand, 'signup.txt'), 'utf8')).trim();
    return url || '#';
  } catch { return '#'; }
}

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// ---------- Templates ----------
function tpl_minimal(brand, url){
  return `<!DOCTYPE html>
<html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(brand)} - เริ่มต้นใช้งาน</title>
<meta name="robots" content="noindex,follow" />
<style>
 :root{--bg:#0b0c10;--card:#12141a;--accent:#14b8a6;--accent2:#22d3ee;--txt:#e5e7eb;--muted:#9ca3af}
 *{box-sizing:border-box}html,body{height:100%;margin:0}
 body{background:radial-gradient(1200px 800px at 50% -10%,rgba(20,184,166,.08),transparent 60%),radial-gradient(1000px 600px at 120% 120%,rgba(34,211,238,.08),transparent 60%),var(--bg);color:var(--txt);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial;display:grid;place-items:center;padding:24px}
 .card{max-width:560px;width:100%;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:32px 24px 28px;box-shadow:0 10px 35px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.06);backdrop-filter:blur(6px);text-align:center}
 .logo{width:72px;height:72px;border-radius:16px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:inline-grid;place-items:center;color:#001010;font-weight:900;letter-spacing:.5px;font-size:22px;margin-bottom:14px;box-shadow:0 10px 30px rgba(20,184,166,.35)}
 h1{font-size:22px;margin:4px 0 8px}p{margin:0;color:var(--muted);font-size:14px}
 .cta{display:inline-flex;gap:10px;align-items:center;justify-content:center;padding:14px 22px;border-radius:999px;border:none;cursor:pointer;background:linear-gradient(90deg,var(--accent),var(--accent2));color:#001010;font-weight:800;letter-spacing:.3px;font-size:16px;margin-top:18px;text-decoration:none;box-shadow:0 10px 30px rgba(34,211,238,.3);transition:transform .15s,filter .15s,box-shadow .15s}
 .cta:hover{transform:translateY(-1px);filter:brightness(1.05);box-shadow:0 12px 38px rgba(34,211,238,.38)}
 .divider{height:1px;background:rgba(255,255,255,.08);margin:20px 0 14px}.foot{font-size:12px;color:var(--muted)}
</style></head>
<body><main class="card">
 <div class="logo">${escapeHtml(brand[0] || 'G')}</div>
 <h1>${escapeHtml(brand)}</h1>
 <p>กดปุ่มด้านล่างเพื่อเริ่มต้นใช้งาน</p>
 <a class="cta" href="${escapeHtml(url)}" target="_blank" rel="noopener">เริ่มต้นใช้งาน</a>
 <div class="divider"></div>
 <div class="foot">อัปเดตจากโฟลเดอร์ web/${escapeHtml(brand)}</div>
</main></body></html>`;
}

function tpl_matrix(brand, url){
  return `<!DOCTYPE html>
<html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(brand)} - Matrix</title>
<style>
 body{margin:0;background:linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 50%,#16213e 100%);color:#00ff41;font-family:'Orbitron',monospace;min-height:100vh;display:grid;place-items:center;overflow:hidden}
 .wrap{position:relative;z-index:1;border:2px solid #00ff41;border-radius:14px;padding:24px 20px;background:rgba(0,0,0,.85);box-shadow:0 0 30px rgba(0,255,65,.18);text-align:center;max-width:640px;margin:24px}
 h1{margin:0 0 8px;font-size:22px;letter-spacing:1px;color:#00ccff;text-shadow:0 0 8px #00ccff99}
 p{margin:0 0 14px;color:#7ee787}
 .cta{display:inline-block;background:linear-gradient(45deg,#00ff41,#00ccff);color:#000;padding:10px 26px;border-radius:999px;font-weight:800;text-decoration:none;box-shadow:0 0 18px #00ff41cc}
 .cta:hover{filter:brightness(1.1)}
 .matrix{position:fixed;inset:0;z-index:0;pointer-events:none}
 .col{position:absolute;top:-100px;color:#00ff41;opacity:.6;animation:fall linear infinite;font-size:14px}
 @keyframes fall{0%{transform:translateY(-100px);opacity:1}100%{transform:translateY(100vh);opacity:0}}
</style></head>
<body>
 <div class="matrix" id="mx"></div>
 <section class="wrap">
  <h1>${escapeHtml(brand)}</h1>
  <p>โหมด Matrix Terminal</p>
  <a class="cta" href="${escapeHtml(url)}" target="_blank" rel="noopener">เริ่มต้นใช้งาน</a>
 </section>
 <script>
  (function(){const m=document.getElementById('mx');const chars='01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
    for(let i=0;i<48;i++){const d=document.createElement('div');d.className='col';d.style.left=(Math.random()*100)+'%';const du=(Math.random()*3+2).toFixed(2);const de=(Math.random()*2).toFixed(2);d.style.animationDuration=du+'s';d.style.animationDelay=de+'s';let t='';for(let j=0;j<20;j++){t+=chars[Math.floor(Math.random()*chars.length)]+'<br>'}d.innerHTML=t;m.appendChild(d);} })();
 </script>
</body></html>`;
}

function tpl_glass(brand, url){
  return `<!DOCTYPE html>
<html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(brand)} - Glass</title>
<style>
 body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(120deg,#0e0e10,#0a1a22 60%,#0b2230);color:#e5e7eb;font-family:Inter,ui-sans-serif,system-ui}
 .card{width:min(680px,92vw);background:rgba(255,255,255,.06);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:28px 26px;box-shadow:0 20px 60px rgba(0,0,0,.45)}
 .head{display:flex;gap:16px;align-items:center}
 .logo{width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,#60a5fa,#34d399);display:grid;place-items:center;font-weight:900;color:#001010}
 h1{margin:4px 0 2px;font-size:22px}
 .muted{color:#a1a1aa;font-size:13px;margin:0}
 .cta{display:inline-block;margin-top:16px;background:#34d399;color:#001510;text-decoration:none;font-weight:800;border-radius:12px;padding:12px 18px;box-shadow:0 10px 22px rgba(52,211,153,.35)}
 .cta:hover{filter:brightness(1.06)}
</style></head>
<body>
 <article class="card">
  <div class="head">
   <div class="logo">${escapeHtml(brand[0]||'G')}</div>
   <div>
     <h1>${escapeHtml(brand)}</h1>
     <p class="muted">หน้าโปร่งใสแบบ Glassmorphism</p>
   </div>
  </div>
  <a class="cta" href="${escapeHtml(url)}" target="_blank" rel="noopener">เริ่มต้นใช้งาน</a>
 </article>
</body></html>`;
}

function tpl_hero(brand, url){
  return `<!DOCTYPE html>
<html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(brand)} - Hero</title>
<style>
 body{margin:0;font-family:Inter,ui-sans-serif,system-ui;color:#e5e7eb}
 .hero{min-height:100vh;display:grid;grid-template-columns:1.1fr .9fr}
 .left{padding:8vh 8vw;background:radial-gradient(800px 600px at -10% -10%,rgba(99,102,241,.25),transparent 60%),#0b0c10}
 h1{font-size:clamp(28px,3.2vw,40px);margin:0 0 10px}
 p{margin:0;color:#a1a1aa}
 .cta{display:inline-block;margin-top:18px;background:#6366f1;color:white;text-decoration:none;font-weight:800;border-radius:12px;padding:12px 18px;box-shadow:0 16px 30px rgba(99,102,241,.35)}
 .right{background:linear-gradient(180deg,#0d1320,#061018);display:grid;place-items:center}
 .badge{border:1px dashed rgba(255,255,255,.2);padding:18px 22px;border-radius:16px;opacity:.9}
</style></head>
<body>
 <section class="hero">
  <div class="left">
    <h1>${escapeHtml(brand)}</h1>
    <p>สไตล์ Hero Split เรียบง่ายสำหรับแคมเปญ</p>
    <a class="cta" href="${escapeHtml(url)}" target="_blank" rel="noopener">เริ่มต้นใช้งาน</a>
  </div>
  <div class="right"><div class="badge">web/${escapeHtml(brand)}</div></div>
 </section>
</body></html>`;
}

function buildByStyle(style, brand, url){
  switch(style){
    case 'minimal': return tpl_minimal(brand, url);
    case 'matrix': return tpl_matrix(brand, url);
    case 'glass': return tpl_glass(brand, url);
    case 'hero': return tpl_hero(brand, url);
    default: return tpl_minimal(brand, url);
  }
}

function buildStylesIndex(items){
  // items: { style, brand, rel }
  const groups = STYLES.map(st => ({ style: st, items: items.filter(i=>i.style===st) }));
  return `<!DOCTYPE html>
<html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>GC Styles Index</title>
<style>
 body{margin:0;background:#0b0c10;color:#e5e7eb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto}
 header{padding:20px;border-bottom:1px solid #1f2937;display:flex;align-items:center;gap:12px}
 .dot{width:12px;height:12px;border-radius:999px;background:#22d3ee;box-shadow:0 0 18px rgba(34,211,238,.6)}
 h1{margin:0;font-size:18px}
 main{padding:18px 20px 28px;max-width:1100px;margin:0 auto}
 h2{margin:16px 4px 10px;color:#a1a1aa;font-size:13px;text-transform:uppercase;letter-spacing:.18em}
 .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
 .item{background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.015));border:1px solid #1f2937;border-radius:12px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center}
 .brand{font-weight:700}
 .go{background:#22d3ee;color:#001010;text-decoration:none;padding:8px 12px;border-radius:10px;font-weight:800}
 footer{color:#9ca3af;font-size:12px;padding:12px 20px 20px;text-align:center}
</style></head>
<body>
 <header><div class="dot"></div><h1>GC Pages – Styles</h1></header>
 <main>
   ${groups.map(g=>`<section><h2>${g.style}</h2><div class=\"grid\">${g.items.map(it=>`<div class=\"item\"><div class=\"brand\">${escapeHtml(it.brand)}</div><a class=\"go\" href=\"${escapeHtml(it.rel)}\">เปิด</a></div>`).join('')}</div></section>`).join('')}
 </main>
 <footer>สร้างอัตโนมัติจากโฟลเดอร์ web/* — ไม่แก้ไฟล์ใน <code>web/</code></footer>
</body></html>`;
}

async function main(){
  const brands = await getBrandFolders();
  await ensureDir(OUT_ROOT);
  const collected = [];

  for (const style of STYLES){
    const styleDir = path.join(OUT_ROOT, style);
    await ensureDir(styleDir);
    for (const brand of brands){
      const brandDir = path.join(styleDir, brand);
      await ensureDir(brandDir);
      const url = await readSignupUrl(brand);
      const html = buildByStyle(style, brand, url);
      const outFile = path.join(brandDir, 'index.html');
      await fs.writeFile(outFile, html, 'utf8');
      const rel = path.relative(ROOT, outFile).replaceAll('\\','/');
      collected.push({ style, brand, rel });
    }
  }

  const indexHtml = buildStylesIndex(collected);
  await fs.writeFile(STYLES_INDEX, indexHtml, 'utf8');
  console.log(`✅ เสร็จสิ้น: styles=${STYLES.length}, brands=${collected.length / STYLES.length}`);
  console.log(`➡️  เปิดไฟล์: ${path.basename(STYLES_INDEX)} เพื่อเลือกสไตล์/แบรนด์`);
}

if (require.main === module){
  main().catch(err=>{ console.error('❌ Error:', err); process.exitCode = 1; });
}
