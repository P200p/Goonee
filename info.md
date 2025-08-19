# Hacker Console Panel — คู่มือการใช้งาน

คอนโซลแบบลอยสำหรับทดสอบ/ปรับแต่งหน้าเว็บ สามารถใช้งานได้ทั้งในหน้า `index.html` ของโปรเจกต์ และฉีดเข้าไปยังเว็บไซต์อื่นหลังจาก deploy แล้ว

---

## การเริ่มต้นอย่างรวดเร็ว (Quick Start)

- เปิด `index.html` แล้วกดปุ่ม “Launch Hacker Console” เพื่อแสดงแผงคอนโซล
- ปุ่มเรียกใช้เชื่อมกับ `loader.js` ซึ่งจะทำการฉีด HTML ของแผง, โหลด `style.css` และ `main.js` ให้โดยอัตโนมัติ

```html
<!-- ใน index.html -->
<button onclick="launchConsole()">Launch Hacker Console</button>
<script src="loader.js"></script>
```

---

## ใช้บนเว็บไซต์อื่นหลัง Deploy

เมื่อคุณ deploy โปรเจกต์ (ตัวอย่างโดเมน: `https://goonee.netlify.app`) คุณสามารถเรียกใช้แผงแบบลอยในหน้าเว็บอื่นได้ทันที โดยไม่ต้องโหลดทั้งหน้า

1) ฝังด้วยสคริปต์และปุ่ม:

```html
<button onclick="launchConsole()">Open Console</button>
<script src="https://goonee.netlify.app/loader.js"></script>
```

2) เปิดอัตโนมัติเมื่อโหลดหน้า:

```html
<script src="https://goonee.netlify.app/loader.js?auto=1"></script>
```

3) ใช้แบบ Bookmarklet (ไม่ต้องแก้โค้ดหน้าเว็บ):

```javascript
javascript:(function(){
  var s=document.createElement('script');
  s.src='https://goonee.netlify.app/loader.js?t='+Date.now();
  s.onload=function(){ toggleConsole(); };
  document.body.appendChild(s);
})();
```

---

## API ที่มีให้หลังจากโหลด loader.js

- `launchConsole()` หรือ `showConsole()` — แสดงแผงคอนโซล
- `hideConsole()` — ซ่อนแผงคอนโซล
- `toggleConsole()` — สลับแสดง/ซ่อน
- คีย์ลัด: กด `Ctrl + \`` (ปุ่ม backtick) เพื่อ Toggle อย่างรวดเร็ว

---

## ตัวเลือก Auto-open

คุณสามารถสั่งเปิดแผงอัตโนมัติได้หลายวิธี:

1) ผ่าน attribute บนแท็กสคริปต์:

```html
<script src="loader.js" data-auto="1"></script>
```

2) ผ่าน query string:

```html
<script src="loader.js?auto=1"></script>
```

3) ตั้งค่าสถานะผ่านตัวแปร Global ก่อนโหลด:

```html
<script>window.HC_AUTO = 1;</script>
<script src="loader.js"></script>
```

---

## หมายเหตุ / ข้อจำกัด

- เว็บไซต์บางแห่งอาจมี Content Security Policy (CSP) ที่บล็อกการโหลดไฟล์ข้ามโดเมน ทำให้ฉีดสคริปต์/สไตล์ไม่ได้
- หากโหลดซ้ำหลายครั้ง `loader.js` มีการเช็กและป้องกันการเพิ่มซ้ำของสไตล์/สคริปต์หลักอยู่แล้ว

---

## โครงสร้างไฟล์ที่เกี่ยวข้อง

- `index.html` — หน้าเปล่าพร้อมปุ่มเรียกคอนโซล
- `loader.js` — สคริปต์สำหรับฉีด HTML ของแผง + โหลด `style.css` และ `main.js`
- `style.css` — สไตล์ของแผงคอนโซล
- `main.js` — ลอจิกหลักของแผงคอนโซล

---

หากต้องการปรับแต่ง UI/ปุ่ม/คีย์ลัด หรือเพิ่มพารามิเตอร์อื่น ๆ แจ้งได้เลย
