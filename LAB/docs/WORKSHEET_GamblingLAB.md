# Gambling API Lab — Workshop Worksheet

เวิร์กชีทนี้ออกแบบเพื่อผู้เรียนที่เข้าร่วม workshop: ทำตามขั้นตอนและเขียนคำตอบสั้น ๆ ในแต่ละหัวข้อ

## ก่อนเริ่ม
- เปิดหน้า `GamblingAPI_lab.html` ใน GitHub Pages (หรือ `docs/GamblingAPI_lab.html` ใน repo)
- ลงชื่อเข้าใช้ (username ใดก็ได้) เช่น `player1`

## Task 1 — Explore the API
1. เปิด Dev Console ในเบราว์เซอร์ (หรือใช้ DevTools Simulator บนหน้า)
2. กด Spin 5 ครั้งและบันทึกผลลัพธ์: ได้แจ็คพอตไหม? ยอดคงเหลือเปลี่ยนอย่างไร?

คำตอบ: ___________________________

## Task 2 — Run a Script
- เปิด Scripts Library และรัน `AutoSpin` (5 รอบ) จากหน้า UI
- สังเกตผลลัพธ์ใน simulated console และใน History

คำตอบ: ___________________________

## Task 3 — Intercept & Modify
1. เปิด Intercept ใน DevTools Simulator
2. กด Spin แล้วเลือกคำขอที่โผล่ในรายการ
3. เปลี่ยน header `x-api-key` เป็นค่าอื่น แล้วกด "Send modified"
4. บันทึกว่า server ตอบอย่างไร (status, body)

คำตอบ: ___________________________

## Task 4 — Challenge (Optional)
- แก้สคริปต์ AutoSpin ให้: ถ้า balance &lt; bet*2 ให้หยุด และส่ง notification ใน console
- หรือ: เพิ่ม retry เมื่อ server ตอบ 429 (รอ 1s แล้วลองใหม่ 2 รอบ)

บันทึกสิ่งที่คุณแก้ไข (สั้น ๆ): ___________________________

## Submit
- ดาวโหลด `history.csv` และส่งให้ผู้สอน
- บอกผู้สอนชื่อผู้เล่นและเวลาเริ่ม
