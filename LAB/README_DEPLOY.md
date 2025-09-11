Deploy quickstart for LAB

1) From PowerShell in the `LAB` folder run:

```powershell
.\serve-lab.ps1 -Port 8000
```

2) Open http://localhost:8000/lab.html in your browser.

Notes:
-Script prefers Python (python or python3). If not found it uses Node if available.
-This is for local development and quick deploy only.
-To stop the launched background process, use Task Manager or stop the python/node process started.

Additional labs
- เปิดตัวอย่างแลบ "Gambling API" ที่เพิ่มใหม่: เปิด URL http://localhost:8000/GamblingAPI_lab.html

Slides & worksheet
- เปิดสไลด์สำหรับสอน: http://localhost:8000/LAB_SLIDES.html
- เปิด worksheet: http://localhost:8000/WORKSHEET_GamblingLAB.md
