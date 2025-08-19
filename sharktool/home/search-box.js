(function(){
  const host = document.getElementById('sharktool-search'); if(!host) return;
  const wrap = document.createElement('div');
  const row = document.createElement('div'); row.className = 'row';
  const input = document.createElement('input'); input.className = 'input'; input.placeholder = 'วาง/พิมพ์ URL แล้วกดไป'; input.style.flex = '1';
  const go = document.createElement('button'); go.className = 'btn'; go.textContent = 'ไป';
  const openNew = document.createElement('button'); openNew.textContent = 'เปิดแท็บใหม่'; openNew.className = 'btn'; openNew.style.background = '#2563eb';
  const guideBtn = document.createElement('button'); guideBtn.textContent = 'คู่มือ'; guideBtn.className = 'btn'; guideBtn.style.background = '#16a34a';
  go.onclick = ()=>{ const u=(input.value||'').trim(); if(u){ location.href = u; } };
  openNew.onclick = ()=>{ const u=(input.value||'').trim(); if(u){ window.open(u, '_blank'); } };
  guideBtn.onclick = ()=>{
    // สร้าง modal คู่มือแบบ in-page ไม่ต้องแก้ไฟล์อื่น
    if (document.getElementById('sharktool-guide-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'sharktool-guide-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.6)';
    overlay.style.zIndex = '999999';

    const panel = document.createElement('div');
    panel.style.maxWidth = '900px';
    panel.style.margin = '40px auto';
    panel.style.background = '#101010';
    panel.style.border = '1px solid #222';
    panel.style.borderRadius = '10px';
    panel.style.padding = '16px';
    panel.style.color = '#e5e5e5';
    panel.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    const h = document.createElement('h2'); h.textContent = 'คู่มือสั้น: SharkTool'; h.style.margin = '0'; h.style.fontSize = '20px';
    const close = document.createElement('button'); close.textContent = 'ปิด'; close.className = 'btn'; close.style.background = '#374151';
    close.onclick = ()=> overlay.remove();
    header.append(h, close);

    const sec1 = document.createElement('div'); sec1.style.marginTop = '8px';
    sec1.innerHTML = `
      <h3 style="margin:6px 0">1) วิธีเร็วสุด: ปุ่มลัด (Bookmarklet)</h3>
      <p>คัดลอกโค้ดนี้ไปสร้างเป็นปุ่มลัด แล้วกดบนหน้าเว็บที่ต้องใช้เครื่องมือ</p>
      <pre style="background:#0f0f0f;border:1px solid #222;border-radius:8px;padding:10px;white-space:pre-wrap;word-break:break-word">javascript:(function(){var s=document.createElement('script');s.src='https://sharkkadaw.netlify.app/sharktool/loader.js';document.body.appendChild(s)})()</pre>
      <ul>
        <li>แผง SharkTool จะขึ้นมุมขวาบน</li>
        <li>ติ๊กเครื่องมือที่ต้องใช้ แล้วกด “โหลดที่เลือก”</li>
        <li>เปลี่ยนธีมหน้าเว็บได้</li>
      </ul>
      <p><em>หมายเหตุ:</em> บางเว็บบล็อกสคริปต์ภายนอก (CSP) จึงอาจใช้ไม่ได้</p>
    `;

    const sec2 = document.createElement('div'); sec2.style.marginTop = '8px';
    sec2.innerHTML = `
      <h3 style="margin:6px 0">2) มือถือ Android (แนะนำ Kiwi Browser)</h3>
      <ol>
        <li>ติดตั้ง Kiwi: <a href="https://apkpure.com/kiwi-browser-fast-quiet/com.kiwibrowser.browser" target="_blank" rel="noopener">ลิงก์ดาวน์โหลด</a></li>
        <li>สร้างปุ่มลัด และวางโค้ดด้านบน ตั้งชื่อให้ง่ายต่อการกด</li>
        <li>เปิดเว็บที่ต้องการ แล้วกดปุ่มลัด เพื่อเปิดแผง SharkTool</li>
      </ol>
      <p>ทิป: วางปุ่มลัดไว้ใกล้ช่อง URL จะกดได้เร็ว</p>
    `;

    const sec3 = document.createElement('div'); sec3.style.marginTop = '8px';
    sec3.innerHTML = `
      <h3 style="margin:6px 0">3) ใช้งานแผง SharkTool</h3>
      <ul>
        <li>ค้นหาเครื่องมือ หรือกด “เลือกทั้งหมด/ยกเลิกทั้งหมด”</li>
        <li>ติ๊กเครื่องมือ → กด “โหลดที่เลือก”</li>
        <li>ผลลัพธ์สำเร็จ/ล้มเหลว จะขึ้นในช่อง Log</li>
      </ul>
      <p>ตัวอย่างเครื่องมือ: Monitor, Theme, Snipers, BurpShark, SharkScan, PostShark, Dev Panel</p>
    `;

    const sec4 = document.createElement('div'); sec4.style.marginTop = '8px';
    sec4.innerHTML = `
      <h3 style="margin:6px 0">(ทางเลือก) หน้าแรกแบบฝัง</h3>
      <p>ฝังหน้า Home ได้ด้วยโค้ดนี้</p>
      <pre style="background:#0f0f0f;border:1px solid #222;border-radius:8px;padding:10px;white-space:pre-wrap;word-break:break-word">&lt;iframe src=&quot;https://sharkkadaw.netlify.app/sharktool/home/home.html&quot; style=&quot;width:100%;min-height:900px;border:0;border-radius:8px;overflow:hidden&quot; loading=&quot;lazy&quot;&gt;&lt;/iframe&gt;</pre>
    `;

    const sec5 = document.createElement('div'); sec5.style.marginTop = '8px';
    sec5.innerHTML = `
      <h3 style="margin:6px 0">เพิ่ม/แก้เครื่องมือเอง (สำหรับแอดมิน)</h3>
      <p>แก้ไฟล์ <code>sharktool/home/tools-list.js</code> บล็อก TOOLS</p>
      <pre style="background:#0f0f0f;border:1px solid #222;border-radius:8px;padding:10px;white-space:pre-wrap;word-break:break-word">const REMOTE_BASE = 'https://sharkkadaw.netlify.app/sharktool/';
const TOOLS = [
  { id: 'monitor',   name: 'Monitor',    url: REMOTE_BASE + 'monitor.js' },
  { id: 'theme',     name: 'Theme',      url: REMOTE_BASE + 'Theme.js' },
  { id: 'snipers',   name: 'Snipers',    url: REMOTE_BASE + 'snipers.js' },
  { id: 'burpshark', name: 'BurpShark',  url: REMOTE_BASE + 'burpshark.js' },
  { id: 'sharkscan', name: 'SharkScan',  url: REMOTE_BASE + 'sharkscan.js' },
  { id: 'postshark', name: 'PostShark',  url: REMOTE_BASE + 'postshark.js' },
  // เพิ่มเครื่องมือใหม่ตรงนี้
  // TODO: ใส่ชื่อแสดงผลแทน 'ชื่อเครื่องมือใหม่'
  // TODO: ใส่ชื่อไฟล์สคริปต์แทน 'ไฟล์ใหม่.js'
  { id: 'devpanel',  name: 'ชื่อเครื่องมือใหม่', url: REMOTE_BASE + 'ไฟล์ใหม่.js' }
];</pre>
    `;

    panel.append(header, sec1, sec2, sec3, sec4, sec5);
    overlay.append(panel);
    overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  };
  row.append(input, go, openNew, guideBtn); wrap.append(row); host.append(wrap);
})();
