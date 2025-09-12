// multi_style_generator.js
// สร้างหลายสไตล์สำหรับให้ลูกค้าเลือก

const fs = require('fs').promises;
const path = require('path');

const ROOT = __dirname;
const WEB_DIR = path.join(ROOT, 'web');
const STYLES_DIR = path.join(ROOT, 'client_styles');

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function getBrandFolders() {
  const entries = await fs.readdir(WEB_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));
}

async function readSignupUrl(brand) {
  const filePath = path.join(WEB_DIR, brand, 'signup.txt');
  try {
    const url = (await fs.readFile(filePath, 'utf8')).trim();
    return url || '#';
  } catch (e) {
    return '#';
  }
}

async function getImageFiles(brandPath) {
  try {
    const files = await fs.readdir(brandPath);
    return files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
    );
  } catch (e) {
    return [];
  }
}

async function imageToBase64(imagePath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/jpeg';
    
    switch (ext) {
      case '.png': mimeType = 'image/png'; break;
      case '.gif': mimeType = 'image/gif'; break;
      case '.webp': mimeType = 'image/webp'; break;
      case '.svg': mimeType = 'image/svg+xml'; break;
    }
    
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (e) {
    console.warn(`⚠️  ไม่สามารถอ่านไฟล์ ${imagePath}: ${e.message}`);
    return null;
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}// รวบรวม
ข้อมูลแบรนด์
async function collectBrandData() {
  const brands = await getBrandFolders();
  const brandData = [];
  
  console.log(`📊 รวบรวมข้อมูล ${brands.length} แบรนด์...`);
  
  for (const brand of brands) {
    try {
      const brandPath = path.join(WEB_DIR, brand);
      const signupUrl = await readSignupUrl(brand);
      const imageFiles = await getImageFiles(brandPath);
      
      const images = [];
      for (const filename of imageFiles.slice(0, 6)) {
        const imagePath = path.join(brandPath, filename);
        const base64 = await imageToBase64(imagePath);
        if (base64) {
          images.push({ filename, base64 });
        }
      }
      
      if (images.length > 0) {
        brandData.push({
          brand,
          signupUrl,
          images,
          mainImage: images[0],
          thumbnails: images.slice(1, 5)
        });
        console.log(`  ✅ ${brand}: ${images.length} รูป`);
      }
    } catch (error) {
      console.warn(`  ⚠️  ข้าม ${brand}: ${error.message}`);
    }
  }
  
  return brandData;
}

// สไตล์ 1: Matrix Gaming
async function generateMatrixStyle(brandData) {
  const brandCards = brandData.map((data, index) => {
    const thumbnailElements = data.thumbnails.map(img => 
      `<img class="go-thumb" src="${img.base64}" alt="${escapeHtml(data.brand)}" />`
    ).join('');

    return `
      <div class="go-card" data-pack="${index + 1}" data-brand="${escapeHtml(data.brand)}">
        <div class="go-card-tilt">
          <div class="go-brand">${escapeHtml(data.brand)}</div>
          <div class="go-hero" aria-label="${escapeHtml(data.brand)} media">
            <img class="go-media-el" src="${data.mainImage.base64}" alt="${escapeHtml(data.brand)}">
          </div>
          <div class="go-thumbs">${thumbnailElements}</div>
          <div class="go-ai">
            <div class="go-ai-row">
              <span class="go-ai-label">WIN %</span>
              <div class="go-ai-bar"><div class="go-ai-fill" style="width:0%"></div></div>
              <span class="go-ai-val">0%</span>
            </div>
            <div class="go-ai-row">
              <span class="go-ai-label">BONUS %</span>
              <div class="go-ai-bar"><div class="go-ai-fill" style="width:0%"></div></div>
              <span class="go-ai-val">0%</span>
            </div>
          </div>
          <a href="${escapeHtml(data.signupUrl)}" class="go-btn" target="_blank" rel="noopener">สมัครกับ ${escapeHtml(data.brand)}</a>
        </div>
      </div>`;
  }).join('');

  const matrixHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Matrix Gaming Style - All Brands</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
  <style>
    body { 
      background: radial-gradient(1200px 600px at 10% -10%, #112 0%, #0a0a0a 40%), 
                  linear-gradient(135deg, #0a0a0a 0%, #121225 50%, #0c0c1a 100%); 
      font-family: 'Orbitron', monospace; 
      color: #00ff41; 
      min-height: 100vh; 
      overflow-x: hidden; 
      margin: 0; padding: 0;
    }
    .go-matrix { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .go-mcol { position: absolute; top: -100px; font-size: 13px; color: #00ff41; opacity: .6; animation: go-fall linear infinite; }
    @keyframes go-fall { 0% { transform: translateY(-100px); opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }
    @keyframes go-glow { from { text-shadow: 0 0 18px #00ff41; } to { text-shadow: 0 0 28px #00ff41, 0 0 38px #00ff41; } }
    .go-header { text-align: center; padding: 22px 0 16px; border-bottom: 2px solid #00ff41; margin-bottom: 24px; background: rgba(0,0,0,.72); backdrop-filter: blur(10px); position: relative; z-index: 1; }
    .go-title { font-size: 1.9rem; font-weight: 900; text-shadow: 0 0 18px #00ff41; letter-spacing: 1.8px; animation: go-glow 2s ease-in-out infinite alternate; margin: 0 0 6px; }
    .go-sub { font-size: .95rem; color: #00ccff; opacity: .85; }
    .go-wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 22px; padding: 0 16px 40px; max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }
    .go-card { perspective: 900px; }
    .go-card-tilt { background: rgba(0,0,0,.9); border: 2px solid #00ff41; border-radius: 16px; padding: 14px; position: relative; overflow: hidden; box-shadow: 0 0 26px rgba(0,255,65,.18); transition: transform .25s, box-shadow .25s, border-color .25s; }
    .go-card-tilt:hover { transform: rotateX(2deg) rotateY(-2deg) translateY(-2px); border-color: #ffd700; box-shadow: 0 0 46px rgba(255,215,0,.32); }
    .go-brand { font-size: 1.1rem; font-weight: 700; color: #00ccff; letter-spacing: 1.1px; text-shadow: 0 0 6px #00ccff99; margin: 2px 0 10px; }
    .go-hero { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; border: 2px solid #00ff41; background: #090909; box-shadow: inset 0 0 25px #00ff4188; }
    .go-media-el { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
    .go-thumbs { display: flex; gap: 8px; overflow-x: auto; padding: 10px 2px 4px; scrollbar-width: thin; }
    .go-thumb { width: 110px; height: 70px; object-fit: cover; border-radius: 8px; border: 2px solid #00ff41; background: #111; box-shadow: 0 0 12px #00ff4199; transition: transform .18s, box-shadow .18s; flex: 0 0 auto; cursor: pointer; }
    .go-thumb:hover { transform: scale(1.05); box-shadow: 0 0 22px #00ff41cc, 0 0 6px #fff; }
    .go-ai { display: flex; flex-direction: column; gap: 10px; margin: 10px 2px 6px; }
    .go-ai-row { display: flex; align-items: center; gap: 10px; }
    .go-ai-label { min-width: 74px; font-size: .9rem; color: #00ff41; }
    .go-ai-bar { flex: 1; height: 16px; background: rgba(0,0,0,.85); border: 1px solid #00ff41; border-radius: 10px; overflow: hidden; position: relative; }
    .go-ai-fill { height: 100%; background: #00ff41; border-radius: 10px; transition: width 1.1s ease, background-color .35s ease, box-shadow .35s ease; position: relative; box-shadow: 0 0 10px rgba(0,255,65,.35); }
    .go-ai-fill.go-o { background: #ff9800; box-shadow: 0 0 10px rgba(255,152,0,.45); }
    .go-ai-fill.go-r { background: #ff1744; box-shadow: 0 0 12px rgba(255,23,68,.55); }
    .go-ai-val { min-width: 48px; text-align: right; font-weight: 700; color: #00ccff; }
    .go-btn { background: linear-gradient(45deg, #00ff41, #00ccff); color: #000; border: none; border-radius: 999px; padding: 8px 28px; font-size: 1.02rem; font-family: 'Orbitron', monospace; font-weight: 700; letter-spacing: 1.2px; margin-top: .5rem; box-shadow: 0 0 16px #00ff41cc; cursor: pointer; transition: all .18s; display: inline-block; text-decoration: none; }
    .go-btn:hover { background: linear-gradient(45deg, #00ccff, #00ff41); color: #fff; box-shadow: 0 0 28px #00ff41ee, 0 0 6px #fff; filter: brightness(1.1); }
    @media (max-width: 768px) { .go-title { font-size: 1.5rem; } .go-wrap { grid-template-columns: 1fr; padding: 0 10px 32px; } .go-thumb { width: 88px; height: 60px; } }
  </style>
</head>
<body>
  <div class="go-matrix" id="goMatrix"></div>
  <div class="go-header">
    <h1 class="go-title">🎮 MATRIX GAMING STYLE</h1>
    <div class="go-sub">${brandData.length} BRANDS • EMBEDDED GALLERY • FUTURISTIC UI</div>
  </div>
  <div class="go-wrap">${brandCards}</div>
  <script>
    const mc = document.getElementById('goMatrix');
    if (mc) {
      const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
      function mk() {
        mc.innerHTML = '';
        for (let i=0;i<48;i++){
          const el = document.createElement('div');
          el.className = 'go-mcol';
          el.style.left = (Math.random()*100).toFixed(2)+'%';
          const dur = (Math.random()*3+2).toFixed(2);
          const del = (Math.random()*2).toFixed(2);
          el.style.animationDuration = dur+'s';
          el.style.animationDelay = del+'s';
          let t='';
          for(let j=0;j<18;j++){ t += chars.charAt(Math.floor(Math.random()*chars.length))+'<br>'; }
          el.innerHTML = t;
          mc.appendChild(el);
        }
      }
      mk(); setInterval(mk, 30000);
    }
    document.querySelectorAll('.go-card').forEach((card) => {
      const hero = card.querySelector('.go-hero');
      const thumbs = card.querySelectorAll('.go-thumb');
      thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
          const newImg = document.createElement('img');
          newImg.className = 'go-media-el';
          newImg.src = thumb.src;
          newImg.alt = card.dataset.brand;
          hero.innerHTML = '';
          hero.appendChild(newImg);
        });
      });
    });
    document.querySelectorAll('.go-card').forEach((card, idx) => {
      const fills = card.querySelectorAll('.go-ai-fill');
      const vals = card.querySelectorAll('.go-ai-val');
      if (fills.length >= 2 && vals.length >= 2) {
        let cw = 20+Math.random()*25, cb = 10+Math.random()*25;
        let tw = 55+Math.random()*30, tb = 25+Math.random()*40;
        let sp = .6 + Math.random()*0.7;
        let nextAt = Date.now() + (12000 + Math.random()*13000);
        function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
        function color(el, v){ el.classList.remove('go-r','go-o'); if (v<30) el.classList.add('go-r'); else if (v<50) el.classList.add('go-o'); }
        function setD(w,b){ const W=Math.round(clamp(w,0,100)), B=Math.round(clamp(b,0,100)); fills[0].style.width=W+'%'; fills[1].style.width=B+'%'; vals[0].textContent=W+'%'; vals[1].textContent=B+'%'; color(fills[0],W); color(fills[1],B); }
        function retarget(){ tw = clamp(35+Math.random()*50, 10, 99); tb = clamp(20+Math.random()*55,10,99); sp = .5+Math.random()*0.9; nextAt = Date.now() + (12000 + Math.random()*13000); }
        (function tick(){ const t = Date.now(); cw += (tw-cw)*0.008*sp; cb += (tb-cb)*0.008*sp; cw += (Math.random()-.5)*.2; cb += (Math.random()-.5)*.2; setD(cw,cb); if (t>nextAt) retarget(); requestAnimationFrame(tick); })();
      }
    });
  </script>
</body>
</html>`;

  const matrixPath = path.join(STYLES_DIR, 'style1_matrix.html');
  await fs.writeFile(matrixPath, matrixHtml, 'utf8');
  console.log(`🎮 สร้าง Style 1 - Matrix Gaming`);
  
  return matrixPath;
}// ส
ไตล์ 2: Neon Cyberpunk
async function generateNeonStyle(brandData) {
  const brandCards = brandData.map((data, index) => {
    const thumbnailElements = data.thumbnails.map(img => 
      `<img class="neon-thumb" src="${img.base64}" alt="${escapeHtml(data.brand)}" />`
    ).join('');

    return `
      <div class="neon-card" data-brand="${escapeHtml(data.brand)}">
        <div class="neon-glow">
          <div class="neon-brand">${escapeHtml(data.brand)}</div>
          <div class="neon-hero">
            <img class="neon-media" src="${data.mainImage.base64}" alt="${escapeHtml(data.brand)}">
            <div class="neon-overlay"></div>
          </div>
          <div class="neon-thumbs">${thumbnailElements}</div>
          <div class="neon-stats">
            <div class="stat-bar">
              <span>WIN</span>
              <div class="bar"><div class="fill" style="width:0%"></div></div>
              <span class="val">0%</span>
            </div>
            <div class="stat-bar">
              <span>BONUS</span>
              <div class="bar"><div class="fill" style="width:0%"></div></div>
              <span class="val">0%</span>
            </div>
          </div>
          <a href="${escapeHtml(data.signupUrl)}" class="neon-btn" target="_blank">PLAY NOW</a>
        </div>
      </div>`;
  }).join('');

  const neonHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Neon Cyberpunk Style - All Brands</title>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0f; background-image: radial-gradient(circle at 25% 25%, #ff00ff22 0%, transparent 50%), radial-gradient(circle at 75% 75%, #00ffff22 0%, transparent 50%); font-family: 'Rajdhani', sans-serif; color: #fff; overflow-x: hidden; }
    .neon-header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #0a0a0f, #1a0a1f); border-bottom: 2px solid #ff00ff; box-shadow: 0 0 50px #ff00ff33; }
    .neon-title { font-size: 3rem; font-weight: 700; background: linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff); background-size: 200% 200%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: neon-pulse 2s ease-in-out infinite; text-shadow: 0 0 30px #ff00ff; }
    @keyframes neon-pulse { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    .neon-subtitle { margin-top: 10px; font-size: 1.2rem; color: #00ffff; text-shadow: 0 0 10px #00ffff; }
    .neon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; padding: 40px 20px; max-width: 1600px; margin: 0 auto; }
    .neon-card { position: relative; background: linear-gradient(145deg, #1a1a2e, #16213e); border-radius: 20px; overflow: hidden; transition: all 0.3s ease; }
    .neon-card:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 20px 60px rgba(255,0,255,0.3); }
    .neon-glow { padding: 20px; border: 2px solid transparent; border-radius: 20px; background: linear-gradient(145deg, #1a1a2e, #16213e) padding-box, linear-gradient(45deg, #ff00ff, #00ffff) border-box; }
    .neon-brand { font-size: 1.5rem; font-weight: 700; color: #00ffff; text-align: center; margin-bottom: 15px; text-shadow: 0 0 15px #00ffff; }
    .neon-hero { position: relative; width: 100%; height: 200px; border-radius: 15px; overflow: hidden; margin-bottom: 15px; }
    .neon-media { width: 100%; height: 100%; object-fit: cover; filter: saturate(1.2) contrast(1.1); }
    .neon-overlay { position: absolute; inset: 0; background: linear-gradient(45deg, #ff00ff11, #00ffff11); mix-blend-mode: overlay; }
    .neon-thumbs { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; }
    .neon-thumb { width: 80px; height: 50px; object-fit: cover; border-radius: 8px; border: 2px solid #ff00ff; cursor: pointer; transition: all 0.3s ease; flex-shrink: 0; }
    .neon-thumb:hover { border-color: #00ffff; box-shadow: 0 0 20px #00ffff; transform: scale(1.1); }
    .neon-stats { margin-bottom: 20px; }
    .stat-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .stat-bar span:first-child { min-width: 60px; font-weight: 600; color: #ff00ff; }
    .bar { flex: 1; height: 12px; background: #000; border-radius: 6px; overflow: hidden; border: 1px solid #ff00ff; }
    .fill { height: 100%; background: linear-gradient(90deg, #ff00ff, #00ffff); transition: width 1s ease; box-shadow: 0 0 10px #ff00ff; }
    .val { min-width: 40px; text-align: right; font-weight: 700; color: #00ffff; }
    .neon-btn { display: block; width: 100%; padding: 15px; background: linear-gradient(45deg, #ff00ff, #00ffff); color: #000; text-decoration: none; text-align: center; font-weight: 700; font-size: 1.1rem; border-radius: 25px; transition: all 0.3s ease; box-shadow: 0 0 20px #ff00ff44; }
    .neon-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px #ff00ff66; filter: brightness(1.2); }
    @media (max-width: 768px) { .neon-title { font-size: 2rem; } .neon-grid { grid-template-columns: 1fr; padding: 20px 10px; } }
  </style>
</head>
<body>
  <div class="neon-header">
    <h1 class="neon-title">💜 NEON CYBERPUNK</h1>
    <p class="neon-subtitle">${brandData.length} BRANDS • CYBERPUNK AESTHETIC • NEON GLOW</p>
  </div>
  <div class="neon-grid">${brandCards}</div>
  <script>
    document.querySelectorAll('.neon-card').forEach((card, idx) => {
      const fills = card.querySelectorAll('.fill');
      const vals = card.querySelectorAll('.val');
      let w = Math.random() * 30 + 20;
      let b = Math.random() * 40 + 15;
      function animate() {
        w += (Math.random() - 0.5) * 2;
        b += (Math.random() - 0.5) * 2;
        w = Math.max(10, Math.min(95, w));
        b = Math.max(5, Math.min(90, b));
        fills[0].style.width = w + '%';
        fills[1].style.width = b + '%';
        vals[0].textContent = Math.round(w) + '%';
        vals[1].textContent = Math.round(b) + '%';
      }
      setInterval(animate, 2000 + idx * 100);
      animate();
    });
    document.querySelectorAll('.neon-card').forEach(card => {
      const hero = card.querySelector('.neon-media');
      const thumbs = card.querySelectorAll('.neon-thumb');
      thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          hero.src = thumb.src;
        });
      });
    });
  </script>
</body>
</html>`;

  const neonPath = path.join(STYLES_DIR, 'style2_neon.html');
  await fs.writeFile(neonPath, neonHtml, 'utf8');
  console.log(`💜 สร้าง Style 2 - Neon Cyberpunk`);
  
  return neonPath;
}// สไตล์
 3: Minimal Clean
async function generateMinimalStyle(brandData) {
  const brandCards = brandData.map((data, index) => {
    const thumbnailElements = data.thumbnails.map(img => 
      `<img class="min-thumb" src="${img.base64}" alt="${escapeHtml(data.brand)}" />`
    ).join('');

    return `
      <div class="min-card">
        <div class="min-image">
          <img class="min-main" src="${data.mainImage.base64}" alt="${escapeHtml(data.brand)}">
        </div>
        <div class="min-content">
          <h3 class="min-title">${escapeHtml(data.brand)}</h3>
          <div class="min-thumbs">${thumbnailElements}</div>
          <div class="min-stats">
            <div class="min-stat">
              <span>Win Rate</span>
              <div class="min-bar"><div class="min-fill" style="width:0%"></div></div>
            </div>
            <div class="min-stat">
              <span>Bonus</span>
              <div class="min-bar"><div class="min-fill" style="width:0%"></div></div>
            </div>
          </div>
          <a href="${escapeHtml(data.signupUrl)}" class="min-btn" target="_blank">Join Now</a>
        </div>
      </div>`;
  }).join('');

  const minimalHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Minimal Clean Style - All Brands</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; }
    .min-header { text-align: center; padding: 60px 20px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .min-main-title { font-size: 2.5rem; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
    .min-subtitle { font-size: 1.1rem; color: #64748b; }
    .min-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; padding: 40px 20px; max-width: 1400px; margin: 0 auto; }
    .min-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.3s ease; }
    .min-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px rgba(0,0,0,0.1); }
    .min-image { width: 100%; height: 200px; overflow: hidden; }
    .min-main { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
    .min-card:hover .min-main { transform: scale(1.05); }
    .min-content { padding: 24px; }
    .min-title { font-size: 1.5rem; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
    .min-thumbs { display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; }
    .min-thumb { width: 60px; height: 40px; object-fit: cover; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; border: 2px solid transparent; }
    .min-thumb:hover { border-color: #3b82f6; transform: scale(1.1); }
    .min-stats { margin-bottom: 24px; }
    .min-stat { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .min-stat span { min-width: 80px; font-size: 0.9rem; font-weight: 500; color: #64748b; }
    .min-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .min-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #1d4ed8); transition: width 1s ease; border-radius: 4px; }
    .min-btn { display: block; width: 100%; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; text-align: center; font-weight: 600; border-radius: 8px; transition: all 0.2s ease; }
    .min-btn:hover { background: #2563eb; transform: translateY(-1px); }
    @media (max-width: 768px) { .min-main-title { font-size: 2rem; } .min-grid { grid-template-columns: 1fr; padding: 20px 10px; } }
  </style>
</head>
<body>
  <div class="min-header">
    <h1 class="min-main-title">🤍 MINIMAL CLEAN</h1>
    <p class="min-subtitle">${brandData.length} BRANDS • CLEAN DESIGN • PROFESSIONAL</p>
  </div>
  <div class="min-grid">${brandCards}</div>
  <script>
    document.querySelectorAll('.min-card').forEach((card, idx) => {
      const fills = card.querySelectorAll('.min-fill');
      setTimeout(() => {
        const w = 60 + Math.random() * 30;
        const b = 40 + Math.random() * 40;
        fills[0].style.width = w + '%';
        fills[1].style.width = b + '%';
      }, idx * 200);
    });
    document.querySelectorAll('.min-card').forEach(card => {
      const main = card.querySelector('.min-main');
      const thumbs = card.querySelectorAll('.min-thumb');
      thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          main.src = thumb.src;
        });
      });
    });
  </script>
</body>
</html>`;

  const minimalPath = path.join(STYLES_DIR, 'style3_minimal.html');
  await fs.writeFile(minimalPath, minimalHtml, 'utf8');
  console.log(`🤍 สร้าง Style 3 - Minimal Clean`);
  
  return minimalPath;
}// สไต
ล์ 4: Luxury Gold
async function generateLuxuryStyle(brandData) {
  const brandCards = brandData.map((data, index) => {
    const thumbnailElements = data.thumbnails.map(img => 
      `<img class="lux-thumb" src="${img.base64}" alt="${escapeHtml(data.brand)}" />`
    ).join('');

    return `
      <div class="lux-card">
        <div class="lux-frame">
          <div class="lux-brand">${escapeHtml(data.brand)}</div>
          <div class="lux-hero">
            <img class="lux-main" src="${data.mainImage.base64}" alt="${escapeHtml(data.brand)}">
            <div class="lux-shine"></div>
          </div>
          <div class="lux-thumbs">${thumbnailElements}</div>
          <div class="lux-stats">
            <div class="lux-stat">
              <span>Premium Rate</span>
              <div class="lux-bar"><div class="lux-fill" style="width:0%"></div></div>
            </div>
            <div class="lux-stat">
              <span>VIP Bonus</span>
              <div class="lux-bar"><div class="lux-fill" style="width:0%"></div></div>
            </div>
          </div>
          <a href="${escapeHtml(data.signupUrl)}" class="lux-btn" target="_blank">JOIN ELITE</a>
        </div>
      </div>`;
  }).join('');

  const luxuryHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Luxury Gold Style - All Brands</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: radial-gradient(circle at center, #1a1a1a 0%, #000 70%); font-family: 'Playfair Display', serif; color: #d4af37; overflow-x: hidden; }
    .lux-header { text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); border-bottom: 3px solid #d4af37; box-shadow: 0 0 50px rgba(212,175,55,0.3); }
    .lux-title { font-size: 3.5rem; font-weight: 900; background: linear-gradient(45deg, #d4af37, #ffd700, #d4af37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 30px #d4af37; margin-bottom: 15px; }
    .lux-subtitle { font-size: 1.3rem; color: #b8860b; font-style: italic; }
    .lux-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 40px; padding: 50px 20px; max-width: 1500px; margin: 0 auto; }
    .lux-card { position: relative; }
    .lux-frame { background: linear-gradient(145deg, #2d2d2d, #1a1a1a); border: 3px solid #d4af37; border-radius: 20px; padding: 25px; position: relative; overflow: hidden; box-shadow: 0 10px 40px rgba(212,175,55,0.2); transition: all 0.4s ease; }
    .lux-frame:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 60px rgba(212,175,55,0.4); }
    .lux-frame::before { content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(45deg, #d4af37, #ffd700, #d4af37); border-radius: 20px; z-index: -1; }
    .lux-brand { font-size: 1.8rem; font-weight: 700; color: #ffd700; text-align: center; margin-bottom: 20px; text-shadow: 0 0 15px #d4af37; }
    .lux-hero { position: relative; width: 100%; height: 220px; border-radius: 15px; overflow: hidden; margin-bottom: 20px; border: 2px solid #d4af37; }
    .lux-main { width: 100%; height: 100%; object-fit: cover; filter: sepia(0.2) saturate(1.1); }
    .lux-shine { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.1) 50%, transparent 70%); animation: lux-shine 3s ease-in-out infinite; }
    @keyframes lux-shine { 0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); } 50% { transform: translateX(100%) translateY(100%) rotate(45deg); } }
    .lux-thumbs { display: flex; gap: 12px; margin-bottom: 25px; overflow-x: auto; }
    .lux-thumb { width: 90px; height: 60px; object-fit: cover; border-radius: 10px; border: 2px solid #d4af37; cursor: pointer; transition: all 0.3s ease; flex-shrink: 0; }
    .lux-thumb:hover { border-color: #ffd700; box-shadow: 0 0 20px rgba(255,215,0,0.5); transform: scale(1.1); }
    .lux-stats { margin-bottom: 25px; }
    .lux-stat { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
    .lux-stat span { min-width: 100px; font-weight: 600; color: #d4af37; }
    .lux-bar { flex: 1; height: 14px; background: #1a1a1a; border: 1px solid #d4af37; border-radius: 7px; overflow: hidden; }
    .lux-fill { height: 100%; background: linear-gradient(90deg, #d4af37, #ffd700); transition: width 1.5s ease; box-shadow: 0 0 10px rgba(212,175,55,0.5); }
    .lux-btn { display: block; width: 100%; padding: 18px; background: linear-gradient(45deg, #d4af37, #ffd700); color: #000; text-decoration: none; text-align: center; font-weight: 700; font-size: 1.2rem; border-radius: 30px; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(212,175,55,0.3); text-transform: uppercase; letter-spacing: 1px; }
    .lux-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(212,175,55,0.5); filter: brightness(1.1); }
    @media (max-width: 768px) { .lux-title { font-size: 2.5rem; } .lux-grid { grid-template-columns: 1fr; padding: 30px 15px; } }
  </style>
</head>
<body>
  <div class="lux-header">
    <h1 class="lux-title">👑 LUXURY GOLD</h1>
    <p class="lux-subtitle">${brandData.length} Elite Brands • Premium Experience • VIP Treatment</p>
  </div>
  <div class="lux-grid">${brandCards}</div>
  <script>
    document.querySelectorAll('.lux-card').forEach((card, idx) => {
      const fills = card.querySelectorAll('.lux-fill');
      setTimeout(() => {
        const w = 70 + Math.random() * 25;
        const b = 60 + Math.random() * 35;
        fills[0].style.width = w + '%';
        fills[1].style.width = b + '%';
      }, idx * 300);
    });
    document.querySelectorAll('.lux-card').forEach(card => {
      const main = card.querySelector('.lux-main');
      const thumbs = card.querySelectorAll('.lux-thumb');
      thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          main.src = thumb.src;
        });
      });
    });
  </script>
</body>
</html>`;

  const luxuryPath = path.join(STYLES_DIR, 'style4_luxury.html');
  await fs.writeFile(luxuryPath, luxuryHtml, 'utf8');
  console.log(`👑 สร้าง Style 4 - Luxury Gold`);
  
  return luxuryPath;
}// สไตล์ 
5: Dark Gaming
async function generateGamingStyle(brandData) {
  const brandCards = brandData.map((data, index) => {
    const thumbnailElements = data.thumbnails.map(img => 
      `<img class="game-thumb" src="${img.base64}" alt="${escapeHtml(data.brand)}" />`
    ).join('');

    return `
      <div class="game-card">
        <div class="game-border">
          <div class="game-brand">${escapeHtml(data.brand)}</div>
          <div class="game-hero">
            <img class="game-main" src="${data.mainImage.base64}" alt="${escapeHtml(data.brand)}">
            <div class="game-overlay">
              <div class="play-icon">▶</div>
            </div>
          </div>
          <div class="game-thumbs">${thumbnailElements}</div>
          <div class="game-stats">
            <div class="game-stat">
              <span>SKILL</span>
              <div class="game-bar"><div class="game-fill" style="width:0%"></div></div>
            </div>
            <div class="game-stat">
              <span>LUCK</span>
              <div class="game-bar"><div class="game-fill" style="width:0%"></div></div>
            </div>
          </div>
          <a href="${escapeHtml(data.signupUrl)}" class="game-btn" target="_blank">START GAME</a>
        </div>
      </div>`;
  }).join('');

  const gamingHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dark Gaming Style - All Brands</title>
  <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;900&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); font-family: 'Exo 2', sans-serif; color: #eee; overflow-x: hidden; }
    .game-header { text-align: center; padding: 50px 20px; background: linear-gradient(135deg, #0f0f23, #1a1a2e); border-bottom: 3px solid #e94560; box-shadow: 0 0 40px rgba(233,69,96,0.3); }
    .game-title { font-size: 3.2rem; font-weight: 900; background: linear-gradient(45deg, #e94560, #f39c12, #e94560); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 25px #e94560; margin-bottom: 12px; }
    .game-subtitle { font-size: 1.2rem; color: #f39c12; font-weight: 600; }
    .game-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 35px; padding: 45px 20px; max-width: 1500px; margin: 0 auto; }
    .game-card { position: relative; }
    .game-border { background: linear-gradient(145deg, #1a1a2e, #16213e); border: 2px solid #e94560; border-radius: 18px; padding: 22px; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(233,69,96,0.2); transition: all 0.3s ease; }
    .game-border:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 15px 50px rgba(233,69,96,0.4); border-color: #f39c12; }
    .game-brand { font-size: 1.6rem; font-weight: 700; color: #f39c12; text-align: center; margin-bottom: 18px; text-shadow: 0 0 12px #f39c12; text-transform: uppercase; }
    .game-hero { position: relative; width: 100%; height: 210px; border-radius: 12px; overflow: hidden; margin-bottom: 18px; border: 2px solid #e94560; }
    .game-main { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.1) saturate(1.1); }
    .game-overlay { position: absolute; inset: 0; background: linear-gradient(45deg, rgba(233,69,96,0.1), rgba(243,156,18,0.1)); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; }
    .game-hero:hover .game-overlay { opacity: 1; }
    .play-icon { font-size: 3rem; color: #f39c12; text-shadow: 0 0 20px #f39c12; }
    .game-thumbs { display: flex; gap: 10px; margin-bottom: 22px; overflow-x: auto; }
    .game-thumb { width: 85px; height: 55px; object-fit: cover; border-radius: 8px; border: 2px solid #e94560; cursor: pointer; transition: all 0.3s ease; flex-shrink: 0; }
    .game-thumb:hover { border-color: #f39c12; box-shadow: 0 0 15px rgba(243,156,18,0.5); transform: scale(1.08); }
    .game-stats { margin-bottom: 22px; }
    .game-stat { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .game-stat span { min-width: 70px; font-weight: 700; color: #e94560; font-size: 0.9rem; }
    .game-bar { flex: 1; height: 12px; background: #0f0f23; border: 1px solid #e94560; border-radius: 6px; overflow: hidden; }
    .game-fill { height: 100%; background: linear-gradient(90deg, #e94560, #f39c12); transition: width 1.2s ease; box-shadow: 0 0 8px rgba(233,69,96,0.4); }
    .game-btn { display: block; width: 100%; padding: 16px; background: linear-gradient(45deg, #e94560, #f39c12); color: #000; text-decoration: none; text-align: center; font-weight: 700; font-size: 1.1rem; border-radius: 25px; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(233,69,96,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
    .game-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(233,69,96,0.5); filter: brightness(1.1); }
    @media (max-width: 768px) { .game-title { font-size: 2.3rem; } .game-grid { grid-template-columns: 1fr; padding: 25px 15px; } }
  </style>
</head>
<body>
  <div class="game-header">
    <h1 class="game-title">🎮 DARK GAMING</h1>
    <p class="game-subtitle">${brandData.length} Gaming Brands • Dark Theme • Pro Gamer Style</p>
  </div>
  <div class="game-grid">${brandCards}</div>
  <script>
    document.querySelectorAll('.game-card').forEach((card, idx) => {
      const fills = card.querySelectorAll('.game-fill');
      setTimeout(() => {
        const w = 50 + Math.random() * 40;
        const b = 45 + Math.random() * 45;
        fills[0].style.width = w + '%';
        fills[1].style.width = b + '%';
      }, idx * 250);
    });
    document.querySelectorAll('.game-card').forEach(card => {
      const main = card.querySelector('.game-main');
      const thumbs = card.querySelectorAll('.game-thumb');
      thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          main.src = thumb.src;
        });
      });
    });
  </script>
</body>
</html>`;

  const gamingPath = path.join(STYLES_DIR, 'style5_gaming.html');
  await fs.writeFile(gamingPath, gamingHtml, 'utf8');
  console.log(`🎮 สร้าง Style 5 - Dark Gaming`);
  
  return gamingPath;
}/
/ สร้างหน้า Index สำหรับเลือกสไตล์
async function generateStyleIndex() {
  const indexHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Client Style Gallery - Choose Your Style</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Inter', sans-serif; color: #fff; min-height: 100vh; }
    .header { text-align: center; padding: 60px 20px; }
    .main-title { font-size: 3.5rem; font-weight: 700; margin-bottom: 20px; text-shadow: 0 4px 8px rgba(0,0,0,0.3); }
    .subtitle { font-size: 1.3rem; opacity: 0.9; margin-bottom: 40px; }
    .styles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; padding: 0 20px 60px; max-width: 1400px; margin: 0 auto; }
    .style-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 30px; text-align: center; transition: all 0.3s ease; }
    .style-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    .style-icon { font-size: 4rem; margin-bottom: 20px; }
    .style-name { font-size: 1.8rem; font-weight: 600; margin-bottom: 15px; }
    .style-desc { font-size: 1rem; opacity: 0.8; margin-bottom: 25px; line-height: 1.6; }
    .style-btn { display: inline-block; padding: 15px 30px; background: rgba(255,255,255,0.2); color: #fff; text-decoration: none; border-radius: 50px; font-weight: 600; transition: all 0.3s ease; border: 2px solid rgba(255,255,255,0.3); }
    .style-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
    .footer { text-align: center; padding: 40px 20px; opacity: 0.8; }
    @media (max-width: 768px) { .main-title { font-size: 2.5rem; } .styles-grid { grid-template-columns: 1fr; padding: 0 15px 40px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="main-title">🎨 Client Style Gallery</h1>
    <p class="subtitle">เลือกสไตล์ที่ต้องการสำหรับการนำเสนอลูกค้า</p>
  </div>
  
  <div class="styles-grid">
    <div class="style-card">
      <div class="style-icon">🎮</div>
      <h3 class="style-name">Matrix Gaming</h3>
      <p class="style-desc">สไตล์เกมมิ่งแบบ Matrix พร้อมเอฟเฟกต์ฝนตัวอักษร AI Win Rate และธีมสีเขียวนีออน</p>
      <a href="style1_matrix.html" class="style-btn">ดูสไตล์นี้</a>
    </div>
    
    <div class="style-card">
      <div class="style-icon">💜</div>
      <h3 class="style-name">Neon Cyberpunk</h3>
      <p class="style-desc">ธีม Cyberpunk สีม่วงชมพู นีออนเรืองแสง เหมาะสำหรับกลุ่มเป้าหมายที่ชอบความทันสมัย</p>
      <a href="style2_neon.html" class="style-btn">ดูสไตล์นี้</a>
    </div>
    
    <div class="style-card">
      <div class="style-icon">🤍</div>
      <h3 class="style-name">Minimal Clean</h3>
      <p class="style-desc">ดีไซน์สะอาด เรียบง่าย สีขาวเป็นหลัก เหมาะสำหรับลูกค้าที่ต้องการความเป็นมืออาชีพ</p>
      <a href="style3_minimal.html" class="style-btn">ดูสไตล์นี้</a>
    </div>
    
    <div class="style-card">
      <div class="style-icon">👑</div>
      <h3 class="style-name">Luxury Gold</h3>
      <p class="style-desc">ธีมหรูหรา สีทองเป็นหลัก เหมาะสำหรับกลุ่มลูกค้า VIP และผู้ที่ต้องการความพรีเมียม</p>
      <a href="style4_luxury.html" class="style-btn">ดูสไตล์นี้</a>
    </div>
    
    <div class="style-card">
      <div class="style-icon">🎮</div>
      <h3 class="style-name">Dark Gaming</h3>
      <p class="style-desc">ธีมเกมมิ่งสีเข้ม สีแดงส้ม เหมาะสำหรับ Pro Gamer และผู้ที่ชอบความเข้มข้น</p>
      <a href="style5_gaming.html" class="style-btn">ดูสไตล์นี้</a>
    </div>
  </div>
  
  <div class="footer">
    <p>🚀 ทุกสไตล์มีรูปภาพฝังตัวครบถ้วน พร้อมใช้งานทันที</p>
    <p>📊 แสดงข้อมูลทุกแบรนด์ในไฟล์เดียว</p>
  </div>
</body>
</html>`;

  const indexPath = path.join(STYLES_DIR, 'index.html');
  await fs.writeFile(indexPath, indexHtml, 'utf8');
  console.log(`📋 สร้างหน้า Style Index: ${path.relative(ROOT, indexPath)}`);
  
  return indexPath;
}

// ฟังก์ชันหลักสำหรับสร้างทุกสไตล์
async function generateAllStyles() {
  console.log('🎨 เริ่มสร้างหลายสไตล์สำหรับลูกค้าเลือก...\n');
  
  await ensureDir(STYLES_DIR);
  
  // รวบรวมข้อมูลแบรนด์
  const brandData = await collectBrandData();
  
  if (brandData.length === 0) {
    console.error('❌ ไม่พบข้อมูลแบรนด์');
    return;
  }
  
  console.log(`\n🎯 เริ่มสร้าง 5 สไตล์สำหรับ ${brandData.length} แบรนด์...\n`);
  
  // สร้างทุกสไตล์
  await generateMatrixStyle(brandData);
  await generateNeonStyle(brandData);
  await generateMinimalStyle(brandData);
  await generateLuxuryStyle(brandData);
  await generateGamingStyle(brandData);
  
  // สร้างหน้า index
  await generateStyleIndex();
  
  console.log(`\n✨ สร้างครบทุกสไตล์แล้ว!`);
  console.log(`📁 ไฟล์อยู่ในโฟลเดอร์: ${path.relative(ROOT, STYLES_DIR)}`);
  console.log(`🌐 เปิดไฟล์ index.html เพื่อเลือกสไตล์`);
}

// Main function
async function main() {
  try {
    await generateAllStyles();
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateAllStyles,
  generateMatrixStyle,
  generateNeonStyle,
  generateMinimalStyle,
  generateLuxuryStyle,
  generateGamingStyle
};