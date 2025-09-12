// Mobile-friendly navigation component for all lab files
(function() {
    'use strict';
    
    // Create navigation bar
    function createNavBar() {
        const nav = document.createElement('nav');
        nav.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #00ff88;
            padding: 10px 15px;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        // Home button
        const homeBtn = document.createElement('button');
        homeBtn.innerHTML = '🏠 Labs';
        homeBtn.style.cssText = `
            background: linear-gradient(45deg, #00ff88, #00cc6a);
            color: #000;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            font-size: 14px;
        `;
        homeBtn.onclick = () => window.location.href = 'index.html';
        
        // Title
        const title = document.createElement('span');
        title.textContent = document.title.replace('Thai Ethical Hacking Labs — ', '').replace('LAB: ', '');
        title.style.cssText = `
            color: #00ff88;
            font-weight: 600;
            font-size: 14px;
            flex: 1;
            text-align: center;
            margin: 0 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        
        // Menu button
        const menuBtn = document.createElement('button');
        menuBtn.innerHTML = '☰';
        menuBtn.style.cssText = `
            background: rgba(0, 255, 136, 0.2);
            color: #00ff88;
            border: 1px solid #00ff88;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
        `;
        
        nav.appendChild(homeBtn);
        nav.appendChild(title);
        nav.appendChild(menuBtn);
        
        // Add to page
        document.body.insertBefore(nav, document.body.firstChild);
        
        // Adjust body padding to account for fixed nav
        document.body.style.paddingTop = '60px';
        
        // Menu functionality
        let menuOpen = false;
        const menu = createDropdownMenu();
        
        menuBtn.onclick = () => {
            menuOpen = !menuOpen;
            menu.style.display = menuOpen ? 'block' : 'none';
        };
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menu.contains(e.target)) {
                menuOpen = false;
                menu.style.display = 'none';
            }
        });
    }
    
    // Create dropdown menu with lab links
    function createDropdownMenu() {
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            top: 60px;
            right: 15px;
            background: rgba(20, 20, 30, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid #00ff88;
            border-radius: 8px;
            padding: 10px;
            display: none;
            z-index: 1001;
            max-width: 250px;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        const labs = [
            { name: 'API Security Lab', file: 'GamblingAPI_lab.html' },
            { name: 'Classical Ciphers', file: 'ClassicalCiphers.html' },
            { name: 'Network Forensics', file: 'NetworkForensics.html' },
            { name: 'Firewall Config', file: 'FirewallConfig.html' },
            { name: 'Port Scanning', file: 'portscan.html' },
            { name: 'Man-in-the-Middle', file: 'Man-in-the-Middle.html' },
            { name: 'DDoS Simulation', file: 'DDoS.html' },
            { name: 'Wireless Security', file: 'WirelessSecurity.html' },
            { name: 'Log Analysis', file: 'LogAnalysisChallenge.html' }
        ];
        
        labs.forEach(lab => {
            const link = document.createElement('a');
            link.href = lab.file;
            link.textContent = lab.name;
            link.style.cssText = `
                display: block;
                color: #8ea4ca;
                text-decoration: none;
                padding: 8px 12px;
                border-radius: 4px;
                margin-bottom: 2px;
                font-size: 14px;
                transition: all 0.2s ease;
            `;
            
            link.onmouseover = () => {
                link.style.background = 'rgba(0, 255, 136, 0.1)';
                link.style.color = '#00ff88';
            };
            
            link.onmouseout = () => {
                link.style.background = 'transparent';
                link.style.color = '#8ea4ca';
            };
            
            menu.appendChild(link);
        });
        
        document.body.appendChild(menu);
        return menu;
    }
    
    // Create floating action button for mobile
    function createFloatingButton() {
        const fab = document.createElement('button');
        fab.innerHTML = '💡';
        fab.title = 'Quick Help';
        fab.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(45deg, #00ff88, #00cc6a);
            color: #000;
            border: none;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
            z-index: 999;
            transition: all 0.3s ease;
        `;
        
        fab.onclick = () => {
            showQuickHelp();
        };
        
        fab.onmouseover = () => {
            fab.style.transform = 'scale(1.1)';
        };
        
        fab.onmouseout = () => {
            fab.style.transform = 'scale(1)';
        };
        
        document.body.appendChild(fab);
    }
    
    // Show quick help modal
    function showQuickHelp() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: rgba(20, 20, 30, 0.95);
            border: 1px solid #00ff88;
            border-radius: 12px;
            padding: 20px;
            max-width: 400px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        content.innerHTML = `
            <h3 style="color: #00ff88; margin-top: 0;">🚀 Quick Help</h3>
            <div style="color: #e0e0e0; line-height: 1.6;">
                <p><strong>Navigation:</strong></p>
                <ul>
                    <li>🏠 Labs - กลับหน้าหลัก</li>
                    <li>☰ Menu - เปิดรายการ Labs อื่นๆ</li>
                </ul>
                
                <p><strong>Mobile Tips:</strong></p>
                <ul>
                    <li>ใช้นิ้วแตะปุ่มต่างๆ</li>
                    <li>เลื่อนหน้าจอเพื่อดูเนื้อหา</li>
                    <li>หมุนหน้าจอเป็นแนวนอนสำหรับพื้นที่มากขึ้น</li>
                </ul>
                
                <p><strong>Learning Path:</strong></p>
                <ol>
                    <li>เริ่มจาก Beginner labs</li>
                    <li>ทำ Intermediate เมื่อพร้อม</li>
                    <li>ท้าทาย Advanced labs</li>
                </ol>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #00ff88; color: #000; border: none; padding: 10px 20px; 
                           border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 15px;">
                เข้าใจแล้ว
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }
    
    // Add mobile-friendly styles
    function addMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile-friendly improvements */
            @media (max-width: 768px) {
                body {
                    font-size: 16px !important;
                    line-height: 1.6 !important;
                }
                
                button, input, select, textarea {
                    min-height: 44px !important;
                    font-size: 16px !important;
                }
                
                /* Prevent zoom on input focus */
                input, select, textarea {
                    font-size: 16px !important;
                }
                
                /* Better touch targets */
                a, button, [onclick] {
                    min-height: 44px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                
                /* Scrollable content */
                .log, .list, pre {
                    -webkit-overflow-scrolling: touch !important;
                }
            }
            
            /* Dark theme improvements */
            ::selection {
                background: rgba(0, 255, 136, 0.3);
            }
            
            ::-webkit-scrollbar {
                width: 8px;
            }
            
            ::-webkit-scrollbar-track {
                background: #1a1a2e;
            }
            
            ::-webkit-scrollbar-thumb {
                background: #00ff88;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize when DOM is ready
    function init() {
        // Only add navigation if we're not on the main index page
        if (!window.location.pathname.endsWith('index.html') && 
            !window.location.pathname.endsWith('/LAB/') &&
            !window.location.pathname.endsWith('/LAB')) {
            createNavBar();
            createFloatingButton();
        }
        addMobileStyles();
    }
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();