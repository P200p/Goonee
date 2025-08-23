// Matrix background animation
        const canvas = document.getElementById('matrixCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
        const matrixArray = matrix.split("");

        const fontSize = 10;
        const columns = canvas.width / fontSize;

        const drops = [];
        for(let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00ff41';
            ctx.font = fontSize + 'px monospace';

            for(let i = 0; i < drops.length; i++) {
                const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        setInterval(drawMatrix, 35);

        // Console panel functionality
        let isDragging = false;
        let isResizing = false;
        let dragOffset = { x: 0, y: 0 };
        let startSize = { width: 0, height: 0 };
        let startPos = { x: 0, y: 0 };

        const panel = document.getElementById('consolePanel');
        const header = document.getElementById('consoleHeader');
        const resizeHandle = document.getElementById('resizeHandle');

        // Apply mobile-friendly default size on initial load
        (function applyInitialResponsiveSize(){
            try{
                const hasInlineSize = panel && (panel.style && (panel.style.width || panel.style.height));
                const ua = (navigator && navigator.userAgent) ? navigator.userAgent : '';
                const isTouch = (navigator && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)) || ('ontouchstart' in window);
                const isMobile = window.innerWidth <= 900 || isTouch || /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
                if (panel && !hasInlineSize && isMobile){
                    panel.style.width = '96vw';
                    panel.style.height = '72vh';
                    panel.style.left = '2vw';
                    panel.style.top = '2vh';
                }
            }catch(_){ /* ignore */ }
        })();

        // Dragging functionality
        header.addEventListener('mousedown', startDrag);
        header.addEventListener('touchstart', startDrag);

        function startDrag(e) {
            isDragging = true;
            const rect = panel.getBoundingClientRect();
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            
            dragOffset.x = clientX - rect.left;
            dragOffset.y = clientY - rect.top;
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);
        }

        function drag(e) {
            if (!isDragging) return;
            
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            
            const newX = clientX - dragOffset.x;
            const newY = clientY - dragOffset.y;
            
            panel.style.left = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, newX)) + 'px';
            panel.style.top = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, newY)) + 'px';
        }

        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        }

        // Resizing functionality
        resizeHandle.addEventListener('mousedown', startResize);
        resizeHandle.addEventListener('touchstart', startResize);

        function startResize(e) {
            isResizing = true;
            const rect = panel.getBoundingClientRect();
            startSize.width = rect.width;
            startSize.height = rect.height;
            startPos.x = e.clientX || e.touches[0].clientX;
            startPos.y = e.clientY || e.touches[0].clientY;
            
            document.addEventListener('mousemove', resize);
            document.addEventListener('touchmove', resize);
            document.addEventListener('mouseup', stopResize);
            document.addEventListener('touchend', stopResize);
        }

        function resize(e) {
            if (!isResizing) return;
            
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            
            const newWidth = Math.max(300, startSize.width + (clientX - startPos.x));
            const newHeight = Math.max(200, startSize.height + (clientY - startPos.y));
            
            panel.style.width = newWidth + 'px';
            panel.style.height = newHeight + 'px';
        }

        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('touchmove', resize);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchend', stopResize);
        }

        // Shark Tools Configuration (local directory)
        const SHARK_BASE = (window.__HC_BASE_URL || '') + 'sharktool/';
        const sharkTools = {
            burpshark: {
                url: SHARK_BASE + 'burpshark.js',
                name: 'BurpShark',
                description: 'Advanced web security testing tool'
            },
            sharkscan: {
                url: SHARK_BASE + 'sharkscan.js',
                name: 'SharkScan',
                description: 'Vulnerability scanner'
            },
            snipers: {
                url: SHARK_BASE + 'snipers.js',
                name: 'Snipers',
                description: 'Precision targeting tool'
            },
            theme: {
                url: SHARK_BASE + 'theme.js',
                name: 'Theme Manager',
                description: 'UI theme customization'
            },
            monitor: {
                url: SHARK_BASE + 'monitor.js',
                name: 'Monitor',
                description: 'System monitoring tool'
            },
            postshark: {
                url: SHARK_BASE + 'postshark.js',
                name: 'PostShark',
                description: 'HTTP request manipulation'
            }
        };

        // Bookmarklet functionality
        let savedBookmarklets = JSON.parse(localStorage.getItem('hackerConsoleBookmarklets') || '{}');

        function runBookmarklet() {
            const code = document.getElementById('codeInput').value.trim();
            if (!code) {
                updateStatus('❌ No code to execute');
                return;
            }
            
            try {
                // Remove javascript: prefix if present
                const cleanCode = code.replace(/^javascript:/, '');
                eval(cleanCode);
                updateStatus('✅ Bookmarklet executed successfully');
            } catch (error) {
                updateStatus('❌ Error: ' + error.message);
                console.error('Bookmarklet error:', error);
            }
        }

        function saveBookmarklet() {
            const code = document.getElementById('codeInput').value.trim();
            if (!code) {
                updateStatus('❌ No code to save');
                return;
            }
            
            const name = prompt('Enter a name for this bookmarklet:');
            if (!name) return;
            
            savedBookmarklets[name] = code;
            localStorage.setItem('hackerConsoleBookmarklets', JSON.stringify(savedBookmarklets));
            updateSavedList();
            updateStatus('💾 Bookmarklet saved as: ' + name);
        }

        function loadBookmarklet(name) {
            if (savedBookmarklets[name]) {
                document.getElementById('codeInput').value = savedBookmarklets[name];
                updateStatus('📋 Loaded: ' + name);
            }
        }

        function deleteBookmarklet(name) {
            if (confirm('Delete bookmarklet "' + name + '"?')) {
                delete savedBookmarklets[name];
                localStorage.setItem('hackerConsoleBookmarklets', JSON.stringify(savedBookmarklets));
                updateSavedList();
                updateStatus('🗑️ Deleted: ' + name);
            }
        }

        function clearCode() {
            document.getElementById('codeInput').value = '';
            updateStatus('🗑️ Code cleared');
        }

        function exportBookmarklets() {
            const data = JSON.stringify(savedBookmarklets, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'hacker-console-bookmarklets.json';
            a.click();
            URL.revokeObjectURL(url);
            updateStatus('📤 Bookmarklets exported');
        }

        function updateSavedList() {
            const list = document.getElementById('savedList');
            list.innerHTML = '';
            
            for (const [name, code] of Object.entries(savedBookmarklets)) {
                const item = document.createElement('div');
                item.className = 'saved-item';
                item.innerHTML = `
                    <span class="item-name" onclick="loadBookmarklet('${name}')">${name}</span>
                    <button class="delete-btn" onclick="deleteBookmarklet('${name}')">×</button>
                `;
                list.appendChild(item);
            }
        }

        function runQuickScript(type) {
            const scripts = {
                alert: "javascript:(function(){alert('Quick test from Hacker Console!');})()",
                console: "javascript:(function(){console.log('Hacker Console Log:', new Date());})()",
                scroll: "javascript:(function(){window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});})()",
                highlight: "javascript:(function(){document.querySelectorAll('a').forEach(a=>a.style.background='yellow');})()",
                dark: "javascript:(function(){document.body.style.filter=document.body.style.filter?'':'invert(1) hue-rotate(180deg)';})()"
            };
            
            if (scripts[type]) {
                document.getElementById('codeInput').value = scripts[type];
                runBookmarklet();
            }
        }

        // Shark Tools Loader Function
        function loadSharkTool(toolName) {
            const tool = sharkTools[toolName];
            if (!tool) {
                updateStatus('❌ Tool not found: ' + toolName);
                return;
            }

            updateStatus('🔄 Loading ' + tool.name + '...');
            
            try {
                // Check if script is already loaded
                const existingScript = document.querySelector(`script[data-shark-tool="${toolName}"]`);
                if (existingScript) {
                    updateStatus('⚠️ ' + tool.name + ' already loaded');
                    // Try to execute if it has an init function
                    if (window[toolName] && typeof window[toolName].init === 'function') {
                        window[toolName].init();
                    }
                    return;
                }

                // Create and load script
                const script = document.createElement('script');
                script.src = tool.url + '?t=' + Date.now(); // Add timestamp to prevent caching
                script.setAttribute('data-shark-tool', toolName);
                
                script.onload = function() {
                    updateStatus('✅ ' + tool.name + ' loaded successfully');
                    
                    // Special handling for theme.js - also load CSS
                    if (toolName === 'theme') {
                        loadThemeCSS();
                    }
                    
                    // Try to auto-execute the tool
                    setTimeout(() => {
                        try {
                            if (window[toolName]) {
                                if (typeof window[toolName] === 'function') {
                                    window[toolName]();
                                } else if (typeof window[toolName].init === 'function') {
                                    window[toolName].init();
                                }
                            }
                        } catch (e) {
                            console.log('Tool loaded but no auto-init available');
                        }
                    }, 100);
                };
                
                script.onerror = function() {
                    updateStatus('❌ Failed to load ' + tool.name);
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                };
                
                document.head.appendChild(script);
                
            } catch (error) {
                updateStatus('❌ Error loading ' + tool.name + ': ' + error.message);
            }
            return;
        }

        

        function updateStatus(message) {
            document.getElementById('statusText').textContent = message;
            setTimeout(() => {
                document.getElementById('statusText').textContent = 'Ready • Drag to move • Resize from corner';
            }, 3000);
        }

        // Window controls
        let isMinimized = false;
        let originalHeight = '400px';
        
        function minimizeConsole() {
            if (!isMinimized) {
                originalHeight = panel.style.height || '400px';
                panel.style.height = '40px';
                document.querySelector('.console-body').style.display = 'none';
                isMinimized = true;
                updateStatus('Console minimized');
            } else {
                panel.style.height = originalHeight;
                document.querySelector('.console-body').style.display = 'flex';
                isMinimized = false;
                updateStatus('Console restored');
            }
        }

        function maximizeConsole() {
            panel.style.width = '80vw';
            panel.style.height = '80vh';
            panel.style.left = '10vw';
            panel.style.top = '10vh';
            updateStatus('Console maximized');
        }

        function closeConsole() {
            if (confirm('Close Hacker Console?')) {
                panel.style.display = 'none';
            }
        }

        // Initialize
        updateSavedList();
        
        // Add sample bookmarklet
        if (!savedBookmarklets['sample']) {
            savedBookmarklets['sample'] = "javascript:(function(){alert('Hello from Hacker Console!');})()";
            localStorage.setItem('hackerConsoleBookmarklets', JSON.stringify(savedBookmarklets));
            updateSavedList();
        }

        // Prevent context menu on panel
        panel.addEventListener('contextmenu', e => e.preventDefault());
        
        // Handle window resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        // ==========================
        // POST Interceptor (fetch)
        // ==========================
        (function(){
            const METHODS = new Set(['POST','PUT','PATCH']);
            const state = window.__HC_PI__ = window.__HC_PI__ || {
                enabled: false,
                items: [],
                seq: 1,
                selectedId: null,
                origFetch: window.fetch,
                wrapped: false
            };

            function byId(id){ return document.getElementById(id); }
            function getUI(){
                return {
                    toggleBtn: byId('piToggle'),
                    list: byId('postList'),
                    editor: byId('postEditor'),
                    url: byId('piUrl'),
                    method: byId('piMethod'),
                    headers: byId('piHeaders'),
                    body: byId('piBody'),
                };
            }

            function ensureWrap(){
                if (state.wrapped) return;
                state.wrapped = true;
                window.fetch = function(input, init){
                    try{
                        const req = new Request(input, init);
                        const method = (req.method || 'GET').toUpperCase();
                        if (!state.enabled || !METHODS.has(method)){
                            return state.origFetch(input, init);
                        }
                        // Extract data for UI
                        const url = req.url;
                        const headersObj = {};
                        req.headers && req.headers.forEach((v,k)=>{ headersObj[k] = v; });
                        // Clone body: read as text
                        return new Promise(async (resolve)=>{
                            let bodyText = '';
                            try{ bodyText = await req.clone().text(); }catch(_){ bodyText = ''; }
                            const id = state.seq++;
                            const item = {
                                id, method, url,
                                headers: headersObj,
                                bodyText,
                                createdAt: Date.now(),
                                resolve
                            };
                            state.items.unshift(item);
                            renderList();
                            showEditorFromItem(item);
                        });
                    }catch(e){
                        return state.origFetch(input, init);
                    }
                };
            }

            function renderList(){
                const ui = getUI(); if (!ui.list) return;
                ui.list.innerHTML = '';
                for (const it of state.items){
                    const div = document.createElement('div');
                    div.className = 'saved-item';
                    const title = `${new Date(it.createdAt).toLocaleTimeString()} ${it.method} ${it.url}`;
                    div.innerHTML = `
                        <span class="item-name" title="${title}">${truncate(title, 80)}</span>
                        <div style="display:flex; gap:4px;">
                          <button class="delete-btn" title="Edit" onclick="piEdit(${it.id})">✎</button>
                          <button class="delete-btn" title="Send original" onclick="piSendOriginal(${it.id})">⏎</button>
                          <button class="delete-btn" title="Drop" onclick="piDrop(${it.id})">×</button>
                        </div>
                    `;
                    ui.list.appendChild(div);
                }
            }

            function truncate(s, n){ return s.length>n ? s.slice(0,n-1)+'…' : s; }

            function showEditorFromItem(it){
                const ui = getUI(); if (!ui.editor) return;
                state.selectedId = it.id;
                ui.editor.style.display = 'block';
                ui.url.value = it.url;
                ui.method.value = it.method;
                try{ ui.headers.value = JSON.stringify(it.headers, null, 2); }catch(_){ ui.headers.value = '{}'; }
                ui.body.value = it.bodyText || '';
            }

            // Public API
            window.togglePostIntercept = function(){
                const ui = getUI();
                state.enabled = !state.enabled;
                if (ui.toggleBtn){ ui.toggleBtn.textContent = 'Intercept: ' + (state.enabled ? 'On' : 'Off'); }
                ensureWrap();
                updateStatus('POST Intercept ' + (state.enabled ? 'enabled' : 'disabled'));
            };

            window.piEdit = function(id){
                const it = state.items.find(x=>x.id===id); if (!it) return;
                showEditorFromItem(it);
            };

            window.piSendOriginal = function(id){
                const idx = state.items.findIndex(x=>x.id===id); if (idx<0) return;
                const it = state.items[idx];
                // Send original
                const opt = { method: it.method, headers: it.headers };
                if (it.bodyText) opt.body = it.bodyText;
                state.origFetch(it.url, opt).then(res=>{ it.resolve(res); }).catch(err=>{
                    it.resolve(new Response(String(err), {status:520,statusText:'Send Original Failed'}));
                });
                state.items.splice(idx,1);
                renderList();
            };

            window.piSendModified = function(){
                const ui = getUI();
                const id = state.selectedId; if (!id) return;
                const idx = state.items.findIndex(x=>x.id===id); if (idx<0) return;
                const it = state.items[idx];
                let headers = {}; try{ headers = JSON.parse(ui.headers.value||'{}'); }catch(_){ headers = {}; }
                const opt = { method: ui.method.value || it.method, headers, body: ui.body.value || '' };
                state.origFetch(ui.url.value || it.url, opt).then(res=>{ it.resolve(res); }).catch(err=>{
                    it.resolve(new Response(String(err), {status:520,statusText:'Send Modified Failed'}));
                });
                state.items.splice(idx,1);
                renderList();
                ui.editor.style.display = 'none';
                state.selectedId = null;
            };

            window.piCancelPending = function(){
                const ui = getUI();
                const id = state.selectedId; if (!id) return;
                const idx = state.items.findIndex(x=>x.id===id); if (idx<0) return;
                const it = state.items[idx];
                it.resolve(new Response('', {status:499, statusText:'Client Closed Request'}));
                state.items.splice(idx,1);
                renderList();
                ui.editor.style.display = 'none';
                state.selectedId = null;
            };

            window.piDrop = function(id){
                const idx = state.items.findIndex(x=>x.id===id); if (idx<0) return;
                const it = state.items[idx];
                it.resolve(new Response('', {status:499, statusText:'Dropped'}));
                state.items.splice(idx,1);
                renderList();
            };

            window.piCopyCurl = function(){
                const ui = getUI();
                const id = state.selectedId; if (!id) return;
                const idx = state.items.findIndex(x=>x.id===id); if (idx<0) return;
                const it = state.items[idx];
                let headers = {}; try{ headers = JSON.parse(ui.headers.value||'{}'); }catch(_){ headers = {}; }
                const parts = [ 'curl', '-X', (ui.method.value||it.method) ];
                Object.entries(headers).forEach(([k,v])=>{ parts.push('-H', quote(`${k}: ${v}`)); });
                if ((ui.body.value||'').length){ parts.push('--data-raw', quote(ui.body.value)); }
                parts.push(quote(ui.url.value||it.url));
                const cmd = parts.map(shQuote).join(' ');
                try{ navigator.clipboard.writeText(cmd); updateStatus('📋 Copied cURL'); }catch(_){ /* ignore */ }
            };

            function quote(s){ return s.replace(/"/g,'\\"'); }
            function shQuote(s){
                // wrap with double quotes; escape existing quotes
                if (/\s/.test(s) || s.includes('"')) return '"'+quote(s)+'"';
                return s;
            }

            // Initialize button text on load
            (function initUI(){ const ui=getUI(); if (ui && ui.toggleBtn) ui.toggleBtn.textContent = 'Intercept: ' + (state.enabled ? 'On' : 'Off'); })();
        })();

// ==========================
// Decoy Secret (locked panel)
// ==========================
(function(){
    const g = window.__HC_DECOY__ = window.__HC_DECOY__ || {
        tries: 0,
        tmr: null,
        salt: Math.random().toString(36).slice(2),
        openAt: 0
    };
    function byId(id){ return document.getElementById(id); }
    function rot(s,n){ return s.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^((n+i)%7))).join(''); }
    async function fakeHash(s){
        // lightweight fake hash: rotate+base64 (intentionally misleading)
        const x = rot(s, s.length % 13);
        return 'sha256:' + btoa(unescape(encodeURIComponent(x))).slice(0,24) + '…';
    }
    function startTicker(){
        const hashEl = byId('decoyHash');
        const hint = byId('decoyHint');
        if (g.tmr) clearInterval(g.tmr);
        g.tmr = setInterval(async ()=>{
            const t = Date.now();
            const fake = await fakeHash(g.salt + ':' + (Math.floor(t/1307)));
            if (hashEl) hashEl.textContent = fake;
            if (hint) hint.textContent = 'hint: salt rotating ' + new Array(1+(t%3)).fill('•').join('');
        }, 900);
    }
    function stopTicker(){ if (g.tmr){ clearInterval(g.tmr); g.tmr=null; } }

    window.openSecret = function(){
        const p = byId('decoyPanel'); if (!p) return;
        const st = byId('decoyStatus'); if (st) st.textContent = 'locked';
        const key = byId('decoyKey'); if (key) key.value = '';
        p.style.display = 'block';
        g.openAt = Date.now();
        startTicker();
        updateStatus('Dev panel opened');
    };

    window.decoyUnlock = async function(){
        const st = byId('decoyStatus');
        const key = byId('decoyKey');
        const entered = (key && key.value) ? key.value : '';
        // Special easter egg/backdoor phrase: reveal Stage 2 directly
        if (entered && entered.toLowerCase().includes('or 1=1')){
            const nxt = byId('decoyNext');
            const hint = byId('decoyHint');
            if (nxt) nxt.style.display = 'block';
            if (hint) hint.textContent = 'bypass accepted →';
            if (st) st.textContent = 'bypassed';
            return;
        }
        g.tries++;
        // Deliberately impossible check: depends on openAt jitter and salt drift
        const gate = (g.openAt % 997) ^ (g.salt.length * 31 + g.tries);
        const pass = entered && (entered.length % 17 === 0) && ((gate & 3) === 2) && entered.includes(g.salt.slice(0,2));
        if (pass){
            // Move the goalpost subtly
            g.salt = Math.random().toString(36).slice(2);
            if (st) st.textContent = 'verifying…';
            setTimeout(()=>{ if (st) st.textContent = 'locked'; }, 500 + (gate%400));
        }else{
            if (st) st.textContent = ['locked','invalid','mismatch','salt?'][g.tries % 4];
            // After several attempts, subtly reveal a next step link
            if (g.tries >= 5){
                const nxt = byId('decoyNext');
                const hint = byId('decoyHint');
                if (nxt) nxt.style.display = 'block';
                if (hint) hint.textContent = 'ok you win →';
            }
        }
    };

    window.closeDecoy = function(){
        const p = byId('decoyPanel'); if (!p) return;
        p.style.display = 'none';
        stopTicker();
    };
})();