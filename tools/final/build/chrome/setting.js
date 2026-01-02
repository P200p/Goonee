(function(){
  const DB_NAME = 'bundle_extension_db';
  const DB_VERSION = 1;

  // Popular Scripts Database
  const POPULAR_SCRIPTS = {
    console2: {
      id: 'console2',
      name: 'กูนี่คอนโซล 2 mini',
      description: 'เครื่องมือ console ขั้นสูงพร้อมธีมและฟีเจอร์ครบครัน รองรับการบันทึกสคริปต์และเครื่องมือ utility ต่างๆ พร้อมฟังก์ชัน DOM, Network และ Storage utilities',
      icon: 'image/postshark_40.png',
      category: 'development',
      tags: ['console', 'debug', 'utility', 'dom', 'network', 'storage'],
      code: `(function() {
        'use strict';
        
        // Console2 - Advanced Console Tool
        console.log('กูนี่คอนโซล 2 - เริ่มต้นแล้ว');
        
        // Create Console2 panel
        const existingPanel = document.getElementById('console2-panel');
        if (existingPanel) {
          existingPanel.remove();
        }
        
        const panel = document.createElement('div');
        panel.id = 'console2-panel';
        panel.style.cssText = \`
          position: fixed;
          top: 50px;
          right: 50px;
          width: 450px;
          height: 350px;
          background: #161b22;
          border: 2px solid #00bcd4;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 188, 212, 0.3);
          color: #fff;
          font-family: 'Courier New', monospace;
          z-index: 2147483647;
          display: flex;
          flex-direction: column;
          resize: both;
          overflow: hidden;
          min-width: 300px;
          min-height: 200px;
        \`;
        
        panel.innerHTML = \`
          <div id="console2-header" style="
            background: #0d1117;
            padding: 8px 12px;
            border-bottom: 1px solid #30363d;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
          ">
            <span style="color: #00bcd4; font-weight: bold;">กูนี่คอนโซล 2</span>
            <div>
              <button id="console2-save-btn" style="
                background: #21262d;
                border: 1px solid #30363d;
                color: #f0f6fc;
                padding: 4px 8px;
                margin-right: 4px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              ">Save</button>
              <button id="console2-load-btn" style="
                background: #21262d;
                border: 1px solid #30363d;
                color: #f0f6fc;
                padding: 4px 8px;
                margin-right: 4px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              ">Load</button>
              <button id="console2-theme-btn" style="
                background: #21262d;
                border: 1px solid #30363d;
                color: #f0f6fc;
                padding: 4px 8px;
                margin-right: 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              ">Theme</button>
              <button id="console2-close" style="
                background: #da3633;
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
              ">✕</button>
            </div>
          </div>
          <div style="
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 8px;
          ">
            <div id="console2-output" style="
              flex: 1;
              background: #0d1117;
              border: 1px solid #30363d;
              border-radius: 6px;
              padding: 8px;
              overflow-y: auto;
              font-size: 12px;
              line-height: 1.4;
              margin-bottom: 8px;
              white-space: pre-wrap;
            "></div>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <input id="console2-input" type="text" placeholder="Enter JavaScript code..." style="
                flex: 1;
                background: #21262d;
                border: 1px solid #30363d;
                color: #f0f6fc;
                padding: 6px 8px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
              ">
              <button id="console2-run" style="
                background: #238636;
                border: none;
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              ">Run</button>
              <button id="console2-clear" style="
                background: #656d76;
                border: none;
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              ">Clear</button>
            </div>
            <div style="display: flex; gap: 8px;">
              <button id="console2-utils-btn" style="
                background: #6f42c1;
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
              ">Utils</button>
              <button id="console2-dom-btn" style="
                background: #0969da;
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
              ">DOM</button>
              <button id="console2-network-btn" style="
                background: #1f883d;
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
              ">Network</button>
              <button id="console2-storage-btn" style="
                background: #cf222e;
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
              ">Storage</button>
            </div>
          </div>
        \`;
        
        document.body.appendChild(panel);
        
        // Make panel draggable
        const header = panel.querySelector('#console2-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        header.addEventListener('mousedown', (e) => {
          if (e.target.tagName === 'BUTTON') return;
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          const rect = panel.getBoundingClientRect();
          startLeft = rect.left;
          startTop = rect.top;
          panel.style.left = startLeft + 'px';
          panel.style.top = startTop + 'px';
          panel.style.right = 'auto';
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
          e.preventDefault();
        });
        
        function onMouseMove(e) {
          if (!isDragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          panel.style.left = (startLeft + dx) + 'px';
          panel.style.top = (startTop + dy) + 'px';
        }
        
        function onMouseUp() {
          isDragging = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }
        
        // Console2 functionality
        const output = panel.querySelector('#console2-output');
        const input = panel.querySelector('#console2-input');
        const runBtn = panel.querySelector('#console2-run');
        const clearBtn = panel.querySelector('#console2-clear');
        const closeBtn = panel.querySelector('#console2-close');
        const themeBtn = panel.querySelector('#console2-theme-btn');
        const saveBtn = panel.querySelector('#console2-save-btn');
        const loadBtn = panel.querySelector('#console2-load-btn');
        const utilsBtn = panel.querySelector('#console2-utils-btn');
        const domBtn = panel.querySelector('#console2-dom-btn');
        const networkBtn = panel.querySelector('#console2-network-btn');
        const storageBtn = panel.querySelector('#console2-storage-btn');
        
        let currentTheme = 'dark';
        let commandHistory = [];
        let historyIndex = -1;
        
        const themes = {
          dark: {
            bg: '#0d1117',
            border: '#30363d',
            text: '#f0f6fc',
            accent: '#00bcd4',
            panelBg: '#161b22'
          },
          light: {
            bg: '#ffffff',
            border: '#d0d7de',
            text: '#24292f',
            accent: '#0969da',
            panelBg: '#f6f8fa'
          }
        };
        
        // Add welcome message
        output.textContent = 'กูนี่คอนโซล 2 พร้อมใช้งาน! 🦈\\nพิมพ์คำสั่ง JavaScript และกด Run\\n\\n';
        
        // Event handlers
        closeBtn.addEventListener('click', () => {
          panel.remove();
        });
        
        clearBtn.addEventListener('click', () => {
          output.textContent = '';
        });
        
        runBtn.addEventListener('click', executeCommand);
        
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            executeCommand();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
              historyIndex++;
              input.value = commandHistory[commandHistory.length - 1 - historyIndex];
            }
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
              historyIndex--;
              input.value = commandHistory[commandHistory.length - 1 - historyIndex];
            } else if (historyIndex === 0) {
              historyIndex = -1;
              input.value = '';
            }
          }
        });
        
        function executeCommand() {
          const command = input.value.trim();
          if (!command) return;
          
          commandHistory.push(command);
          historyIndex = -1;
          
          output.textContent += '> ' + command + '\\n';
          
          try {
            const result = eval(command);
            if (result !== undefined) {
              output.textContent += String(result) + '\\n';
            }
          } catch (error) {
            output.textContent += 'Error: ' + error.message + '\\n';
          }
          
          output.textContent += '\\n';
          output.scrollTop = output.scrollHeight;
          input.value = '';
        }
        
        // Theme switching
        themeBtn.addEventListener('click', () => {
          currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
          applyTheme();
        });
        
        function applyTheme() {
          const theme = themes[currentTheme];
          panel.style.background = theme.panelBg;
          output.style.background = theme.bg;
          output.style.borderColor = theme.border;
          output.style.color = theme.text;
          input.style.background = theme.bg;
          input.style.borderColor = theme.border;
          input.style.color = theme.text;
        }
        
        // Save/Load functionality
        saveBtn.addEventListener('click', () => {
          const scripts = localStorage.getItem('console2-scripts') || '[]';
          const scriptList = JSON.parse(scripts);
          const scriptName = prompt('ชื่อสคริปต์:');
          if (scriptName) {
            scriptList.push({ name: scriptName, code: input.value });
            localStorage.setItem('console2-scripts', JSON.stringify(scriptList));
            output.textContent += 'บันทึกสคริปต์ "' + scriptName + '" แล้ว\\n\\n';
            output.scrollTop = output.scrollHeight;
          }
        });
        
        loadBtn.addEventListener('click', () => {
          const scripts = localStorage.getItem('console2-scripts') || '[]';
          const scriptList = JSON.parse(scripts);
          if (scriptList.length === 0) {
            output.textContent += 'ไม่มีสคริปต์ที่บันทึกไว้\\n\\n';
            output.scrollTop = output.scrollHeight;
            return;
          }
          
          const scriptNames = scriptList.map((s, i) => i + ': ' + s.name).join('\\n');
          const choice = prompt('เลือกสคริปต์:\\n' + scriptNames);
          const index = parseInt(choice);
          
          if (!isNaN(index) && scriptList[index]) {
            input.value = scriptList[index].code;
            output.textContent += 'โหลดสคริปต์ "' + scriptList[index].name + '" แล้ว\\n\\n';
            output.scrollTop = output.scrollHeight;
          }
        });
        
        // Utility functions
        utilsBtn.addEventListener('click', () => {
          const utils = [
            'document.querySelectorAll("*").length // นับ elements',
            'window.location.href // URL ปัจจุบัน',
            'navigator.userAgent // User agent',
            'Object.keys(localStorage) // Local storage keys',
            'performance.now() // เวลาปัจจุบัน'
          ];
          output.textContent += 'Utility Commands:\\n' + utils.join('\\n') + '\\n\\n';
          output.scrollTop = output.scrollHeight;
        });
        
        domBtn.addEventListener('click', () => {
          const domUtils = [
            'document.title // หัวข้อหน้า',
            'document.querySelectorAll("a").length // จำนวนลิงก์',
            'document.querySelectorAll("img").length // จำนวนรูปภาพ',
            'document.body.style.backgroundColor = "red" // เปลี่ยนสีพื้นหลัง'
          ];
          output.textContent += 'DOM Commands:\\n' + domUtils.join('\\n') + '\\n\\n';
          output.scrollTop = output.scrollHeight;
        });
        
        networkBtn.addEventListener('click', () => {
          const networkUtils = [
            'fetch("https://api.github.com/users/octocat").then(r=>r.json()).then(console.log)',
            'navigator.onLine // สถานะเครือข่าย',
            'navigator.connection // ข้อมูลการเชื่อมต่อ'
          ];
          output.textContent += 'Network Commands:\\n' + networkUtils.join('\\n') + '\\n\\n';
          output.scrollTop = output.scrollHeight;
        });
        
        storageBtn.addEventListener('click', () => {
          const storageUtils = [
            'localStorage.setItem("test", "value") // บันทึกข้อมูล',
            'localStorage.getItem("test") // อ่านข้อมูล',
            'Object.keys(localStorage) // ดูข้อมูลทั้งหมด',
            'localStorage.clear() // ลบข้อมูลทั้งหมด'
          ];
          output.textContent += 'Storage Commands:\\n' + storageUtils.join('\\n') + '\\n\\n';
          output.scrollTop = output.scrollHeight;
        });
        
        console.log('✅ กูนี่คอนโซล 2 โหลดเสร็จแล้ว!');
      })();`
    },
    // Additional popular scripts can be added here
    burpshark: {
      id: 'burpshark',
      name: 'BurpShark Mini',
      description: 'เครื่องมือตรวจสอบ HTTP requests และ responses แบบง่าย',
      icon: 'image/burpshark_40.png',
      category: 'security',
      tags: ['http', 'security', 'analysis'],
      code: `(function() {
        'use strict';
        console.log('BurpShark Mini initialized');
        // Placeholder for BurpShark functionality
      })();`
    },
    sharkscan: {
      id: 'sharkscan',
      name: 'SharkScan',
      description: 'เครื่องมือสแกนหาช่องโหว่พื้นฐานในเว็บไซต์',
      icon: 'image/sharkscan_40.png',
      category: 'security',
      tags: ['scan', 'vulnerability', 'security'],
      code: `(function() {
        'use strict';
        console.log('SharkScan initialized');
        // Placeholder for SharkScan functionality
      })();`
    }
  };

  function openDB(){
    return new Promise((resolve,reject)=>{
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e)=>{
        const db = e.target.result;
        if(!db.objectStoreNames.contains('files')) db.createObjectStore('files');
        if(!db.objectStoreNames.contains('config')) db.createObjectStore('config');
      };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error);
    });
  }

  async function putFile(key, blob){
    const db = await openDB();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction('files','readwrite');
      tx.objectStore('files').put(blob, key);
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error);
    });
  }

  async function getFile(key){
    const db = await openDB();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction('files','readonly');
      const r = tx.objectStore('files').get(key);
      r.onsuccess = ()=>resolve(r.result);
      r.onerror = ()=>reject(r.error);
    });
  }
  async function deleteFile(key){
    const db = await openDB();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction('files','readwrite');
      tx.objectStore('files').delete(key);
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error);
    });
  }

  async function getConfig(){
    const db = await openDB();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction('config','readonly');
      const r = tx.objectStore('config').get('items');
      r.onsuccess = ()=>resolve(r.result || []);
      r.onerror = ()=>reject(r.error);
    });
  }

  async function saveConfig(items){
    const db = await openDB();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction('config','readwrite');
      tx.objectStore('config').put(items,'items');
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error);
    });
  }

  // Script Distribution Functions
  function renderScriptDistribution() {
    const scriptGallery = document.getElementById('scriptGallery');
    if (!scriptGallery) return;

    scriptGallery.innerHTML = '';
    
    Object.values(POPULAR_SCRIPTS).forEach(script => {
      const card = document.createElement('div');
      card.className = 'script-card';
      card.dataset.scriptId = script.id;
      
      card.innerHTML = `
        <div class="script-card-header">
          <img src="${script.icon}" alt="${script.name}" class="script-card-icon" onerror="this.src='image/og.png'">
          <h4 class="script-card-title">${script.name}</h4>
        </div>
        <p class="script-card-description">${script.description}</p>
        <button class="use-script-btn" type="button">ใช้สคริปต์นี้</button>
      `;
      
      // Add click handler for script selection
      const useBtn = card.querySelector('.use-script-btn');
      useBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectScript(script);
      });
      
      // Add click handler for card selection
      card.addEventListener('click', () => {
        selectScript(script);
      });
      
      scriptGallery.appendChild(card);
    });
  }

  function selectScript(script) {
    // Remove previous selection
    document.querySelectorAll('.script-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Mark current selection - use CSS.escape for safe querySelector
    const escapedId = CSS.escape(script.id);
    const selectedCard = document.querySelector(`[data-script-id="${escapedId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }
    
    // Populate form fields
    if (nameEl) nameEl.value = script.name;
    if (scriptTextEl) scriptTextEl.value = script.code;
    if (iconSelectEl) iconSelectEl.value = script.icon;
    
    // Update preview
    if (iconPreview && script.icon) {
      const iconUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) 
        ? chrome.runtime.getURL(script.icon) 
        : script.icon;
      iconPreview.src = iconUrl;
    }
    
    // Clear other script inputs to avoid conflicts
    if (scriptFileEl) scriptFileEl.value = '';
    if (scriptBuiltinPathEl) scriptBuiltinPathEl.value = '';
    
    // Provide visual feedback
    const feedback = document.createElement('div');
    feedback.style.cssText = 'position:fixed;top:20px;right:20px;background:#4dd0e1;color:#000;padding:8px 12px;border-radius:4px;z-index:9999;';
    feedback.textContent = `เลือก ${script.name} แล้ว`;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }

  // UI
  const nameEl = document.getElementById('name');
  const iconSelectEl = document.getElementById('iconSelect');
  const iconHoverSelectEl = document.getElementById('iconHoverSelect');
  const scriptFileEl = document.getElementById('scriptFile');
  const scriptTextEl = document.getElementById('scriptText');
  const scriptBuiltinPathEl = document.getElementById('scriptBuiltinPath');
  const scopeSelect = document.getElementById('scopeSelect');
  const scopeHostEl = document.getElementById('scopeHost');
  const addBtn = document.getElementById('addBtn');
  const itemsEl = document.getElementById('items');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const iconPreview = document.getElementById('iconPreview');
  const iconHoverPreview = document.getElementById('iconHoverPreview');

  // Create icon options and setup preview handlers
  function setupIconSelectors() {
    // Generate icon options for i1.png - i25.png
    const iconOptions = [];
    for (let i = 1; i <= 25; i++) {
      if (i === 24) continue; // Skip i24.png as it doesn't exist
      iconOptions.push({
        value: `image/i${i}.png`,
        text: `ไอคอน ${i}`,
        preview: `image/i${i}.png`
      });
    }
    
    // Add other available icons
    const otherIcons = [
      { value: 'image/og.png', text: 'ไอคอนเริ่มต้น', preview: 'image/og.png' },
      { value: 'image/main.png', text: 'ไอคอนหลัก', preview: 'image/main.png' },
      { value: 'image/burpshark_40.png', text: 'BurpShark', preview: 'image/burpshark_40.png' },
      { value: 'image/postshark_40.png', text: 'PostShark', preview: 'image/postshark_40.png' },
      { value: 'image/sharkscan_40.png', text: 'SharkScan', preview: 'image/sharkscan_40.png' },
      { value: 'image/snipers_40.png', text: 'Snipers', preview: 'image/snipers_40.png' }
    ];
    
    const allIcons = [...iconOptions, ...otherIcons];
    
    // Populate icon selectors
    [iconSelectEl, iconHoverSelectEl].forEach(selectEl => {
      if (!selectEl) return;
      
      // Clear existing options except the first one
      while (selectEl.children.length > 1) {
        selectEl.removeChild(selectEl.lastChild);
      }
      
      // Add icon options
      allIcons.forEach(icon => {
        const option = document.createElement('option');
        option.value = icon.value;
        option.textContent = icon.text;
        selectEl.appendChild(option);
      });
    });
    
    // Setup preview handlers
    if (iconSelectEl && iconPreview) {
      iconSelectEl.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        if (selectedValue) {
          const iconUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) 
            ? chrome.runtime.getURL(selectedValue) 
            : selectedValue;
          iconPreview.src = iconUrl;
        } else {
          iconPreview.src = 'image/og.png';
        }
      });
    }
    
    if (iconHoverSelectEl && iconHoverPreview) {
      iconHoverSelectEl.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        if (selectedValue) {
          const iconUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) 
            ? chrome.runtime.getURL(selectedValue) 
            : selectedValue;
          iconHoverPreview.src = iconUrl;
        } else {
          iconHoverPreview.src = 'image/og.png';
        }
      });
    }
  }

  // track object URLs we create so we can revoke them when refreshing/clearing
  const createdPreviewUrls = [];

  // default fallback image (og.png) for preview placeholders
  const defaultOg = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL('image/og.png') : 'image/og.png';
  
  // Enhanced error feedback function with different types and improved accessibility
  function showErrorFeedback(message, type = 'error', options = {}) {
    const feedback = document.createElement('div');
    const colors = {
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3'
    };
    
    const icons = {
      error: '❌',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️'
    };
    
    // Enhanced styling with better accessibility
    feedback.style.cssText = `
      position:fixed;
      top:20px;
      right:20px;
      background:${colors[type] || colors.error};
      color:#fff;
      padding:12px 16px;
      border-radius:6px;
      z-index:9999;
      box-shadow:0 4px 12px rgba(0,0,0,0.3);
      font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial;
      font-size:14px;
      max-width:350px;
      word-wrap:break-word;
      border:2px solid rgba(255,255,255,0.2);
      animation:slideIn 0.3s ease-out;
    `;
    
    // Add icon and message
    const icon = icons[type] || icons.error;
    feedback.innerHTML = `<span style="margin-right:8px;">${icon}</span>${message}`;
    
    // Add ARIA attributes for accessibility
    feedback.setAttribute('role', type === 'error' ? 'alert' : 'status');
    feedback.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    feedback.setAttribute('aria-atomic', 'true');
    
    // Add close button for persistent messages
    if (options.persistent || type === 'error') {
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.style.cssText = `
        background:none;
        border:none;
        color:#fff;
        font-size:18px;
        font-weight:bold;
        margin-left:12px;
        cursor:pointer;
        padding:0;
        line-height:1;
        opacity:0.8;
      `;
      closeBtn.onclick = () => {
        if (feedback.parentNode) {
          feedback.style.animation = 'slideOut 0.2s ease-in';
          setTimeout(() => feedback.remove(), 200);
        }
      };
      closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
      closeBtn.onmouseout = () => closeBtn.style.opacity = '0.8';
      feedback.appendChild(closeBtn);
    }
    
    document.body.appendChild(feedback);
    
    // Add CSS animations if not already present
    if (!document.getElementById('feedback-animations')) {
      const style = document.createElement('style');
      style.id = 'feedback-animations';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Auto-remove after delay (unless persistent)
    if (!options.persistent) {
      const delay = type === 'error' ? 7000 : type === 'warning' ? 5000 : 3000;
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.style.animation = 'slideOut 0.2s ease-in';
          setTimeout(() => feedback.remove(), 200);
        }
      }, delay);
    }
    
    return feedback;
  }

  // Enhanced loading state management with progress indication
  function showLoadingState(element, message = 'กำลังโหลด...', options = {}) {
    if (!element) return null;
    
    const originalText = element.textContent;
    const originalDisabled = element.disabled;
    const originalCursor = element.style.cursor;
    const originalOpacity = element.style.opacity;
    
    // Create loading indicator
    let loadingIndicator = '';
    if (options.showSpinner) {
      loadingIndicator = '<span style="display:inline-block;width:12px;height:12px;border:2px solid #fff;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;"></span>';
    } else if (options.showDots) {
      loadingIndicator = '<span style="animation:dots 1.5s infinite;">...</span>';
    }
    
    element.innerHTML = loadingIndicator + message;
    element.disabled = true;
    element.style.cursor = 'wait';
    element.style.opacity = '0.8';
    
    // Add CSS animations if not already present
    if (!document.getElementById('loading-animations')) {
      const style = document.createElement('style');
      style.id = 'loading-animations';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes dots {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Progress tracking
    let progress = 0;
    let progressInterval = null;
    
    if (options.showProgress) {
      progressInterval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 10, 90);
        element.innerHTML = loadingIndicator + `${message} (${Math.round(progress)}%)`;
      }, 200);
    }
    
    return {
      restore: () => {
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        element.innerHTML = originalText;
        element.textContent = originalText;
        element.disabled = originalDisabled;
        element.style.cursor = originalCursor;
        element.style.opacity = originalOpacity;
      },
      updateMessage: (newMessage) => {
        element.innerHTML = loadingIndicator + newMessage;
      },
      setProgress: (percent) => {
        if (options.showProgress) {
          progress = Math.min(Math.max(percent, 0), 100);
          element.innerHTML = loadingIndicator + `${message} (${Math.round(progress)}%)`;
        }
      }
    };
  }

  // Enhanced form validation functions with comprehensive checks
  function validateFormInputs() {
    const errors = [];
    const warnings = [];
    
    // Validate name field
    const name = nameEl?.value?.trim();
    if (!name) {
      errors.push('กรุณาใส่ชื่อปุ่ม');
    } else if (name.length > 100) {
      errors.push('ชื่อปุ่มยาวเกินไป (สูงสุด 100 ตัวอักษร)');
    } else if (name.length < 2) {
      warnings.push('ชื่อปุ่มสั้นเกินไป (แนะนำอย่างน้อย 2 ตัวอักษร)');
    }
    
    // Check for potentially problematic characters in name
    if (name && /[<>\"'&]/.test(name)) {
      warnings.push('ชื่อปุ่มมีอักขระพิเศษที่อาจทำให้เกิดปัญหา');
    }
    
    // Validate script input (must have either file, text, or builtin path)
    const hasScriptFile = scriptFileEl?.files?.length > 0;
    const hasScriptText = scriptTextEl?.value?.trim();
    const hasScriptBuiltin = scriptBuiltinPathEl?.value?.trim();
    
    if (!hasScriptFile && !hasScriptText && !hasScriptBuiltin) {
      errors.push('กรุณาเลือกไฟล์สคริปต์ หรือใส่โค้ดสคริปต์ หรือใส่ builtin script URL');
    }
    
    // Validate script text if provided
    if (hasScriptText) {
      const scriptText = scriptTextEl.value.trim();
      if (scriptText.length < 10) {
        errors.push('โค้ดสคริปต์สั้นเกินไป (ต้องมีอย่างน้อย 10 ตัวอักษร)');
      } else if (scriptText.length > 1024 * 1024) {
        errors.push('โค้ดสคริปต์ยาวเกินไป (สูงสุด 1MB)');
      }
      
      // Check for potentially dangerous patterns
      const dangerousPatterns = [
        { pattern: /document\.write\s*\(/i, message: 'พบการใช้ document.write ซึ่งอาจไม่ปลอดภัย' },
        { pattern: /eval\s*\(/i, message: 'พบการใช้ eval() ซึ่งมีความเสี่ยงด้านความปลอดภัย' },
        { pattern: /innerHTML\s*=.*<script/i, message: 'พบการแทรก script ผ่าน innerHTML ซึ่งไม่ปลอดภัย' },
        { pattern: /location\s*=\s*["']javascript:/i, message: 'พบ javascript: URL ซึ่งไม่ปลอดภัย' },
        { pattern: /setTimeout\s*\(\s*["'][^"']*["']/i, message: 'พบการใช้ setTimeout กับ string ซึ่งไม่แนะนำ' },
        { pattern: /setInterval\s*\(\s*["'][^"']*["']/i, message: 'พบการใช้ setInterval กับ string ซึ่งไม่แนะนำ' }
      ];
      
      dangerousPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(scriptText)) {
          warnings.push(message);
        }
      });
      
      // Note: Syntax validation removed due to CSP restrictions
      // Scripts will be validated during execution instead
    }
    
    // Validate script file if provided
    if (hasScriptFile) {
      const file = scriptFileEl.files[0];
      if (!file.type.includes('javascript') && !file.name.endsWith('.js')) {
        errors.push('ไฟล์สคริปต์ต้องเป็นไฟล์ .js เท่านั้น');
      }
      if (file.size > 10 * 1024 * 1024) {
        errors.push('ไฟล์สคริปต์ใหญ่เกินไป (สูงสุด 10MB)');
      }
      if (file.size === 0) {
        errors.push('ไฟล์สคริปต์ว่างเปล่า');
      }
    }
    
    // Validate builtin script URL if provided
    if (hasScriptBuiltin) {
      const url = scriptBuiltinPathEl.value.trim();
      if (!url.startsWith('http') && !url.startsWith('image/') && !url.includes('.js')) {
        errors.push('builtin script URL ไม่ถูกต้อง (ต้องขึ้นต้นด้วย http หรือ image/ หรือมี .js)');
      }
      
      // Check for suspicious URLs
      if (url.includes('javascript:') || url.includes('data:') || url.includes('blob:')) {
        warnings.push('builtin script URL อาจไม่ปลอดภัย');
      }
    }
    
    // Validate scope host if host scope is selected
    if (scopeSelect?.value === 'host') {
      const scopeHost = scopeHostEl?.value?.trim();
      if (scopeHost && scopeHost.length > 0) {
        // Enhanced domain validation
        const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!domainPattern.test(scopeHost)) {
          errors.push('รูปแบบโดเมนไม่ถูกต้อง (เช่น example.com หรือ subdomain.example.com)');
        } else if (scopeHost.length > 253) {
          errors.push('ชื่อโดเมนยาวเกินไป (สูงสุด 253 ตัวอักษร)');
        }
        
        // Check for suspicious domains
        const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0', 'file://', 'data:', 'javascript:'];
        if (suspiciousDomains.some(suspicious => scopeHost.toLowerCase().includes(suspicious))) {
          warnings.push('โดเมนที่ระบุอาจไม่เหมาะสมสำหรับการใช้งานจริง');
        }
      }
    }
    
    // Validate icon selections if provided
    const iconSelected = iconSelectEl?.value?.trim();
    const iconHoverSelected = iconHoverSelectEl?.value?.trim();
    
    if (iconSelected && !iconSelected.startsWith('image/')) {
      errors.push('ไอคอนที่เลือกไม่ถูกต้อง');
    }
    
    if (iconHoverSelected && !iconHoverSelected.startsWith('image/')) {
      errors.push('ไอคอน hover ที่เลือกไม่ถูกต้อง');
    }
    
    return { errors, warnings };
  }

  // Enhanced script execution error handling with detailed error analysis
  function handleScriptExecutionError(error, context = '') {
    console.error('Script execution error:', error, context);
    
    let userMessage = 'เกิดข้อผิดพลาดในการรันสคริปต์';
    let errorType = 'error';
    let suggestions = [];
    
    if (error.name === 'SyntaxError') {
      userMessage = 'สคริปต์มีข้อผิดพลาดทางไวยากรณ์';
      suggestions.push('ตรวจสอบ syntax ของ JavaScript');
      suggestions.push('ตรวจสอบวงเล็บ { } และเครื่องหมาย ; ');
    } else if (error.name === 'ReferenceError') {
      userMessage = 'สคริปต์อ้างอิงตัวแปรหรือฟังก์ชันที่ไม่มีอยู่';
      suggestions.push('ตรวจสอบชื่อตัวแปรและฟังก์ชัน');
      suggestions.push('ตรวจสอบว่าได้ประกาศตัวแปรแล้ว');
    } else if (error.name === 'TypeError') {
      userMessage = 'สคริปต์มีข้อผิดพลาดเกี่ยวกับประเภทข้อมูล';
      suggestions.push('ตรวจสอบประเภทของข้อมูลที่ใช้');
      suggestions.push('ตรวจสอบว่า object หรือ array มีอยู่จริง');
    } else if (error.name === 'RangeError') {
      userMessage = 'สคริปต์มีข้อผิดพลาดเกี่ยวกับช่วงของข้อมูล';
      suggestions.push('ตรวจสอบขนาดของ array หรือ string');
      suggestions.push('ตรวจสอบค่าที่ส่งให้ฟังก์ชัน');
    } else if (error.message) {
      userMessage = `เกิดข้อผิดพลาด: ${error.message}`;
      
      // Analyze common error patterns
      if (error.message.includes('fetch')) {
        suggestions.push('ตรวจสอบการเชื่อมต่อเครือข่าย');
        suggestions.push('ตรวจสอบ URL ที่เรียกใช้');
      } else if (error.message.includes('permission')) {
        suggestions.push('ตรวจสอบสิทธิ์การเข้าถึง');
        suggestions.push('อาจต้องอนุญาตใน browser settings');
      } else if (error.message.includes('CORS')) {
        suggestions.push('เซิร์ฟเวอร์ปลายทางไม่อนุญาต CORS');
        suggestions.push('ลองใช้ proxy หรือเปลี่ยน API endpoint');
      }
    }
    
    // Show main error message
    const errorFeedback = showErrorFeedback(userMessage, errorType, { persistent: true });
    
    // Show suggestions if available
    if (suggestions.length > 0) {
      setTimeout(() => {
        const suggestionMessage = `แนะนำการแก้ไข:\n• ${suggestions.join('\n• ')}`;
        showErrorFeedback(suggestionMessage, 'info', { persistent: true });
      }, 1000);
    }
    
    // Log detailed error for debugging
    if (context) {
      console.group(`Script Error in ${context}`);
      console.error('Error object:', error);
      console.error('Stack trace:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.groupEnd();
    }
    
    return false;
  }

  // Enhanced network error handling with retry mechanisms
  function handleNetworkError(error, context = '', options = {}) {
    console.error('Network error:', error, context);
    
    let userMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย';
    let errorType = 'error';
    let suggestions = [];
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      userMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      suggestions.push('ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      suggestions.push('ตรวจสอบว่า URL ถูกต้อง');
      suggestions.push('เซิร์ฟเวอร์อาจไม่พร้อมใช้งาน');
    } else if (error.message?.includes('CORS')) {
      userMessage = 'ถูกบล็อกโดยนโยบาย CORS';
      suggestions.push('เซิร์ฟเวอร์ไม่อนุญาตการเข้าถึงจากโดเมนนี้');
      suggestions.push('ติดต่อผู้ดูแลเซิร์ฟเวอร์เพื่อเปิดใช้ CORS');
    } else if (error.message?.includes('timeout')) {
      userMessage = 'การเชื่อมต่อหมดเวลา';
      suggestions.push('เครือข่ายอาจช้า ลองใหม่อีกครั้ง');
      suggestions.push('เพิ่มเวลา timeout หากเป็นไปได้');
    } else if (error.message?.includes('404')) {
      userMessage = 'ไม่พบไฟล์หรือ URL ที่ระบุ';
      suggestions.push('ตรวจสอบ URL ให้ถูกต้อง');
      suggestions.push('ไฟล์อาจถูกย้ายหรือลบ');
    } else if (error.message?.includes('403')) {
      userMessage = 'ไม่มีสิทธิ์เข้าถึงไฟล์หรือ URL นี้';
      suggestions.push('ตรวจสอบสิทธิ์การเข้าถึง');
      suggestions.push('อาจต้องเข้าสู่ระบบก่อน');
    } else if (error.message?.includes('500')) {
      userMessage = 'เซิร์ฟเวอร์มีปัญหาภายใน';
      suggestions.push('ปัญหาอยู่ที่เซิร์ฟเวอร์');
      suggestions.push('ลองใหม่ในภายหลัง');
    }
    
    // Show main error message
    showErrorFeedback(userMessage, errorType);
    
    // Show suggestions after a delay
    if (suggestions.length > 0) {
      setTimeout(() => {
        const suggestionMessage = `แนะนำการแก้ไข:\n• ${suggestions.join('\n• ')}`;
        showErrorFeedback(suggestionMessage, 'info');
      }, 1500);
    }
    
    // Offer retry option for certain errors
    if (options.allowRetry && (error.message?.includes('timeout') || error.message?.includes('500'))) {
      setTimeout(() => {
        const retryFeedback = showErrorFeedback('คลิกเพื่อลองใหม่', 'info', { persistent: true });
        retryFeedback.style.cursor = 'pointer';
        retryFeedback.onclick = () => {
          retryFeedback.remove();
          if (typeof options.retryCallback === 'function') {
            options.retryCallback();
          }
        };
      }, 2000);
    }
    
    return false;
  }
  
  // Setup icon selectors and initialize
  setupIconSelectors();

  async function refreshList(){
    try {
      const items = await getConfig();
      // revoke any created preview object URLs from previous render
      try { createdPreviewUrls.forEach(u=>{ try{ URL.revokeObjectURL(u); }catch(_){} }); } catch(e){}
      createdPreviewUrls.length = 0;
      itemsEl.innerHTML = '';
      
      if (!items || items.length === 0) {
        itemsEl.innerHTML = '<div style="color:#999;padding:20px;text-align:center;">ยังไม่มีปุ่มที่สร้าง</div>';
        return;
      }
      
      for(const it of items){
        try {
          const div = document.createElement('div'); div.className='item';
          const img = document.createElement('img'); img.className='preview';
          let imgNormalSrc = '';
          let imgHoverSrc = '';
          
          // Handle normal icon with error checking
          if(it.iconBuiltin){
            imgNormalSrc = it.iconBuiltin;
          }
          
          // Handle hover icon with error checking
          if(it.iconBuiltinHover) {
            imgHoverSrc = it.iconBuiltinHover;
          }
          
          // Apply consistent fallback logic
          // ensure og.png fallback uses runtime URL when available
          const ogUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL('image/og.png') : 'image/og.png';
          if(!imgHoverSrc) imgHoverSrc = ogUrl;
          if(!imgNormalSrc) imgNormalSrc = imgHoverSrc || ogUrl;
          
          img.src = imgNormalSrc;
          
          // add hover swap on listing preview with error handling
          img.addEventListener('pointerenter', ()=>{ 
            try{ 
              img.src = imgHoverSrc || imgNormalSrc; 
            }catch(e){
              console.warn('Failed to swap to hover image:', e);
            } 
          });
          img.addEventListener('pointerleave', ()=>{ 
            try{ 
              img.src = imgNormalSrc; 
            }catch(e){
              console.warn('Failed to swap back to normal image:', e);
            } 
          });
          
          // Add error handler for image loading
          img.addEventListener('error', () => {
            console.warn('Failed to load preview image for item:', it.id);
            img.src = ogUrl;
          });
          
          const span = document.createElement('span'); 
          span.textContent = it.name || it.id;
          const scopeSpan = document.createElement('small'); 
          scopeSpan.style.color='#999'; 
          scopeSpan.style.marginLeft='8px';
          if (it.scope === 'host') scopeSpan.textContent = '(host:' + (it.scopeHost || '') + ')';

          // per-item auto-run checkbox
          const autoLabel = document.createElement('label'); autoLabel.style.marginLeft='8px'; autoLabel.style.color='#9e9e9e';
          const autoChk = document.createElement('input'); autoChk.type='checkbox'; autoChk.checked = !!it.autoRun;
          autoChk.style.marginLeft='8px';
          autoChk.onchange = async ()=>{
            try {
              const items2 = await getConfig();
              const idx = items2.findIndex(x=>x.id===it.id);
              if (idx>=0) { 
                items2[idx].autoRun = !!autoChk.checked; 
                await saveConfig(items2); 
                chrome.runtime.sendMessage({ type: 'broadcast', payload: { type: 'refresh-config' } }, ()=>{}); 
              }
            } catch(e){ 
              console.error('toggle autoRun failed', e); 
              showErrorFeedback('ไม่สามารถเปลี่ยนการตั้งค่า auto-run ได้', 'error');
            }
          };
          autoLabel.appendChild(autoChk);
          autoLabel.appendChild(document.createTextNode(' auto-run'));

          // run button with enhanced error handling
          const runBtn = document.createElement('button'); runBtn.textContent='ทดสอบ';
          runBtn.onclick = async ()=>{
            const loadingState = showLoadingState(runBtn, 'รัน...');
            
            try{
              if(it.scriptId){
                const blob = await getFile(it.scriptId);
                if (!blob) {
                  throw new Error('ไม่พบไฟล์สคริปต์');
                }
                
                const code = await blob.text();
                if (!code || code.trim().length === 0) {
                  throw new Error('สคริปต์ว่างเปล่า');
                }
                
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                  chrome.runtime.sendMessage({ type: 'exec-code', code }, (resp) => {
                    loadingState.restore();
                    if (chrome.runtime.lastError) {
                      console.warn('exec-code sendMessage failed', chrome.runtime.lastError);
                      showErrorFeedback('เรียกใช้งานสคริปต์ไม่สำเร็จ', 'error');
                    } else {
                      showErrorFeedback('รันสคริปต์สำเร็จ', 'success');
                    }
                  });
                } else {
                  const b = new Blob([code], { type:'text/javascript' });
                  const url = URL.createObjectURL(b);
                  const script = document.createElement('script');
                  script.src = url; script.async = false;
                  script.onload = ()=>{ 
                    URL.revokeObjectURL(url); 
                    script.remove(); 
                    loadingState.restore();
                    showErrorFeedback('รันสคริปต์สำเร็จ', 'success');
                  };
                  script.onerror = ()=> {
                    URL.revokeObjectURL(url); 
                    script.remove(); 
                    loadingState.restore();
                    showErrorFeedback('เกิดข้อผิดพลาดในการรันสคริปต์', 'error');
                  };
                  (document.head || document.documentElement).appendChild(script);
                }
              } else if(it.scriptBuiltin){
                // ensure scriptBuiltin is string
                const built = (typeof it.scriptBuiltin === 'string') ? it.scriptBuiltin : String(it.scriptBuiltin || '');
                const res = await fetch(built);
                
                if(!res.ok){
                  throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                
                const code = await res.text();
                if (!code || code.trim().length === 0) {
                  throw new Error('สคริปต์ builtin ว่างเปล่า');
                }
                
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                  chrome.runtime.sendMessage({ type: 'exec-code', code }, (resp) => {
                    loadingState.restore();
                    if (chrome.runtime.lastError) {
                      console.warn('exec-code sendMessage failed', chrome.runtime.lastError);
                      showErrorFeedback('เรียกใช้งานสคริปต์ไม่สำเร็จ', 'error');
                    } else {
                      showErrorFeedback('รันสคริปต์สำเร็จ', 'success');
                    }
                  });
                } else {
                  const b = new Blob([code], { type:'text/javascript' });
                  const url = URL.createObjectURL(b);
                  const script = document.createElement('script'); script.src = url; script.async = false;
                  script.onload = ()=>{ 
                    URL.revokeObjectURL(url); 
                    script.remove(); 
                    loadingState.restore();
                    showErrorFeedback('รันสคริปต์สำเร็จ', 'success');
                  };
                  script.onerror = ()=> {
                    URL.revokeObjectURL(url); 
                    script.remove(); 
                    loadingState.restore();
                    showErrorFeedback('เกิดข้อผิดพลาดในการรันสคริปต์', 'error');
                  };
                  (document.head || document.documentElement).appendChild(script);
                }
              } else {
                loadingState.restore();
                showErrorFeedback('ไม่มีสคริปต์สำหรับปุ่มนี้', 'warning');
              }
            }catch(e){ 
              loadingState.restore();
              console.error('Script execution failed:', e); 
              handleScriptExecutionError(e, 'Test run');
            }
          };

          // delete button with confirmation and error handling
          const delBtn = document.createElement('button'); delBtn.textContent='ลบ';
          delBtn.onclick = async ()=>{
            if(!confirm('ลบปุ่มนี้จริงหรือ?')) return;
            
            const loadingState = showLoadingState(delBtn, 'ลบ...');
            
            try {
              const items2 = (await getConfig()).filter(x=>x.id!==it.id);
              
              // Clean up associated files
              const cleanupPromises = [];
              if(it.iconId) cleanupPromises.push(deleteFile(it.iconId).catch(e => console.warn('Failed to delete icon:', e)));
              if(it.iconHoverId) cleanupPromises.push(deleteFile(it.iconHoverId).catch(e => console.warn('Failed to delete hover icon:', e)));
              if(it.scriptId) cleanupPromises.push(deleteFile(it.scriptId).catch(e => console.warn('Failed to delete script:', e)));
              
              await Promise.all(cleanupPromises);
              await saveConfig(items2);
              await refreshList();
              
              loadingState.restore();
              showErrorFeedback('ลบปุ่มสำเร็จ', 'success');
            } catch (deleteError) {
              loadingState.restore();
              console.error('Delete failed:', deleteError);
              showErrorFeedback(`ไม่สามารถลบปุ่มได้: ${deleteError.message}`, 'error');
            }
          };

          div.appendChild(img); div.appendChild(span); div.appendChild(scopeSpan); div.appendChild(autoLabel); div.appendChild(runBtn); div.appendChild(delBtn);
          itemsEl.appendChild(div);
        } catch (itemError) {
          console.error('Failed to render item:', it.id, itemError);
          // Continue with other items
        }
      }
    } catch(e){
      console.error('refreshList error', e);
      try{ 
        itemsEl.innerHTML = '<div style="color:red;padding:20px;text-align:center;">โหลด config ไม่สำเร็จ<br><small>ดู console สำหรับรายละเอียด</small></div>'; 
      }catch(_){}
      showErrorFeedback('ไม่สามารถโหลดรายการปุ่มได้', 'error');
    }
  }

  function uid(prefix='id'){ return prefix + '-' + Math.random().toString(36).slice(2,9); }

  addBtn.addEventListener('click', async ()=>{
    // Show loading state with spinner
    const loadingState = showLoadingState(addBtn, 'กำลังเพิ่ม...', { showSpinner: true });
    
    try {
      // Enhanced form validation
      const validation = validateFormInputs();
      
      // Show warnings first if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          showErrorFeedback(warning, 'warning');
        });
        // Small delay to let user see warnings
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Check for errors
      if (validation.errors.length > 0) {
        loadingState.restore();
        const errorMessage = validation.errors.length === 1 
          ? validation.errors[0] 
          : `พบข้อผิดพลาด ${validation.errors.length} รายการ:\n• ${validation.errors.join('\n• ')}`;
        showErrorFeedback(errorMessage, 'error', { persistent: true });
        return;
      }

      const name = nameEl.value.trim() || ('item-' + Date.now());
      const item = { id: uid('item'), name };
      
      // Update loading message
      loadingState.updateMessage('กำลังประมวลผลไฟล์...');
      
      // builtin paths (ensure strings)
      const scriptBuiltinPath = scriptBuiltinPathEl && scriptBuiltinPathEl.value && String(scriptBuiltinPathEl.value.trim());
      const iconBuiltinPath = iconSelectEl && iconSelectEl.value && String(iconSelectEl.value.trim());
      const iconHoverBuiltinPath = iconHoverSelectEl && iconHoverSelectEl.value && String(iconHoverSelectEl.value.trim());
      
      if(scriptBuiltinPath) item.scriptBuiltin = scriptBuiltinPath;
      if(iconBuiltinPath) item.iconBuiltin = iconBuiltinPath;
      if(iconHoverBuiltinPath) item.iconBuiltinHover = iconHoverBuiltinPath;
      
      // script handling with enhanced error checking
      try {
        if(scriptFileEl.files && scriptFileEl.files[0]){
          const f = scriptFileEl.files[0];
          
          // Validate script file
          if (!f.type.includes('javascript') && !f.name.endsWith('.js')) {
            throw new Error('ไฟล์สคริปต์ต้องเป็นไฟล์ .js เท่านั้น');
          }
          
          if (f.size > 10 * 1024 * 1024) { // 10MB limit for scripts
            throw new Error('ไฟล์สคริปต์ใหญ่เกินไป (สูงสุด 10MB)');
          }
          
          if (f.size === 0) {
            throw new Error('ไฟล์สคริปต์ว่างเปล่า');
          }
          
          loadingState.updateMessage('กำลังอ่านไฟล์สคริปต์...');
          
          // Read and validate script content
          const scriptContent = await f.text();
          if (!scriptContent || scriptContent.trim().length === 0) {
            throw new Error('ไฟล์สคริปต์ไม่มีเนื้อหา');
          }
          
          // Note: Syntax validation removed due to CSP restrictions
          // Scripts will be validated during execution instead
          
          const key = uid('script');
          await putFile(key, f);
          item.scriptId = key;
          
        } else if(scriptTextEl.value.trim()){
          const scriptText = scriptTextEl.value.trim();
          
          // Enhanced script validation
          if (scriptText.length < 10) {
            throw new Error('โค้ดสคริปต์สั้นเกินไป (ต้องมีอย่างน้อย 10 ตัวอักษร)');
          }
          
          if (scriptText.length > 1024 * 1024) { // 1MB limit for text
            throw new Error('โค้ดสคริปต์ยาวเกินไป (สูงสุด 1MB)');
          }
          
          // Check for potentially dangerous code patterns
          const dangerousPatterns = [
            { pattern: /document\.write\s*\(/i, message: 'document.write' },
            { pattern: /eval\s*\(/i, message: 'eval()' },
            { pattern: /innerHTML\s*=.*<script/i, message: 'script injection via innerHTML' },
            { pattern: /location\s*=\s*["']javascript:/i, message: 'javascript: URL' }
          ];
          
          const foundDangerous = dangerousPatterns.find(({ pattern }) => pattern.test(scriptText));
          if (foundDangerous) {
            const confirmed = confirm(`โค้ดนี้มี ${foundDangerous.message} ซึ่งอาจมีความเสี่ยงด้านความปลอดภัย\n\nคุณต้องการดำเนินการต่อหรือไม่?`);
            if (!confirmed) {
              loadingState.restore();
              showErrorFeedback('ยกเลิกการเพิ่มปุ่มเนื่องจากความเสี่ยงด้านความปลอดภัย', 'warning');
              return;
            }
          }
          
          // Note: Syntax validation removed due to CSP restrictions
          // Scripts will be validated during execution instead
          
          loadingState.updateMessage('กำลังบันทึกสคริปต์...');
          
          const blob = new Blob([scriptText], { type:'text/javascript' });
          const key = uid('script');
          await putFile(key, blob);
          item.scriptId = key;
        }
      } catch (scriptError) {
        loadingState.restore();
        handleScriptExecutionError(scriptError, 'Script processing');
        return;
      }
      
      // scope
      const scope = (scopeSelect && scopeSelect.value) ? scopeSelect.value : 'global';
      if (scope === 'host') item.scope = 'host'; else item.scope = 'global';
      if (scopeHostEl && scopeHostEl.value && scopeHostEl.value.trim()) item.scopeHost = scopeHostEl.value.trim();

      // save and broadcast
      loadingState.updateMessage('กำลังบันทึกการตั้งค่า...');
      
      const result = await addButton(item);
      
      if (!result.ok) {
        loadingState.restore();
        showErrorFeedback(`ไม่สามารถเพิ่มปุ่มได้: ${result.error || 'ข้อผิดพลาดไม่ทราบสาเหตุ'}`, 'error', { persistent: true });
        return;
      }

      // clear inputs
      nameEl.value=''; scriptTextEl.value=''; scriptFileEl.value='';
      if(iconSelectEl) iconSelectEl.value='';
      if(iconHoverSelectEl) iconHoverSelectEl.value='';
      if(scriptBuiltinPathEl) scriptBuiltinPathEl.value='';
      // reset preview images to default og
      try { if (iconPreview) iconPreview.src = defaultOg; } catch(_){}
      try { if (iconHoverPreview) iconHoverPreview.src = defaultOg; } catch(_){}
      
      loadingState.updateMessage('กำลังรีเฟรชรายการ...');
      await refreshList();
      
      loadingState.restore();
      showErrorFeedback('เพิ่มปุ่มสำเร็จ! 🎉', 'success');
      
    } catch (error) {
      loadingState.restore();
      console.error('Add button failed:', error);
      
      // Enhanced error analysis
      let errorMessage = 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'QuotaExceededError') {
        errorMessage = 'พื้นที่จัดเก็บข้อมูลเต็ม กรุณาลบปุ่มเก่าที่ไม่ใช้';
      } else if (error.name === 'NetworkError') {
        errorMessage = 'เกิดปัญหาเครือข่าย กรุณาตรวจสอบการเชื่อมต่อ';
      }
      
      showErrorFeedback(`เกิดข้อผิดพลาด: ${errorMessage}`, 'error', { persistent: true });
    }
  });

  // addButton: save item into config and broadcast refresh to all tabs via background
  async function addButton(item) {
    try {
      const items = await getConfig();
      if (!item.id) item.id = uid('item');
      const idx = items.findIndex(i => i.id === item.id);
      if (idx >= 0) items[idx] = item; else items.push(item);
      await saveConfig(items);
      // broadcast via background so all tabs receive refresh-config
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          // retry broadcast a few times in case service worker is not active yet
          const maxTries = 4;
          for (let t = 1; t <= maxTries; t++) {
            chrome.runtime.sendMessage({ type: 'broadcast', payload: { type: 'refresh-config' } }, (resp) => {
              if (chrome.runtime.lastError) {
                console.warn('broadcast attempt', t, 'failed', chrome.runtime.lastError);
              }
            });
            // small delay between tries
            await new Promise(r => setTimeout(r, 150 * t));
          }
        }
      } catch (e) { console.warn('broadcast exception', e); }
      return { ok: true };
    } catch (e) {
      console.error('addButton failed', e);
      return { ok: false, error: e && e.message };
    }
  }

  exportBtn.addEventListener('click', async ()=>{
    const items = await getConfig();
    const exportItems = [];
    for(const it of items){
      const out = Object.assign({}, it);
      // include scope info
      if (it.scope) out.scope = it.scope;
      if (it.scopeHost) out.scopeHost = it.scopeHost;
      // ensure builtin fields are strings in export
      if(out.scriptBuiltin && typeof out.scriptBuiltin !== 'string') out.scriptBuiltin = String(out.scriptBuiltin);
      if(out.iconBuiltin && typeof out.iconBuiltin !== 'string') out.iconBuiltin = String(out.iconBuiltin);
      if(it.iconId){
        const b = await getFile(it.iconId).catch(()=>null);
        if(b) {
          out.iconData = await blobToDataURL(b);
        }
      }
      if(it.iconHoverId){ const b = await getFile(it.iconHoverId).catch(()=>null); if(b) out.iconHoverData = await blobToDataURL(b); }
      if(it.scriptId){ const b = await getFile(it.scriptId).catch(()=>null); if(b) out.scriptData = await b.text(); }
      exportItems.push(out);
    }
    const json = JSON.stringify(exportItems, null, 2);
    const blob = new Blob([json], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bundle-export.json'; a.click(); URL.revokeObjectURL(url);
  });

  importBtn.addEventListener('click', ()=> importFile.click());
  importFile.addEventListener('change', async ()=>{
    const f = importFile.files[0]; if(!f) return;
    const text = await f.text();
    try{
      const list = JSON.parse(text);
      const items = await getConfig();
      for(const it of list){
  const newIt = { id: uid('item'), name: it.name || ('import-' + Date.now()) };
        // make sure builtin are strings
        if(it.scriptBuiltin) newIt.scriptBuiltin = String(it.scriptBuiltin);
        if(it.iconBuiltin) newIt.iconBuiltin = String(it.iconBuiltin);
        if(it.iconHoverBuiltin) newIt.iconBuiltinHover = String(it.iconHoverBuiltin);
  if(it.scriptData){ const key = uid('script'); await putFile(key, new Blob([it.scriptData], { type:'text/javascript' })); newIt.scriptId = key; }
  if(it.scope) newIt.scope = it.scope;
  if(it.scopeHost) newIt.scopeHost = it.scopeHost;
        if(it.iconData){ const key = uid('icon'); await putFile(key, dataURLtoBlob(it.iconData)); newIt.iconId = key; }
        if(it.iconHoverData){ const key = uid('icon'); await putFile(key, dataURLtoBlob(it.iconHoverData)); newIt.iconHoverId = key; }
        items.push(newIt);
      }
      await saveConfig(items);
      await refreshList();
      alert('นำเข้าเรียบร้อย');
    }catch(e){ console.error(e); alert('ไฟล์ไม่ถูกต้อง'); }
  });

  function blobToDataURL(blob){ return new Promise((res)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(blob); }); }
  function dataURLtoBlob(dataurl){ const parts = dataurl.split(','); const m = parts[0].match(/:(.*?);/); const mime = m?m[1]:'application/octet-stream'; const bstr = atob(parts[1]); let n=bstr.length; const u8=new Uint8Array(n); while(n--) u8[n]=bstr.charCodeAt(n); return new Blob([u8],{type:mime}); }

  // initial
  (async ()=>{ 
    await refreshList(); 
    renderScriptDistribution();
    setupIconSelectors(); // Initialize icon selectors
  })();

})();
