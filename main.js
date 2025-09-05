// Matrix background animation
        // Utility: status notifier used across features
        function updateStatus(message){
            try{
                const n = /** @type {HTMLElement|null} */ (document.getElementById('notification'));
                if (n){
                    n.textContent = String(message);
                    n.classList.add('show');
                    setTimeout(()=>{ try{ n.classList.remove('show'); }catch(_){ /* ignore */ } }, 3000);
                }
                // Always log to console as a fallback
                // eslint-disable-next-line no-console
                console.log(message);
            }catch(_){ /* ignore */ }
        }

        // Typed canvas acquisition with guards
        const canvas = /** @type {HTMLCanvasElement|null} */ (document.getElementById('matrixCanvas'));
        /** @type {CanvasRenderingContext2D|null} */
        const ctx = (canvas && canvas.getContext) ? canvas.getContext('2d') : null;

        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
        const matrixArray = matrix.split("");

        const fontSize = 10;
        const columns = ((canvas && canvas.width) ? canvas.width : window.innerWidth) / fontSize;

        const drops = [];
        for(let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        function drawMatrix() {
            if (!canvas || !ctx) return;
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
                const isTouch = (navigator && 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
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
        if (header) {
            header.addEventListener('mousedown', startDrag);
            header.addEventListener('touchstart', startDrag);
        }

        function startDrag(e) {
            if (!panel) return;
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
            if (!panel) return;
            
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
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', startResize);
            resizeHandle.addEventListener('touchstart', startResize);
        }

        function startResize(e) {
            if (!panel) return;
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
            if (!panel) return;
            
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
        const wAny = /** @type {any} */ (window);
        const SHARK_BASE = ((wAny && wAny['__HC_BASE_URL']) || '') + 'sharktool/';
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
            const codeEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('codeInput'));
            const code = codeEl ? codeEl.value.trim() : '';
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
            const codeEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('codeInput'));
            const code = codeEl ? codeEl.value.trim() : '';
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
                const codeEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('codeInput'));
                if (codeEl) codeEl.value = savedBookmarklets[name];
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
            const codeEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('codeInput'));
            if (codeEl) codeEl.value = '';
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
            const list = /** @type {HTMLElement|null} */ (document.getElementById('savedList'));
            if (!list) return;
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
                const codeEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('codeInput'));
                if (codeEl) codeEl.value = scripts[type];
                runBookmarklet();
            }
        }

        // Shark Tools Loader Function (clean implementation)
        function loadSharkTool(toolName) {
            const tool = sharkTools[toolName];
            if (!tool) {
                updateStatus('❌ Tool not found: ' + toolName);
                return;
            }

            updateStatus('🔄 Loading ' + tool.name + '...');

            // Check if script is already loaded
            const existingScript = document.querySelector(`script[data-shark-tool="${toolName}"]`);
            if (existingScript) {
                updateStatus('⚠️ ' + tool.name + ' already loaded');
                try {
                    const mod = wAny[toolName];
                    if (mod && typeof mod.init === 'function') { mod.init(); }
                } catch(_) {}
                return;
            }

            // Create and load script
            const script = document.createElement('script');
            script.src = tool.url + '?t=' + Date.now();
            script.setAttribute('data-shark-tool', toolName);
            script.onload = function () {
                updateStatus('✅ ' + tool.name + ' loaded successfully');
                if (toolName === 'theme') {
                    try {
                        if (typeof wAny['loadThemeCSS'] === 'function') { wAny['loadThemeCSS'](); }
                    } catch(_) {}
                }
                try {
                    const mod = wAny[toolName];
                    if (mod) {
                        if (typeof mod === 'function') {
                            mod();
                        } else if (typeof mod.init === 'function') {
                            mod.init();
                        }
                    }
                } catch (_) { /* ignore */ }
            };
            script.onerror = function () {
                updateStatus('❌ Failed to load ' + tool.name);
            };
            document.body.appendChild(script);
        }

// ==========================
// Decoy Secret (locked panel)
// ==========================
(function(){
    const g = (wAny.__HC_DECOY__ = wAny.__HC_DECOY__ || {
        tries: 0,
        tmr: null,
        salt: Math.random().toString(36).slice(2),
        openAt: 0
    });
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

    wAny.openSecret = function(){
        const p = byId('decoyPanel'); if (!p) return;
        const st = byId('decoyStatus'); if (st) st.textContent = 'locked';
        const key = /** @type {HTMLInputElement|null} */(byId('decoyKey')); if (key) key.value = '';
        p.style.display = 'block';
        g.openAt = Date.now();
        startTicker();
        updateStatus('Dev panel opened');
    };

    wAny.decoyUnlock = async function(){
        const st = byId('decoyStatus');
        const key = /** @type {HTMLInputElement|null} */(byId('decoyKey'));
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
                if (hint) hint.textContent = 'try stage 2 →';
            }
        }
    };

    wAny.closeDecoy = function(){
        const p = byId('decoyPanel'); if (!p) return;
        p.style.display = 'none';
        stopTicker();
    };
})();