(function(){
  const host = document.getElementById('sharktool-shortcuts'); if(!host) return;
  const title = document.createElement('div'); title.textContent = 'ไอคอนทางลัด'; title.style.fontWeight='700'; title.style.marginBottom='8px';
  const grid = document.createElement('div'); grid.className = 'grid';
  // ปรับลิสต์นี้ได้เองตามต้องการ
  const SHORTCUTS = [
    { name:'Google', url:'https://www.google.com' },
    { name:'Netlify', url:'https://app.netlify.com' },
    { name:'GitHub', url:'https://github.com' }
  ];
  SHORTCUTS.forEach(s=>{
    const a = document.createElement('a'); a.href=s.url; a.target='_blank'; a.rel='noopener';
    const card = document.createElement('div'); card.className = 'card'; card.textContent = s.name;
    a.append(card); grid.append(a);
  });
  host.append(title, grid);
})();
