// autogenerate.js
// Scan ./web/<brand>/ folders, read signup.txt in each, and generate sell_autogen.html
// Output includes Matrix neon grid cards and dynamic Winrate/Bonus bars per contex.ini

const fs = require('fs').promises;
const path = require('path');

const MEDIA_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.ogg'];
const ROOT = __dirname;
const WEB_DIR = path.join(ROOT, 'web');
const OUTPUT_FILE = path.join(ROOT, 'sell_autogen.html');

async function getBrandFolders() {
  const entries = await fs.readdir(WEB_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));
}

async function getMediaFiles(folder) {
  const full = path.join(WEB_DIR, folder);
  const files = await fs.readdir(full, { withFileTypes: true });
  const media = files
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => MEDIA_EXTS.includes(path.extname(n).toLowerCase()))
    .slice(0, 6);
  return media;
}

async function getSignupLink(folder) {
  try {
    const p = path.join(WEB_DIR, folder, 'signup.txt');
    const txt = await fs.readFile(p, 'utf8');
    const url = txt.trim();
    return url || '#';
  } catch {
    return '#';
  }
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function buildHtml() {
  const brands = await getBrandFolders();
  const data = await Promise.all(
    brands.map(async (folder) => {
      const files = await getMediaFiles(folder);
      const signup = await getSignupLink(folder);
      return { folder, files, signup };
    })
  );

  const cards = data
    .map(({ folder, files, signup }, idx) => {
      const mediaHtml = files
        .map((f) => {
          const src = `web/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`;
          if (/\.(mp4|webm|ogg)$/i.test(f)) {
            return `<video src="${src}" muted loop autoplay playsinline></video>`;
          }
          return `<img src="${src}" alt="${escapeHtml(folder)}" onerror="this.style.opacity=0.13;this.style.borderStyle='dashed';">`;
        })
        .join('');

      return `
      <div class="pack-card" data-pack="${idx + 1}" data-brand="${escapeHtml(folder)}">
        <div class="brand-title">${escapeHtml(folder)}</div>
        <div class="media-carousel">${mediaHtml || '<span class="img-placeholder"></span>'}</div>
        <div class="progress-bars">
          <div class="progress-item">
            <div class="progress-label">WIN %</div>
            <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
            <div class="progress-value">0%</div>
          </div>
          <div class="progress-item">
            <div class="progress-label">BONUS %</div>
            <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
            <div class="progress-value">0%</div>
          </div>
        </div>
        <a href="${signup}" class="signup-btn" target="_blank" rel="noopener">สมัครกับ ${escapeHtml(folder)}</a>
      </div>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hacker Signup Grid</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
  <style>
    body { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%); font-family: 'Orbitron', monospace; color: #00ff41; min-height: 100vh; overflow-x: hidden; }
    .matrix-rain { position: fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:0; overflow:hidden; }
    .matrix-column { position:absolute; top:-100px; font-size:14px; color:#00ff41; opacity:.6; animation: matrix-fall linear infinite; }
    @keyframes matrix-fall { 0% { transform: translateY(-100px); opacity:1; } 100% { transform: translateY(100vh); opacity:0; } }
    .header { text-align:center; padding:24px 0 18px; border-bottom:2px solid #00ff41; margin-bottom:32px; background:rgba(0,0,0,.8); backdrop-filter: blur(10px); position: relative; z-index: 1; }
    .header h1 { font-size:2rem; font-weight:900; text-shadow:0 0 20px #00ff41; margin-bottom:8px; animation: glow-pulse 2s ease-in-out infinite alternate; letter-spacing:2px; }
    @keyframes glow-pulse { from { text-shadow:0 0 20px #00ff41; } to { text-shadow:0 0 30px #00ff41, 0 0 40px #00ff41; } }
    .subtitle { font-size:1rem; color:#00ccff; opacity:.8; }

    .grid-container { display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:24px; padding: 0 20px 40px; max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }
    .pack-card { background: rgba(0,0,0,.92); border:2px solid #00ff41; border-radius:14px; padding:16px; position:relative; overflow:hidden; box-shadow:0 0 30px rgba(0,255,65,0.18); transition: all .3s; text-align:center; }
    .pack-card.high-rate { animation: border-flash 1.2s ease-in-out infinite; box-shadow: 0 0 50px rgba(255,215,0,.3); }
    @keyframes border-flash { 0%,100%{ border-color:#00ff41; box-shadow:0 0 30px rgba(0,255,65,.2);} 50%{ border-color:#ffd700; box-shadow:0 0 50px rgba(255,215,0,.6);} }

    .brand-title { font-size:1.25rem; font-weight:700; color:#00ccff; margin-bottom:10px; letter-spacing:1.2px; text-shadow: 0 0 8px #00ccff99; }
    .media-carousel { width:100%; min-height:140px; display:flex; gap:10px; overflow-x:auto; margin-bottom:12px; scrollbar-width:thin; justify-content:flex-start; align-items:center; }
    .media-carousel img, .media-carousel video { height:140px; width:auto; object-fit:contain; border-radius:8px; border:2px solid #00ff41; background:#111; box-shadow:0 0 15px #00ff4199; transition: transform .22s, box-shadow .22s; flex: 0 0 auto; display:block; }
    .media-carousel img:hover, .media-carousel video:hover { transform: scale(1.07) rotate(-1deg); box-shadow: 0 0 32px #00ff41cc, 0 0 8px #fff; }

    .progress-bars { display:flex; flex-direction:column; gap:12px; margin: 8px 0 6px; }
    .progress-item { display:flex; align-items:center; gap:12px; }
    .progress-label { min-width:80px; font-size:.9rem; color:#00ff41; }
    .progress-bar { flex:1; height:18px; background:rgba(0,0,0,.8); border:1px solid #00ff41; border-radius:10px; overflow:hidden; position:relative; }
    .progress-fill { height:100%; background:#00ff41; border-radius:10px; transition: width 1.2s ease, background-color .4s ease, box-shadow .4s ease; position:relative; box-shadow: 0 0 12px rgba(0,255,65,.35); }
    .progress-fill.orange { background:#ff9800; box-shadow: 0 0 12px rgba(255,152,0,.45); }
    .progress-fill.red { background:#ff1744; box-shadow: 0 0 14px rgba(255,23,68,.55); }
    .progress-fill::after { content:''; position:absolute; inset:0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.25) 50%, transparent 100%); animation: progress-shine 4.5s linear infinite; }
    @keyframes progress-shine { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }

    .progress-value { min-width:52px; text-align:right; font-weight:700; color:#00ccff; }
    .signup-btn { background: linear-gradient(45deg, #00ff41, #00ccff); color:#000; border:none; border-radius: 999px; padding: 8px 30px; font-size: 1.02rem; font-family: 'Orbitron', monospace; font-weight:700; letter-spacing:1.2px; margin-top:.6rem; box-shadow:0 0 18px #00ff41cc; cursor:pointer; transition: all .18s; }
    .signup-btn:hover { background: linear-gradient(45deg, #00ccff, #00ff41); color:#fff; box-shadow:0 0 32px #00ff41ee, 0 0 8px #fff; filter: brightness(1.12); }

    @media (max-width:768px) { .header h1{ font-size:1.5rem;} .grid-container { grid-template-columns: 1fr; padding: 0 8px;} .media-carousel img, .media-carousel video { width: 96px; height:96px; } }
  </style>
</head>
<body>
  <div class="matrix-rain" id="matrixRain"></div>
  <div class="header">
    <h1>WIN RATE SIGNUP GRID</h1>
    <div class="subtitle">AUTO SCAN ./web FOLDERS - DYNAMIC RATES</div>
  </div>
  <div class="grid-container">
    ${cards}
  </div>

  <script>
    // Matrix rain effect
    (function createMatrixRain(){
      const matrixContainer = document.getElementById('matrixRain');
      const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
      for (let i=0;i<50;i++){
        const col = document.createElement('div');
        col.className='matrix-column';
        col.style.left = Math.random()*100 + '%';
        const duration = (Math.random()*3+2).toFixed(2);
        const delay = (Math.random()*2).toFixed(2);
        col.style.animationDuration = duration+'s';
        col.style.animationDelay = delay+'s';
        let t='';
        for(let j=0;j<20;j++){ t += chars.charAt(Math.floor(Math.random()*chars.length)) + '<br>'; }
        col.innerHTML = t;
        matrixContainer.appendChild(col);
      }
      setInterval(()=>{ while(matrixContainer.firstChild) matrixContainer.removeChild(matrixContainer.firstChild); createMatrixRain(); }, 30000);
    })();

    // Dynamic Winrate/Bonus bars per contex.ini (slowed + thresholds)
    (function setupRates(){
      const cards = document.querySelectorAll('.pack-card');
      const now = () => Date.now();
      cards.forEach((card, idx)=>{
        const fills = card.querySelectorAll('.progress-fill');
        const values = card.querySelectorAll('.progress-value');
        let currentWin = Math.random()*25+20; // 20-45 start
        let currentBonus = Math.random()*25+10; // 10-35 start
        let targetWin = 55 + Math.random()*30; // 55-85
        let targetBonus = 25 + Math.random()*40; // 25-65
        let speed = 0.5 + Math.random()*0.7; // 0.5 - 1.2 slower
        let nextTargetAt = now() + (12000 + Math.random()*13000); // 12-25s
        let lingerUntil = 0; // when both >=90, keep between 90-99 for up to 30m

        function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
        function applyColor(el, val){
          el.classList.remove('red','orange');
          if (val < 30) el.classList.add('red');
          else if (val < 50) el.classList.add('orange');
        }
        function setDisplays(w,b){
          const W = Math.round(clamp(w, 0, 100));
          const B = Math.round(clamp(b, 0, 100));
          fills[0].style.width = W + '%';
          fills[1].style.width = B + '%';
          values[0].textContent = W + '%';
          values[1].textContent = B + '%';
          applyColor(fills[0], W); applyColor(fills[1], B);
          if (W >= 90 && B >= 90) card.classList.add('high-rate'); else card.classList.remove('high-rate');
        }

        function chooseNewTargets(){
          // randomize with variance, keep realistic ranges
          targetWin = clamp(35 + Math.random()*50, 10, 99);
          targetBonus = clamp(20 + Math.random()*55, 10, 99);
          speed = 0.5 + Math.random()*0.9; // slower
          nextTargetAt = now() + (12000 + Math.random()*13000); // 12-25s
        }

        const tick = () => {
          const t = now();

          // If in linger window, keep both between 90-99, slow oscillation
          if (t < lingerUntil) {
            currentWin = 92 + Math.sin(t/9000 + idx) * 2.5 + Math.random()*1.2; // ~90-99 slower
            currentBonus = 92 + Math.cos(t/12000 + idx) * 2.5 + Math.random()*1.2;
            setDisplays(currentWin, currentBonus);
            requestAnimationFrame(tick);
            return;
          }

          // ease towards targets
          currentWin += (targetWin - currentWin) * 0.008 * speed; // slower approach
          currentBonus += (targetBonus - currentBonus) * 0.008 * speed;

          // small random jitter (not too fast)
          currentWin += (Math.random()-0.5) * 0.2;
          currentBonus += (Math.random()-0.5) * 0.2;

          setDisplays(currentWin, currentBonus);

          // Occasionally retarget
          if (t > nextTargetAt) {
            chooseNewTargets();
          }

          // When both exceed 90, with small chance enter 30-min linger
          if (currentWin >= 90 && currentBonus >= 90) {
            if (Math.random() < 0.02) { // small chance to trigger when both high
              lingerUntil = now() + 30 * 60 * 1000; // 30 minutes
            }
          }

          requestAnimationFrame(tick);
        };

        // start
        chooseNewTargets();
        setDisplays(currentWin, currentBonus);
        requestAnimationFrame(tick);
      });
    })();
  </script>
</body>
</html>`;

  return html;
}

async function main() {
  try {
    const html = await buildHtml();
    await fs.writeFile(OUTPUT_FILE, html, 'utf8');
    console.log(`✅ Generated ${path.basename(OUTPUT_FILE)} using folders in ./web/`);
  } catch (err) {
    console.error('❌ Generation failed:', err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
