Gambling API Lab — Worksheet

คำชี้แจงสั้นๆ
- ทำตามขั้นตอนใน worksheet นี้โดยใช้หน้า `GamblingAPI_lab.html` และ DevTools Simulator
- เก็บคำตอบ/ผลลัพธ์เป็นภาพหน้าจอหรือ CSV ที่ดาวน์โหลดได้

ส่วนที่ 1 — สำรวจ (Beginner)
1. เปิดหน้าแลบและกดปุ่ม Login → บันทึกยอดเงินปัจจุบัน
2. กด Spin หนึ่งครั้ง ดู response ใน simulated console และเขียนสรุปว่า response มีฟิลด์อะไรบ้าง

ส่วนที่ 2 — ใช้ Scripts Library
1. เลือกสคริปต์ `AutoSpin demo (5 spins)` แล้วกด Run
2. ถ่ายภาพหน้าจอของ simulated console ที่แสดงผลของ 5 spins
3. เปิด "Show code" แล้วหา: มีการใช้ฟังก์ชันใดเพื่อรอระหว่างสปิน (hint: setTimeout/Promise)

ส่วนที่ 3 — DevTools Intercept (Intermediate)
1. เปิด "Intercept outgoing requests" แล้วกด Spin
2. เลือกคำขอที่โผล่ในรายการ แล้วแก้ header `x-api-key` เป็น `<DEMO_KEY>` (ถ้ายังไม่ใช่)
3. กด "Send modified" แล้วบันทึกผลลัพธ์

ส่วนที่ 4 — Challenge (Optional, Advanced)
1. แก้โค้ดใน `sw-gamble.js` (จำลองฝั่ง server) เพื่อเพิ่ม endpoint `/api/transactions` ที่เก็บทุกรายการหมุน
2. ปรับ `gambling-lab.js` ให้เรียก endpoint ดังกล่าวหลังทุกการหมุน
3. ส่งไฟล์ CSV ของ transaction history ที่ได้

ส่งงาน
- ส่งไฟล์ภาพหน้าจอและ/หรือไฟล์ CSV จาก history
- เขียนสรุปสั้น ๆ (3–5 ประโยค) ว่าคุณได้เรียนรู้อะไรจากแลบนี้
