// generate_gcwin.js
// สแกนโฟลเดอร์ web/<brand>/ แล้วสร้างหน้า Landing แบบมินิมอลสไตล์ gcwin99
// - หน้ารวม: gc_index.html (ที่รากโปรเจกต์)
// - หน้าแบรนด์: gc_pages/<brand>/index.html (โฟลเดอร์ใหม่ ไม่ทับของเดิม)

const fs = require('fs').promises;
const path = require('path');

const ROOT = __dirname;
const WEB_DIR = path.join(ROOT, 'web');
const OUT_DIR = path.join(ROOT, 'gc_pages');
const INDEX_FILE = path.join(ROOT, 'gc_index.html');

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
    if (!url) return '#';
    return url;
  } catch (e) {
    return '#';
  }
}

function buildBrandHtml(brand, signupUrl) {
  // หน้าแบบมินิมอล คล้ายอ้างอิง: ปุ่ม "เริ่มต้นใช้งาน" กลางหน้า
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(brand)} - เริ่มต้นใช้งาน</title>
  <meta name="robots" content="noindex,follow" />
  <style>
    :root {
      --bg: #0b0c10;
      --card: #12141a;
      --accent: #14b8a6;
      --accent-2: #22d3ee;
      --text: #e5e7eb;
      --muted: #9ca3af;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }
    body {
      background: radial-gradient(1200px 800px at 50% -10%, rgba(20,184,166,0.08), transparent 60%),
                  radial-gradient(1000px 600px at 120% 120%, rgba(34,211,238,0.08), transparent 60%),
                  var(--bg);
      color: var(--text);
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
      display: grid;
      place-items: center;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 560px;
      background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 32px 24px 28px;
      box-shadow: 0 10px 35px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
      backdrop-filter: blur(6px);
      text-align: center;
    }
    .logo {
      width: 72px; height: 72px; border-radius: 16px;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      display: inline-grid; place-items: center; color: #001010;
      font-weight: 900; letter-spacing: .5px; font-size: 22px;
      margin-bottom: 14px; box-shadow: 0 10px 30px rgba(20,184,166,0.35);
      user-select: none;
    }
    h1 { font-size: 22px; margin: 4px 0 8px; letter-spacing: .2px; }
    p  { margin: 0; color: var(--muted); font-size: 14px; }
    .cta {
      display: inline-flex; gap: 10px; align-items: center; justify-content: center;
      padding: 14px 22px; border-radius: 999px; border: none; cursor: pointer;
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
      color: #001010; font-weight: 800; letter-spacing: .3px; font-size: 16px;
      margin-top: 18px; text-decoration: none;
      box-shadow: 0 10px 30px rgba(34,211,238,0.3);
      transition: transform .15s ease, filter .15s ease, box-shadow .15s ease;
    }
    .cta:hover { transform: translateY(-1px); filter: brightness(1.05); box-shadow: 0 12px 38px rgba(34,211,238,0.38); }
    .cta:active { transform: translateY(0); filter: brightness(0.98); }
    .divider { height: 1px; background: rgba(255,255,255,0.08); margin: 20px 0 14px; }
    .foot { font-size: 12px; color: var(--muted); opacity: .9; }
  </style>
</head>
<body>
  <main class="card">
    <div class="logo">${escapeHtml(brand[0] || 'G')}</div>
    <h1>${escapeHtml(brand)}</h1>
    <p>กดปุ่มด้านล่างเพื่อเริ่มต้นใช้งาน</p>
    <a class="cta" href="${escapeHtml(signupUrl)}" target="_blank" rel="noopener">เริ่มต้นใช้งาน</a>
    <div class="divider"></div>
    <div class="foot">อัปเดตอัตโนมัติจากโฟลเดอร์ web/${escapeHtml(brand)}</div>
  </main>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildIndexHtml(items) {
  // items: [{ brand, urlRel }]
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GC Pages Index</title>
  <style>
    :root { --bg:#0b0c10; --tile:#10131a; --border:#1f2937; --accent:#22d3ee; --text:#e5e7eb; --muted:#9ca3af; }
    * { box-sizing: border-box; }
    html, body { height:100%; margin:0; }
    body { background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
    header { padding: 22px; border-bottom: 1px solid var(--border); display:flex; align-items:center; gap:12px; }
    header .dot { width: 12px; height: 12px; border-radius: 999px; background: var(--accent); box-shadow: 0 0 18px rgba(34,211,238,.6); }
    header h1 { font-size: 18px; margin:0; letter-spacing:.2px; }
    main { padding: 18px 20px 28px; max-width: 980px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    .item { background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015)); border:1px solid var(--border); border-radius: 12px; padding: 14px; display:flex; justify-content:space-between; align-items:center; }
    .brand { font-weight:700; letter-spacing:.2px; }
    .go { text-decoration:none; font-size: 13px; color: #001010; background: var(--accent); padding: 8px 12px; border-radius: 999px; font-weight:800; }
    footer { color: var(--muted); font-size: 12px; padding: 10px 20px 20px; text-align:center; }
  </style>
</head>
<body>
  <header>
    <div class="dot"></div>
    <h1>GC Pages</h1>
  </header>
  <main>
    <div class="grid">
      ${items.map(it => `<div class=\"item\"><div class=\"brand\">${escapeHtml(it.brand)}</div><a class=\"go\" href=\"${escapeHtml(it.urlRel)}\">เปิด</a></div>`).join('\n')}
    </div>
  </main>
  <footer>สร้างอัตโนมัติจากโฟลเดอร์ web/* — ไม่แก้ไขไฟล์ภายใน <code>web/</code></footer>
</body>
</html>`;
}

async function main() {
  const brands = await getBrandFolders();
  await ensureDir(OUT_DIR);

  const indexItems = [];

  for (const brand of brands) {
    const signupUrl = await readSignupUrl(brand);
    const brandDir = path.join(OUT_DIR, brand);
    await ensureDir(brandDir);

    const html = buildBrandHtml(brand, signupUrl);
    const outFile = path.join(brandDir, 'index.html');
    await fs.writeFile(outFile, html, 'utf8');

    // สำหรับหน้า index ใช้พาธสัมพัทธ์จากรากโปรเจกต์
    const rel = path.relative(ROOT, outFile).replaceAll('\\', '/');
    indexItems.push({ brand, urlRel: rel });
  }

  const indexHtml = buildIndexHtml(indexItems);
  await fs.writeFile(INDEX_FILE, indexHtml, 'utf8');

  console.log(`✅ สร้างหน้าแบรนด์แล้ว ${brands.length} รายการ ไปยัง ${path.relative(ROOT, OUT_DIR)}/*/index.html`);
  console.log(`✅ สร้างหน้ารวม: ${path.basename(INDEX_FILE)}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    process.exitCode = 1;
  });
}
