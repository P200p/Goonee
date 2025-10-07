/**
 * Goonee Door System
 * ระบบประตูเปิด/ปิดสำหรับ iframe
 */

class GooneDoorSystem {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'iframe-container',
            iframeUrl: options.iframeUrl || 'https://goorum.netlify.app/',
            // รองรับ SVG 2 ไฟล์แยกกัน
            doorClosedSvg: options.doorClosedSvg || options.svgPath || 'door_off.svg',
            doorOpenSvg: options.doorOpenSvg || 'door_on.svg',
            // รองรับ CDN
            useCDN: options.useCDN || false,
            cdnBase: options.cdnBase || 'https://cdn.jsdelivr.net/gh/yourusername/yourrepo@main/',
            autoClose: options.autoClose || false,
            autoCloseDelay: options.autoCloseDelay || 30000,
            animationDuration: options.animationDuration || 2000,
            enableKeyboard: options.enableKeyboard !== false,
            onOpen: options.onOpen || null,
            onClose: options.onClose || null,
            onAnimationStart: options.onAnimationStart || null,
            onAnimationEnd: options.onAnimationEnd || null
        };

        this.isDoorOpen = false;
        this.isAnimating = false;
        this.autoCloseTimer = null;

        this.init();
    }

    init() {
        this.createHTML();
        this.bindEvents();
        this.updateUI();
        
        console.log('🚪 Goonee Door System initialized');
        if (this.options.enableKeyboard) {
            console.log('Keyboard shortcuts: O=Open, C=Close, Space=Toggle');
        }
    }

    createHTML() {
        const container = document.getElementById(this.options.containerId);
        if (!container) {
            console.error(`Container with ID "${this.options.containerId}" not found`);
            return;
        }

        container.innerHTML = `
            <div class="iframe-door-container">
                <div class="door-loading" id="doorLoading">
                    <div class="door-spinner"></div>
                    <div class="door-loading-text">กำลังโหลด...</div>
                </div>
                
                <iframe 
                    class="iframe-door-content" 
                    id="doorIframe"
                    src="${this.options.iframeUrl}"
                    title="Door Content"
                    loading="lazy">
                </iframe>
                
                <div class="door-overlay closed" id="doorOverlay">
                    <object class="door-svg" id="doorSvgObject" data="${this.getSvgPath('closed')}" type="image/svg+xml">
                        ${this.getFallbackSVG()}
                    </object>
                </div>
            </div>
            
            <div class="door-controls">
                <button class="door-button open" id="doorOpenBtn">
                    🔓 เปิดประตู
                </button>
                <button class="door-button close" id="doorCloseBtn">
                    🔒 ปิดประตู
                </button>
            </div>
            
            <div style="text-align: center;">
                <div class="door-status" id="doorStatus">🔒 สถานะ: ปิด</div>
            </div>
        `;

        // Get elements
        this.elements = {
            overlay: document.getElementById('doorOverlay'),
            svgObject: document.getElementById('doorSvgObject'),
            status: document.getElementById('doorStatus'),
            openBtn: document.getElementById('doorOpenBtn'),
            closeBtn: document.getElementById('doorCloseBtn'),
            loading: document.getElementById('doorLoading'),
            iframe: document.getElementById('doorIframe')
        };
    }

    getFallbackSVG() {
        return `
            <svg class="door-svg" viewBox="0 0 1080 2047" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#2c3e50;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#34495e;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#2c3e50;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#f39c12;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#e67e22;stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                <rect width="100%" height="100%" fill="url(#doorGradient)"/>
                <rect x="50" y="50" width="980" height="1947" 
                      fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3" rx="10"/>
                <rect x="100" y="100" width="880" height="900" 
                      fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" rx="5"/>
                <rect x="100" y="1047" width="880" height="900" 
                      fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" rx="5"/>
                <circle cx="850" cy="1000" r="25" fill="url(#handleGradient)" 
                        stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
                <circle cx="850" cy="1000" r="15" fill="rgba(255,255,255,0.2)"/>
                <text x="540" y="1000" text-anchor="middle" 
                      fill="rgba(255,255,255,0.3)" font-size="60" font-family="Arial">🚪</text>
                <text x="540" y="1100" text-anchor="middle" 
                      fill="rgba(255,255,255,0.5)" font-size="40" font-family="Arial">🔒</text>
            </svg>
        `;
    }

    getSvgPath(state) {
        const svgFile = state === 'closed' ? this.options.doorClosedSvg : this.options.doorOpenSvg;
        
        if (this.options.useCDN) {
            return this.options.cdnBase + svgFile;
        }
        
        return svgFile;
    }

    changeDoorSvg(state) {
        if (this.elements.svgObject) {
            const newPath = this.getSvgPath(state);
            this.elements.svgObject.data = newPath;
        }
    }

    bindEvents() {
        // Button events
        this.elements.openBtn.addEventListener('click', () => this.openDoor());
        this.elements.closeBtn.addEventListener('click', () => this.closeDoor());

        // Iframe events
        this.elements.iframe.addEventListener('load', () => {
            this.elements.loading.style.display = 'none';
        });

        this.elements.iframe.addEventListener('error', () => {
            this.elements.loading.innerHTML = '<div style="color: #ff6b6b;">❌ ไม่สามารถโหลดเนื้อหาได้</div>';
        });

        // Keyboard events
        if (this.options.enableKeyboard) {
            document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        }

        // Button visual feedback
        document.querySelectorAll('.door-button').forEach(button => {
            button.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }

    handleKeyboard(e) {
        // Prevent shortcuts when typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key.toLowerCase()) {
            case 'o':
                e.preventDefault();
                this.openDoor();
                break;
            case 'c':
                e.preventDefault();
                this.closeDoor();
                break;
            case ' ':
                e.preventDefault();
                this.toggleDoor();
                break;
        }
    }

    updateUI() {
        this.elements.openBtn.disabled = this.isAnimating || this.isDoorOpen;
        this.elements.closeBtn.disabled = this.isAnimating || !this.isDoorOpen;
    }

    openDoor() {
        if (this.isAnimating || this.isDoorOpen) return;
        
        this.isAnimating = true;
        this.isDoorOpen = true;
        this.updateUI();

        // Clear any existing auto-close timer
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }

        // Callback
        if (this.options.onAnimationStart) {
            this.options.onAnimationStart('open');
        }
        
        this.elements.status.innerHTML = '🔄 สถานะ: กำลังเปิด...';
        
        // เปลี่ยน SVG เป็นแบบเปิด (SVG จะเล่นอนิเมชั่นเอง)
        this.changeDoorSvg('open');
        
        // รอให้ SVG เล่นอนิเมชั่นเสร็จ แล้วซ่อน overlay (เฟรมสุดท้ายโปร่งแสง)
        setTimeout(() => {
            this.elements.overlay.classList.remove('closed', 'closing', 'opening');
            this.elements.overlay.classList.add('opened'); // opacity: 0
            this.elements.status.innerHTML = '🔓 สถานะ: เปิด';
            this.isAnimating = false;
            this.updateUI();

            // Callbacks
            if (this.options.onAnimationEnd) {
                this.options.onAnimationEnd('open');
            }
            if (this.options.onOpen) {
                this.options.onOpen();
            }
            
            // Auto-close timer
            if (this.options.autoClose) {
                this.autoCloseTimer = setTimeout(() => {
                    if (this.isDoorOpen && !this.isAnimating) {
                        this.closeDoor();
                    }
                }, this.options.autoCloseDelay);
            }
        }, this.options.animationDuration);
    }

    closeDoor() {
        if (this.isAnimating || !this.isDoorOpen) return;
        
        this.isAnimating = true;
        this.isDoorOpen = false;
        this.updateUI();

        // Clear auto-close timer
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }

        // Callback
        if (this.options.onAnimationStart) {
            this.options.onAnimationStart('close');
        }
        
        this.elements.status.innerHTML = '🔄 สถานะ: กำลังปิด...';
        
        // แสดง overlay กลับมา
        this.elements.overlay.classList.remove('opened', 'opening');
        this.elements.overlay.classList.add('closing');
        
        // เปลี่ยน SVG กลับเป็นแบบปิด (SVG จะเล่นอนิเมชั่นย้อนกลับ)
        this.changeDoorSvg('closed');
        
        // รอให้ SVG เล่นอนิเมชั่นเสร็จ
        setTimeout(() => {
            this.elements.overlay.classList.remove('closing');
            this.elements.overlay.classList.add('closed'); // opacity: 1
            this.elements.status.innerHTML = '🔒 สถานะ: ปิด';
            this.isAnimating = false;
            this.updateUI();

            // Callbacks
            if (this.options.onAnimationEnd) {
                this.options.onAnimationEnd('close');
            }
            if (this.options.onClose) {
                this.options.onClose();
            }
        }, this.options.animationDuration);
    }

    toggleDoor() {
        if (this.isDoorOpen) {
            this.closeDoor();
        } else {
            this.openDoor();
        }
    }

    // Public methods
    isOpen() {
        return this.isDoorOpen;
    }

    isClosed() {
        return !this.isDoorOpen;
    }

    isAnimationRunning() {
        return this.isAnimating;
    }

    changeIframeUrl(url) {
        this.elements.iframe.src = url;
        this.elements.loading.style.display = 'flex';
    }

    destroy() {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
        }
        
        // Remove event listeners
        if (this.options.enableKeyboard) {
            document.removeEventListener('keydown', this.handleKeyboard);
        }
        
        console.log('🚪 Goonee Door System destroyed');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GooneDoorSystem;
} else if (typeof window !== 'undefined') {
    window.GooneDoorSystem = GooneDoorSystem;
}