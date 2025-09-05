// generateGlowGrid.js
// สร้าง HTML สไตล์ใหม่: Matrix Neon Glow Cyberpunk Card Grid
// ไม่เขียนทับไฟล์เดิม! ผลลัพธ์เป็น glow_gift_grid.html


// gen.js - generate hacker matrix style grid HTML from folders
import { promises as fs } from "fs";
import path from "path";

const exts = [
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".ogg"
];
const baseDir = path.resolve(".");

async function getBrandFolders() {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  return entries.filter(e => e.isDirectory() && !e.name.startsWith(".")).map(e => e.name);
}

async function getMedia(folder) {
  const files = await fs.readdir(path.join(baseDir, folder));
  return files.filter(f => exts.includes(path.extname(f).toLowerCase())).slice(0, 5);
}

async function getSignupLink(folder) {
  try {
    const link = await fs.readFile(path.join(baseDir, folder, "signup.txt"), "utf8");
    return link.trim();
  } catch {
    return "#";
  }
}

async function generateMatrixGrid() {
  const folders = await getBrandFolders();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hacker Matrix Signup Grid</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
  <style>
    body {
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
      font-family: 'Orbitron', monospace;
      color: #00ff41;
      min-height: 100vh;
      overflow-x: hidden;
    }
    .matrix-rain {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .matrix-column {
      position: absolute;
      top: -100px;
      font-family: 'Orbitron', monospace;
      font-size: 14px;
      color: #00ff41;
      opacity: 0.6;
      animation: matrix-fall linear infinite;
    }
    @keyframes matrix-fall {
      0% { transform: translateY(-100px); opacity: 1; }
      100% { transform: translateY(100vh); opacity: 0; }
    }
    .header {
      text-align: center;
      padding: 24px 0 18px 0;
      border-bottom: 2px solid #00ff41;
      margin-bottom: 32px;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(10px);
    }
    .header h1 {
      font-size: 2.3rem;
      font-weight: 900;
      text-shadow: 0 0 20px #00ff41;
      margin-bottom: 8px;
      animation: glow-pulse 2s ease-in-out infinite alternate;
      letter-spacing: 2px;
    }
    @keyframes glow-pulse {
      from { text-shadow: 0 0 20px #00ff41; }
      to { text-shadow: 0 0 30px #00ff41, 0 0 40px #00ff41; }
    }
    .subtitle {
      font-size: 1rem;
      color: #00ccff;
      opacity: 0.8;
    }
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      padding: 0 20px 40px 20px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .pack-card {
      background: rgba(0,0,0,0.92);
      border: 2px solid #00ff41;
      border-radius: 14px;
      padding: 20px 16px 16px 16px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 30px rgba(0,255,65,0.18);
      transition: all 0.3s;
      text-align: center;
      animation: card-appear 0.5s ease-out;
    }
    @keyframes card-appear {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .pack-card:hover {
      border-color: #ffd700;
      box-shadow: 0 0 50px rgba(255,215,0,0.3);
      filter: brightness(1.08);
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #00ccff;
      margin-bottom: 10px;
      letter-spacing: 1.2px;
      text-shadow: 0 0 8px #00ccff99;
    }
    .media-carousel {
      width: 100%;
      min-height: 120px;
      display: flex;
      gap: 10px;
      overflow-x: auto;
      margin-bottom: 12px;
      scrollbar-width: thin;
      justify-content: center;
    }
    .media-carousel img, .media-carousel video {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #00ff41;
      background: #111;
      box-shadow: 0 0 15px #00ff4199;
      transition: transform 0.22s, box-shadow 0.22s;
      flex-shrink: 0;
      display: block;
    }
    .media-carousel img:hover, .media-carousel video:hover {
      transform: scale(1.07) rotate(-1deg);
      box-shadow: 0 0 32px #00ff41cc, 0 0 8px #fff;
    }
    .signup-btn {
      background: linear-gradient(45deg, #00ff41, #00ccff);
      color: #000;
      border: none;
      border-radius: 999px;
      padding: 8px 36px;
      font-size: 1.08rem;
      font-family: 'Orbitron', monospace;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin-top: 1.1rem;
      margin-bottom: 0.2rem;
      box-shadow: 0 0 18px #00ff41cc;
      cursor: pointer;
      transition: background 0.18s, color 0.18s, box-shadow 0.18s;
      z-index: 2;
    }
    .signup-btn:hover {
      background: linear-gradient(45deg, #00ccff, #00ff41);
      color: #fff;
      box-shadow: 0 0 32px #00ff41ee, 0 0 8px #fff;
      filter: brightness(1.12);
    }
    @media (max-width: 768px) {
      .header h1 { font-size: 1.5rem; }
      .grid-container { grid-template-columns: 1fr; padding: 0 8px; }
      .pack-card { padding: 12px; }
      .media-carousel img, .media-carousel video { width: 90px; height: 90px; }
    }
  </style>
</head>
<body>
  <div class="matrix-rain" id="matrixRain"></div>
  <div class="header">
    <h1>HACKER SIGNUP GRID</h1>
    <div class="subtitle">MATRIX TERMINAL - AUTO SCAN BRAND FOLDERS</div>
  </div>
  <div class="grid-container">
${(
  await Promise.all(
    folders.map(async (folder) => {
      const items = await getMedia(folder);
      const signupLink = await getSignupLink(folder);
      return `<div class="pack-card">
        <div class="brand-title">${folder}</div>
        <div class="media-carousel">
          ${items
            .map((item) => {
              if (!item) return `<span class='img-placeholder'></span>`;
              if (/\.(mp4|webm|ogg)$/i.test(item)) {
                return `<video src="${folder}/${item}" muted loop autoplay playsinline></video>`;
              }
              return `<img src="${folder}/${item}" alt="${folder}" onerror="this.style.opacity=0.13;this.style.borderStyle='dashed';">`;
            })
            .join("")}
        </div>
        <a href="${signupLink}" class="signup-btn" target="_blank">สมัครกับ ${folder}</a>
      </div>`;
    })
  )
).join("\n")}
  </div>

  <script>
  // Matrix rain effect
  function createMatrixRain() {
    const matrixContainer = document.getElementById('matrixRain');
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌเนノハヒฟヘホマミムメモヤユヨラリルレロワヲン';
    matrixContainer.innerHTML = '';
    for (let i = 0; i < 50; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.left = Math.random() * 100 + '%';
      const duration = (Math.random() * 3 + 2).toFixed(2);
      const delay = (Math.random() * 2).toFixed(2);
      column.style.animationDuration = duration + 's';
      column.style.animationDelay = delay + 's';
      let columnText = '';
      for (let j = 0; j < 20; j++) {
        columnText += characters.charAt(Math.floor(Math.random() * characters.length)) + '<br>';
      }
      column.innerHTML = columnText;
      matrixContainer.appendChild(column);
    }
  }
  createMatrixRain();
  setInterval(() => { createMatrixRain(); }, 30000);
  const clickSound = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae7b7.mp3');
  setTimeout(() => {
    document.querySelectorAll('.signup-btn').forEach(btn => {
      btn.addEventListener('click', () => { clickSound.currentTime = 0; clickSound.play(); });
    });
  }, 100);
  </script>
</body>
</html>`;
  await fs.writeFile("glow_gift_grid.html", html);
  console.log("✅ สร้าง glow_gift_grid.html สไตล์ hacker matrix สำเร็จ");
}
generateMatrixGrid();