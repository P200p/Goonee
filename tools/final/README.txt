Shark Tools - extension_pack

This folder contains extension packages for multiple browsers:

📦 Available Packages:
- build/shark-tools-chrome.zip     (Chrome/Chromium - Manifest V3)
- build/shark-tools-firefox.xpi    (Firefox - Manifest V2)  
- build/shark-tools-edge.zip       (Microsoft Edge - Manifest V3)
- build/shark-tools-universal.zip  (Any Chromium-based browser)

Files included in all packages:
- manifest.json (browser-specific version)
- background.js (browser-specific version)
- content.js (แก้ไขแล้ว - cross-browser compatible)
- setting.html
- setting.js
- image/ (full image assets including i1.png - i25.png)

การแก้ไขล่าสุด:
✅ แก้ไขปัญหา floating icon ไม่แสดงผลหลังจากเพิ่มสคริปต์
✅ เพิ่มตัวแปร builtins ที่หายไป
✅ เพิ่ม error handling ที่ดีขึ้น
✅ ปรับปรุงการตรวจสอบ DOM readiness
✅ เพิ่มการจัดการ duplicate icons
✅ แก้ไขปัญหาภาพในรายการปุ่มไม่ตรงกับ floating icon
✅ ปรับปรุงการจัดการไอคอนให้สอดคล้องกันระหว่าง setting page และ floating menu
✅ ลบโค้ดที่ซ้ำซ้อนในการจัดการไอคอน
✅ เพิ่มฟังก์ชัน resolveIconUrls() เพื่อความสอดคล้อง
✅ เปลี่ยนจากการอัพโหลดไฟล์เป็นการเลือกไอคอนจากรายการ (i1.png - i25.png)
✅ ลดความซับซ้อนของระบบจัดการไอคอน
✅ เพิ่มไอคอนให้เลือก 30+ แบบ

How to use:

🌐 CHROME/CHROMIUM:
1. Open Chrome and go to chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked" and select build/chrome folder
   OR drag shark-tools-chrome.zip to the extensions page

🦊 FIREFOX:
1. Open Firefox and go to about:debugging
2. Click "This Firefox" > "Load Temporary Add-on..."
3. Select shark-tools-firefox.xpi file

🌊 MICROSOFT EDGE:
1. Open Edge and go to edge://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked" and select build/chrome folder
   OR drag shark-tools-edge.zip to the extensions page

🔧 BUILD YOUR OWN:
- Run build-extensions.ps1 to create all packages
- Run create-crx.ps1 to create CRX file (optional)

การใช้งาน:
1. หลังจากติดตั้ง extension แล้ว floating icon จะปรากฏที่มุมซ้ายบนของหน้าเว็บ
2. คลิกที่ icon เพื่อเปิดเมนูย่อย (ถ้ามีสคริปต์ที่เพิ่มไว้)
3. สามารถลากไอคอนไปวางตำแหน่งที่ต้องการได้
4. เข้าไปที่ extension settings เพื่อเพิ่มสคริปต์ใหม่
5. เลือกไอคอนจากรายการที่มีให้ (i1.png - i25.png และไอคอนพิเศษอื่นๆ)
6. ไม่จำเป็นต้องอัพโหลดไฟล์ภาพแล้ว - เลือกจากรายการได้เลย

Notes:
- Firefox version uses Manifest V2 for better compatibility
- Chrome/Edge versions use Manifest V3 (latest standard)  
- All versions have identical functionality
- Cross-browser compatible code with browserAPI abstraction
- Icons i1.png - i25.png included for easy selection
- No file uploads needed - select from predefined icons
- ปัญหา floating icon ไม่แสดงผลได้รับการแก้ไขแล้ว

🚀 Production Deployment:
- Chrome Web Store: Submit shark-tools-chrome.zip
- Firefox Add-ons (AMO): Submit shark-tools-firefox.xpi
- Edge Add-ons: Submit shark-tools-edge.zip

If you'd like, I can also: add a sample test script, or reduce host_permissions for privacy, or produce a CRX (requires a key).