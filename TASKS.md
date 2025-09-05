# งานตรวจสอบโค้ด (Lint/Check) สำหรับโปรเจกต์ Goonee

เอกสารนี้อธิบายวิธีติดตั้งและใช้งานเครื่องมือตรวจสอบโค้ด (ESLint, HTMLHint, Stylelint) เพื่อช่วยหา bug และปัญหามาตรฐานโค้ดในไฟล์ JavaScript/HTML/CSS ของโปรเจกต์นี้

## 1) เตรียมเครื่องมือ
- ติดตั้ง Node.js (แนะนำเวอร์ชัน LTS): https://nodejs.org/
- เปิด Terminal/PowerShell ที่โฟลเดอร์โปรเจกต์นี้ แล้วติดตั้งแพ็กเกจที่ใช้ตรวจสอบโค้ด:

```powershell
npm i -D eslint@^8.57.0 htmlhint@^1.1.4 stylelint@^16.7.0 stylelint-config-standard@^36.0.0
```

ไฟล์ที่ถูกเตรียมไว้ให้แล้ว:
- `.eslintrc.json` — ตั้งค่าสำหรับ JavaScript
- `.htmlhintrc` — ตั้งค่าสำหรับ HTML
- `.stylelintrc.json` — ตั้งค่าสำหรับ CSS
- `package.json` — คำสั่ง npm scripts สำหรับรันตรวจต่างๆ

หมายเหตุเกี่ยวกับ Service Worker (`sw.js`):
- มี `// @ts-nocheck` เพื่อลด warning จากตัว editor เนื่องจาก service worker API ไม่ตรงกับ DOM ปกติใน TypeScript/JS ที่บาง IDE ตรวจ
- ใน `.eslintrc.json` มี `overrides` ให้กับไฟล์ `sw.js` เปิด env `serviceworker` ไว้แล้ว

## 2) รันตรวจทั้งหมด

```powershell
npm run lint
```
คำสั่งนี้จะรัน 3 อย่างเรียงกัน:
- `lint:js` → ESLint ตรวจไฟล์ `.js` ทั้งโปรเจกต์
- `lint:html` → HTMLHint ตรวจไฟล์ `.html`
- `lint:css` → Stylelint ตรวจไฟล์ `.css` และ `.scss`

## 3) Auto-fix สำหรับ JavaScript

```powershell
npm run lint:js:fix
```
- ESLint จะช่วยแก้ปัญหาที่แก้อัตโนมัติได้ เช่น การจัดรูปแบบบางส่วน ฯลฯ
- หากยังมี error ค้าง ให้ดูข้อความและแก้ไฟล์ตามที่รายงาน

## 4) เคล็ดลับและแนวทางแก้
- ถ้าเจอ error ประเภทตัวแปรไม่ประกาศ (`no-undef`) ให้ตรวจว่าตัวแปร global ถูกกำหนดใน `.eslintrc.json > globals` หรือยัง
- ถ้าเป็นไฟล์ที่ทำงานใน context พิเศษ (เช่น service worker) ให้ดู `overrides` ใน `.eslintrc.json`
- ถ้า HTMLHint แจ้งเตือน title/doctype หรืออื่นๆ ในไฟล์ที่ไม่ต้องการตรวจเข้ม สามารถปรับตัวเลือกใน `.htmlhintrc` ได้
- ถ้า Stylelint แจ้งเตือนกับ CSS ที่เป็น style ทดลอง/พิเศษ สามารถปิดกฎเฉพาะบรรทัดด้วยคอมเมนต์ `/* stylelint-disable-next-line rule-name */`

## 5) ข้อเสนอแนะเพิ่มเติม (ถ้าต้องการ)
- ตั้ง CI ให้ตรวจทุกครั้งที่ push/PR (GitHub Actions)
- เพิ่ม Prettier เพื่อรูปแบบโค้ดที่สม่ำเสมอ (optional)

หากต้องการให้รันคำสั่งตรวจให้เลย บอกได้ครับ เดี๋ยวผมรันให้และสรุปผล error/warning พร้อมแนวทางแก้ให้ทันที
