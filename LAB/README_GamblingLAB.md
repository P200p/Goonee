LAB: Gambling API (จำลอง) — ฝึก JavaScript / fetch

วัตถุประสงค์
- สร้างความคุ้นเคยกับการใช้งาน fetch / API calls ใน JavaScript
- เรียนรู้การอ่าน request/response, headers, และการจัดการ errors (timeout, retry, rate-limit)

ไฟล์ที่เพิ่ม
- `GamblingAPI_lab.html` — หน้าเว็บฝึกใช้งาน
- `gambling-lab.js` — โค้ด frontend ที่จะยิง API และเป็นจุดที่ให้นักเรียนแก้
- `sw-gamble.js` — Service Worker ที่จำลอง /api/* endpoints (login, balance, spin)

แนะนำการใช้งาน
1. เปิด `GamblingAPI_lab.html` ในเบราว์เซอร์ (แนะนำ Chrome/Edge)
2. เปิด DevTools -> Network/Console เพื่อดู request และ response
3. ทดลองแก้ไข `gambling-lab.js` ในส่วน `apiFetch`:
   - เปลี่ยน `x-api-key` เพื่อดู 401
   - ลด `timeoutMs` เพื่อดู AbortError
   - แก้ retry policy หรือเพิ่ม exponential backoff
4. ทดลองแก้ `sw-gamble.js` เพื่อเปลี่ยน logic เช่น เพิ่มโอกาสชนะหรือเพิ่ม rate limit

ทดสอบบนมือถือ / Device Emulation
- หน้าจอปรับแบบ responsive สำหรับมือถือแล้ว (touch overlay และ swipe-to-spin)
- วิธีทดสอบบนเครื่องเดสก์ท็อป: เปิด DevTools → Toggle device toolbar (Ctrl+Shift+M) แล้วโหลดหน้าแลบ
- วิธีทดสอบบนมือถือจริง: รันเซิร์ฟเวอร์ท้องถิ่นตาม README_DEPLOY.md แล้วเปิดจากมือถือในเครือข่ายเดียวกัน `http://<PC-IP>:8000/GamblingAPI_lab.html`
- ควบคุมด้วยการแตะปุ่ม Spin หรือปัดขึ้น (swipe up) เพื่อเริ่มการหมุนบนอุปกรณ์สัมผัส

Open slides / worksheet
- เปิดสไลด์สั้น ๆ สำหรับนำเสนอ: `LAB_SLIDES.html` (แนะนำเปิดจากเซิร์ฟเวอร์ท้องถิ่น)
- เปิด worksheet สำหรับแจกผู้เรียน: `WORKSHEET_GamblingLAB.md`

ตัวอย่าง: ถ้าเรียกจากเซิร์ฟเวอร์ localhost ให้เปิด
`http://localhost:8000/LAB_SLIDES.html`


Scripts Library (แนว "ให้ใช้ก่อนแล้วค่อยเขียน")
- ใน DevTools Simulator มี "Scripts Library" ให้เลือกสคริปต์ตัวอย่าง (AutoSpin, ShowHeaders, InterceptModify)
- ผู้เรียนสามารถกด "Show code" เพื่อดูสคริปต์ และกด "Run script" เพื่อรันใน simulated console
- วิธีนี้สอนแนวคิด JavaScript โดยให้ตัวอย่างทำงานจริง แล้วเชิญให้ผู้เรียนแก้ทีละขั้นเมื่อสนใจ

แบบฝึกหัด (ย่อ)
- Task A: ทำให้ปุ่ม Spin มี loading state และป้องกันการกดซ้อน
- Task B: เพิ่ม UI สำหรับตั้งค่า bet และ validate input
- Task C: เพิ่ม log ที่แยก request/response แบบ JSON prettified
- Task D (advance): เปลี่ยน service worker ให้มี endpoint `/api/transactions` ที่เก็บประวัติการหมุน

หมายเหตุเรื่องความรับผิดชอบ
- ตัวอย่างนี้จำลองเว็บพนันเพื่อการศึกษาเท่านั้น ห้ามนำไปใช้จริงหรือเชื่อมต่อกับระบบเงินจริง
- หากต้องการขยาย ให้เพิ่ม unit tests หรือ playground แยกสำหรับ security lab

การตั้งค่า API Key (แนะนำ)
- อย่าเก็บคีย์จริงในซอร์สโค้ดหรือคอมมิตสาธารณะ
- สร้างไฟล์ `.env` ในเครื่องของคุณโดยใช้ตัวอย่าง `LAB/.env.example` และตั้งค่า `X_API_KEY` เป็นคีย์จริงในเครื่อง (ไม่ต้องคอมมิตไฟล์นี้)
- โค้ดตัวอย่างใน `gambling-lab.js` ใช้ placeholder `<DEMO_KEY>` ตอนแรกเพื่อการทดสอบ หากต้องการทดสอบการ authenticate ให้เปลี่ยนค่าในสภาพแวดล้อมของคุณหรือใช้ DevTools simulator


