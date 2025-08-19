(function(){
  const host = document.getElementById('sharktool-tools'); if(!host) return;
  const REMOTE_BASE = 'https://sharkkadaw.netlify.app/sharktool/';

  const TOOLS = [
    { id: 'monitor',   name: 'Monitor',    url: REMOTE_BASE + 'monitor.js' },
    { id: 'theme',     name: 'Theme',      url: REMOTE_BASE + 'Theme.js' },
    { id: 'snipers',   name: 'Snipers',    url: REMOTE_BASE + 'snipers.js' },
    { id: 'burpshark', name: 'BurpShark',  url: REMOTE_BASE + 'burpshark.js' },
    { id: 'sharkscan', name: 'SharkScan',  url: REMOTE_BASE + 'sharkscan.js' },
    { id: 'postshark', name: 'PostShark',  url: REMOTE_BASE + 'postshark.js' },

    // เพิ่มเครื่องมือใหม่ตรงนี้
    // TODO: ใส่ชื่อแสดงผลแทน 'ชื่อเครื่องมือใหม่'
    // TODO: ใส่ชื่อไฟล์สคริปต์แทน 'ไฟล์ใหม่.js' (วางใน /sharktool/ บน Netlify)
    { id: 'devpanel',  name: 'ชื่อเครื่องมือใหม่', url: REMOTE_BASE + 'ไฟล์ใหม่.js' }
  ];

  const title = document.createElement('div'); title.textContent = 'รายการเครื่องมือ'; title.style.fontWeight='700'; title.style.marginBottom='8px';
  const list = document.createElement('div');
  TOOLS.forEach(t=>{
    const label = document.createElement('label'); label.className = 'label';
    const cb = document.createElement('input'); cb.type='checkbox'; cb.value=t.url; cb.dataset.name=t.name;
    const name = document.createElement('span'); name.textContent = t.name;
    label.append(cb, name); list.append(label);
  });

  const log = document.createElement('div'); log.style.cssText = 'margin-top:8px;font-size:12px;color:#bbb;white-space:pre-wrap';
  function appendLog(m){ log.textContent += (log.textContent? '\n':'' ) + m; }

  const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'โหลดที่เลือก';
  btn.onclick = async ()=>{
    const selected = Array.from(list.querySelectorAll('input[type=checkbox]:checked'));
    if(!selected.length){ appendLog('ยังไม่เลือกเครื่องมือ'); return; }
    appendLog('เริ่มโหลด ' + selected.length + ' รายการ...');
    for(const item of selected){
      const name = item.dataset.name || item.value;
      try{
        await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=item.value; s.onload=res; s.onerror=()=>rej(new Error('โหลดไม่สำเร็จ')); document.body.appendChild(s); });
        appendLog('✓ สำเร็จ: ' + name);
      }catch(e){ appendLog('✗ ล้มเหลว: ' + name + ' (' + e.message + ')'); }
    }
    appendLog('เสร็จสิ้น');
  };

  const wrap = document.createElement('div');
  wrap.append(title, list, btn, log);
  host.append(wrap);
})();
