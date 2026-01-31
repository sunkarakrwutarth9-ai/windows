// Windows 11 Web Desktop - Complete Application Manager

class WindowManager {
    constructor() {
        this.windows = new Map();
        this.zIndex = 100;
        this.dragState = null;
        this.resizeState = null;
    }

    create(appId, title, icon, content, width = 800, height = 600) {
        const winId = `win-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const win = document.createElement('div');
        win.className = 'window';
        win.id = winId;
        win.style.width = `${width}px`;
        win.style.height = `${height}px`;
        win.style.left = `${Math.random() * 200 + 100}px`;
        win.style.top = `${Math.random() * 100 + 50}px`;
        win.style.zIndex = ++this.zIndex;

        win.innerHTML = `
            <div class="title-bar" onmousedown="windowManager.startDrag(event, '${winId}')">
                <div class="title-content">
                    <span class="title-icon">${icon}</span>
                    <span>${title}</span>
                </div>
                <div class="window-controls">
                    <button class="window-btn" onclick="windowManager.minimize('${winId}')">
                        <svg viewBox="0 0 12 12" width="12" height="12"><rect x="0" y="5" width="12" height="1" fill="currentColor"/></svg>
                    </button>
                    <button class="window-btn" onclick="windowManager.toggleMaximize('${winId}')">
                        <svg viewBox="0 0 12 12" width="12" height="12"><rect x="0" y="0" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1"/></svg>
                    </button>
                    <button class="window-btn close" onclick="windowManager.close('${winId}')">
                        <svg viewBox="0 0 12 12" width="12" height="12"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1"/></svg>
                    </button>
                </div>
            </div>
            <div class="window-content">${content}</div>
        `;

        document.getElementById('window-area').appendChild(win);

        win.addEventListener('mousedown', () => this.focus(winId));

        this.windows.set(winId, { appId, title, icon, element: win });
        appManager.addToTaskbar(winId, appId, icon);

        return winId;
    }

    focus(winId) {
        const win = document.getElementById(winId);
        if (win) {
            win.style.zIndex = ++this.zIndex;
        }
    }

    minimize(winId) {
        const win = document.getElementById(winId);
        if (win) {
            win.classList.add('minimized');
            setTimeout(() => {
                win.style.display = 'none';
            }, 300);
        }
    }

    restore(winId) {
        const win = document.getElementById(winId);
        if (win) {
            win.style.display = 'flex';
            setTimeout(() => {
                win.classList.remove('minimized');
                this.focus(winId);
            }, 10);
        }
    }

    toggleMaximize(winId) {
        const win = document.getElementById(winId);
        if (win) {
            win.classList.toggle('maximized');
        }
    }

    close(winId) {
        const winData = this.windows.get(winId);
        if (winData) {
            winData.element.remove();
            this.windows.delete(winId);
            appManager.removeFromTaskbar(winId);
        }
    }

    startDrag(e, winId) {
        if (e.target.closest('.window-controls')) return;

        const win = document.getElementById(winId);
        if (win.classList.contains('maximized')) return;

        this.focus(winId);

        this.dragState = {
            winId,
            startX: e.clientX,
            startY: e.clientY,
            startLeft: win.offsetLeft,
            startTop: win.offsetTop
        };

        document.addEventListener('mousemove', this.onDrag);
        document.addEventListener('mouseup', this.stopDrag);
        e.preventDefault();
    }

    onDrag = (e) => {
        if (!this.dragState) return;

        const { winId, startX, startY, startLeft, startTop } = this.dragState;
        const win = document.getElementById(winId);

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        win.style.left = `${startLeft + dx}px`;
        win.style.top = `${startTop + dy}px`;
    }

    stopDrag = () => {
        this.dragState = null;
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    }

    minimizeAll() {
        this.windows.forEach((_, winId) => {
            this.minimize(winId);
        });
    }
}

class AppManager {
    constructor() {
        this.apps = {
            'notepad': {
                name: 'Notepad',
                icon: '📝',
                render: () => this.renderNotepad()
            },
            'calculator': {
                name: 'Calculator',
                icon: '🧮',
                render: () => this.renderCalculator()
            },
            'explorer': {
                name: 'File Explorer',
                icon: '📁',
                render: () => this.renderExplorer()
            },
            'edge': {
                name: 'Microsoft Edge',
                icon: '🌐',
                render: () => this.renderBrowser()
            },
            'settings': {
                name: 'Settings',
                icon: '⚙️',
                render: () => this.renderSettings()
            },
            'store': {
                name: 'Microsoft Store',
                icon: '🛍️',
                render: () => this.renderStore()
            },
            'photos': {
                name: 'Photos',
                icon: '🖼️',
                render: () => this.renderPhotos()
            },
            'paint': {
                name: 'Paint',
                icon: '🎨',
                render: () => this.renderPaint()
            },
            'terminal': {
                name: 'Terminal',
                icon: '⌨️',
                render: () => this.renderTerminal()
            },
            'recycle': {
                name: 'Recycle Bin',
                icon: '🗑️',
                render: () => '<div style="padding:40px;text-align:center;"><h2>Recycle Bin</h2><p>The Recycle Bin is empty.</p></div>'
            },
            'widgets': {
                name: 'Widgets',
                icon: '📊',
                render: () => this.renderWidgets()
            }
        };

        this.taskbarApps = new Map();
        this.initStartMenu();
    }

    initStartMenu() {
        const pinnedApps = document.getElementById('pinned-apps');
        Object.entries(this.apps).forEach(([id, app]) => {
            const tile = document.createElement('div');
            tile.className = 'app-tile';
            tile.onclick = () => this.openApp(id);
            tile.innerHTML = `
                <div class="app-tile-icon">${app.icon}</div>
                <div class="app-tile-name">${app.name}</div>
            `;
            pinnedApps.appendChild(tile);
        });
    }

    openApp(appId) {
        const app = this.apps[appId];
        if (!app) return;

        ui.closeAllPanels();

        const content = app.render();
        windowManager.create(appId, app.name, app.icon, content);
    }

    addToTaskbar(winId, appId, icon) {
        const taskbarApps = document.getElementById('taskbar-apps');
        const btn = document.createElement('button');
        btn.className = 'taskbar-icon active';
        btn.dataset.winId = winId;
        btn.innerHTML = icon;
        btn.onclick = () => {
            const win = document.getElementById(winId);
            if (win.style.display === 'none') {
                windowManager.restore(winId);
            } else if (parseInt(win.style.zIndex) === windowManager.zIndex) {
                windowManager.minimize(winId);
            } else {
                windowManager.focus(winId);
            }
        };
        taskbarApps.appendChild(btn);
        this.taskbarApps.set(winId, btn);
    }

    removeFromTaskbar(winId) {
        const btn = this.taskbarApps.get(winId);
        if (btn) {
            btn.remove();
            this.taskbarApps.delete(winId);
        }
    }

    toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    minimizeAll() {
        windowManager.minimizeAll();
    }

    // App Renderers
    renderNotepad() {
        const saved = localStorage.getItem('notepad-content') || '';
        return `
            <div style="height:100%;display:flex;flex-direction:column;">
                <div style="padding:8px;background:rgba(0,0,0,0.03);border-bottom:1px solid rgba(0,0,0,0.1);display:flex;gap:8px;">
                    <button onclick="document.getElementById('notepad-text').value='';localStorage.setItem('notepad-content','')" style="padding:4px 12px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">New</button>
                    <button onclick="appManager.saveNotepad()" style="padding:4px 12px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">Save</button>
                </div>
                <textarea id="notepad-text" style="flex:1;border:none;padding:12px;font-family:Consolas,monospace;font-size:14px;resize:none;outline:none;background:transparent;" oninput="localStorage.setItem('notepad-content',this.value)">${saved}</textarea>
            </div>
        `;
    }

    saveNotepad() {
        const text = document.getElementById('notepad-text').value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    renderCalculator() {
        const calcId = 'calc-' + Date.now();
        return `
            <div style="padding:20px;height:100%;display:flex;flex-direction:column;gap:12px;background:#202020;color:white;">
                <div id="${calcId}-display" style="padding:20px;font-size:48px;text-align:right;background:rgba(0,0,0,0.3);border-radius:8px;min-height:80px;display:flex;align-items:center;justify-content:flex-end;">0</div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex:1;">
                    ${['C', '÷', '×', '←', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].map(btn =>
            `<button onclick="appManager.calcPress('${calcId}', '${btn}')" style="padding:20px;font-size:20px;border:none;background:${btn === '=' ? '#0078D7' : 'rgba(255,255,255,0.1)'};color:white;border-radius:8px;cursor:pointer;transition:0.15s;" onmouseover="this.style.background='${btn === '=' ? '#106EBE' : 'rgba(255,255,255,0.2)'}'" onmouseout="this.style.background='${btn === '=' ? '#0078D7' : 'rgba(255,255,255,0.1)'}'">${btn}</button>`
        ).join('')}
                </div>
            </div>
        `;
    }

    calcPress(calcId, btn) {
        const display = document.getElementById(`${calcId}-display`);
        let current = display.textContent;

        if (btn === 'C') {
            display.textContent = '0';
        } else if (btn === '←') {
            display.textContent = current.length > 1 ? current.slice(0, -1) : '0';
        } else if (btn === '=') {
            try {
                const result = eval(current.replace('×', '*').replace('÷', '/'));
                display.textContent = result;
            } catch {
                display.textContent = 'Error';
            }
        } else {
            if (current === '0' && btn !== '.') {
                display.textContent = btn;
            } else {
                display.textContent = current + btn;
            }
        }
    }

    renderExplorer() {
        return `
            <div style="height:100%;display:flex;flex-direction:column;">
                <div style="padding:8px;background:rgba(0,0,0,0.03);border-bottom:1px solid rgba(0,0,0,0.1);display:flex;gap:8px;align-items:center;">
                    <button style="padding:4px 8px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">←</button>
                    <button style="padding:4px 8px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">→</button>
                    <button style="padding:4px 8px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">↑</button>
                    <input value="C:\\Users\\User\\Desktop" style="flex:1;padding:6px 12px;border:1px solid rgba(0,0,0,0.2);border-radius:4px;outline:none;" readonly>
                    <input placeholder="Search" style="padding:6px 12px;border:1px solid rgba(0,0,0,0.2);border-radius:4px;outline:none;width:200px;">
                </div>
                <div style="display:flex;flex:1;">
                    <div style="width:200px;padding:12px;background:rgba(0,0,0,0.02);border-right:1px solid rgba(0,0,0,0.1);">
                        <div style="margin-bottom:8px;font-weight:600;font-size:12px;">Quick access</div>
                        <div style="padding:6px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">📁 Desktop</div>
                        <div style="padding:6px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">📄 Documents</div>
                        <div style="padding:6px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">⬇️ Downloads</div>
                        <div style="padding:6px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">🖼️ Pictures</div>
                        <div style="padding:6px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">🎵 Music</div>
                        <div style="margin:12px 0 8px;font-weight:600;font-size:12px;">This PC</div>
                        <div style="padding:6px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">💾 Local Disk (C:)</div>
                    </div>
                    <div style="flex:1;padding:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:16px;align-content:start;">
                        <div style="text-align:center;cursor:pointer;padding:8px;border-radius:8px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
                            <div style="font-size:48px;">📁</div>
                            <div style="font-size:13px;margin-top:4px;">Projects</div>
                        </div>
                        <div style="text-align:center;cursor:pointer;padding:8px;border-radius:8px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
                            <div style="font-size:48px;">📄</div>
                            <div style="font-size:13px;margin-top:4px;">Resume.docx</div>
                        </div>
                        <div style="text-align:center;cursor:pointer;padding:8px;border-radius:8px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
                            <div style="font-size:48px;">🖼️</div>
                            <div style="font-size:13px;margin-top:4px;">Photo.jpg</div>
                        </div>
                        <div style="text-align:center;cursor:pointer;padding:8px;border-radius:8px;" onclick="alert('Cannot execute .exe files in a web browser environment.')" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
                            <div style="font-size:48px;">⚙️</div>
                            <div style="font-size:13px;margin-top:4px;">Setup.exe</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderBrowser() {
        return `
            <div style="height:100%;display:flex;flex-direction:column;">
                <div style="padding:8px;background:rgba(0,0,0,0.03);border-bottom:1px solid rgba(0,0,0,0.1);display:flex;gap:8px;">
                    <button style="padding:6px 12px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">←</button>
                    <button style="padding:6px 12px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">→</button>
                    <button style="padding:6px 12px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">⟳</button>
                    <input id="browser-url" value="https://www.bing.com" style="flex:1;padding:6px 12px;border:1px solid rgba(0,0,0,0.2);border-radius:20px;outline:none;">
                    <button onclick="document.getElementById('browser-frame').src=document.getElementById('browser-url').value" style="padding:6px 12px;border:1px solid rgba(0,0,0,0.2);background:#0078D7;color:white;border-radius:4px;cursor:pointer;">Go</button>
                </div>
                <iframe id="browser-frame" src="https://www.bing.com" style="flex:1;border:none;background:white;"></iframe>
            </div>
        `;
    }

    renderSettings() {
        return `
            <div style="height:100%;display:flex;">
                <div style="width:250px;padding:20px;background:rgba(0,0,0,0.02);border-right:1px solid rgba(0,0,0,0.1);">
                    <div style="font-size:24px;font-weight:600;margin-bottom:20px;">Settings</div>
                    <div style="padding:10px;background:rgba(0,120,215,0.1);border-left:3px solid #0078D7;margin-bottom:8px;cursor:pointer;">🎨 Personalization</div>
                    <div style="padding:10px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">🖥️ System</div>
                    <div style="padding:10px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">📱 Devices</div>
                    <div style="padding:10px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">🌐 Network</div>
                    <div style="padding:10px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">👤 Accounts</div>
                </div>
                <div style="flex:1;padding:40px;overflow:auto;">
                    <h2 style="margin-bottom:20px;">Personalization</h2>
                    <div style="margin-bottom:30px;">
                        <h3 style="margin-bottom:12px;">Background</h3>
                        <div style="display:flex;gap:12px;">
                            <div onclick="document.body.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'" style="width:80px;height:80px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:8px;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor='#0078D7'" onmouseout="this.style.borderColor='transparent'"></div>
                            <div onclick="document.body.style.background='linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'" style="width:80px;height:80px;background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%);border-radius:8px;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor='#0078D7'" onmouseout="this.style.borderColor='transparent'"></div>
                            <div onclick="document.body.style.background='linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'" style="width:80px;height:80px;background:linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);border-radius:8px;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor='#0078D7'" onmouseout="this.style.borderColor='transparent'"></div>
                            <div onclick="document.body.style.background='linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'" style="width:80px;height:80px;background:linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);border-radius:8px;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor='#0078D7'" onmouseout="this.style.borderColor='transparent'"></div>
                        </div>
                    </div>
                    <div style="margin-bottom:30px;">
                        <h3 style="margin-bottom:12px;">Theme</h3>
                        <button onclick="document.body.classList.toggle('dark-mode')" style="padding:12px 24px;background:#0078D7;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">Toggle Dark Mode</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderStore() {
        return `
            <div style="height:100%;overflow:auto;background:linear-gradient(180deg, #0078D7 0%, #005a9e 100%);">
                <div style="padding:40px;color:white;">
                    <h1 style="font-size:48px;margin-bottom:12px;">Microsoft Store</h1>
                    <p style="font-size:18px;opacity:0.9;">Discover apps, games, and entertainment</p>
                </div>
                <div style="background:white;padding:40px;min-height:calc(100% - 200px);">
                    <h2 style="margin-bottom:20px;">Featured Apps</h2>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px;">
                        ${['Spotify', 'Netflix', 'Adobe Photoshop', 'Visual Studio Code', 'Discord', 'Zoom'].map(app => `
                            <div style="padding:20px;border:1px solid #ddd;border-radius:8px;cursor:pointer;transition:0.15s;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
                                <div style="width:60px;height:60px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;margin-bottom:12px;"></div>
                                <h3 style="font-size:16px;margin-bottom:4px;">${app}</h3>
                                <p style="font-size:12px;color:#666;margin-bottom:12px;">Entertainment</p>
                                <button style="width:100%;padding:8px;background:#0078D7;color:white;border:none;border-radius:4px;cursor:pointer;">Get</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderPhotos() {
        return `
            <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#000;">
                <input type="file" id="photo-input" accept="image/*" style="display:none;" onchange="appManager.loadPhoto(event)">
                <div id="photo-display" style="max-width:100%;max-height:100%;display:flex;align-items:center;justify-content:center;color:white;">
                    <div style="text-align:center;">
                        <div style="font-size:64px;margin-bottom:20px;">🖼️</div>
                        <h2 style="margin-bottom:12px;">No photo selected</h2>
                        <button onclick="document.getElementById('photo-input').click()" style="padding:12px 24px;background:#0078D7;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">Open Photo</button>
                    </div>
                </div>
            </div>
        `;
    }

    loadPhoto(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('photo-display').innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:100%;object-fit:contain;">`;
            };
            reader.readAsDataURL(file);
        }
    }

    renderPaint() {
        return `
            <div style="height:100%;display:flex;flex-direction:column;">
                <div style="padding:8px;background:rgba(0,0,0,0.03);border-bottom:1px solid rgba(0,0,0,0.1);display:flex;gap:8px;">
                    <button onclick="appManager.clearCanvas()" style="padding:6px 12px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">Clear</button>
                    <input type="color" id="paint-color" value="#000000" style="width:40px;height:30px;border:1px solid rgba(0,0,0,0.2);border-radius:4px;cursor:pointer;">
                    <input type="range" id="paint-size" min="1" max="20" value="3" style="width:100px;">
                </div>
                <canvas id="paint-canvas" style="flex:1;background:white;cursor:crosshair;"></canvas>
            </div>
        `;
    }

    clearCanvas() {
        const canvas = document.getElementById('paint-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    renderTerminal() {
        return `
            <div style="height:100%;background:#0C0C0C;color:#CCCCCC;font-family:Consolas,monospace;padding:20px;overflow:auto;">
                <div style="margin-bottom:12px;">Microsoft Windows [Version 11.0.22000.1]</div>
                <div style="margin-bottom:12px;">(c) Microsoft Corporation. All rights reserved.</div>
                <div style="margin-bottom:20px;"></div>
                <div id="terminal-output"></div>
                <div style="display:flex;align-items:center;">
                    <span style="color:#00FF00;">C:\\Users\\User&gt;</span>
                    <input id="terminal-input" type="text" style="flex:1;background:transparent;border:none;outline:none;color:#CCCCCC;font-family:Consolas,monospace;padding-left:8px;" onkeypress="if(event.key==='Enter')appManager.runCommand(this.value,this)">
                </div>
            </div>
        `;
    }

    runCommand(cmd, input) {
        const output = document.getElementById('terminal-output');
        const responses = {
            'help': 'Available commands: help, dir, cls, echo, date, time, ver',
            'dir': 'Directory of C:\\Users\\User\n\n📁 Desktop\n📁 Documents\n📁 Downloads\n📄 file.txt',
            'cls': '',
            'ver': 'Windows 11 Web Edition [Version 11.0.22000.1]',
            'date': new Date().toLocaleDateString(),
            'time': new Date().toLocaleTimeString()
        };

        if (cmd === 'cls') {
            output.innerHTML = '';
        } else {
            const response = responses[cmd.toLowerCase()] || `'${cmd}' is not recognized as an internal or external command.`;
            output.innerHTML += `<div style="color:#00FF00;">C:\\Users\\User&gt;</div><div style="margin-bottom:12px;">${cmd}</div><div style="margin-bottom:12px;">${response}</div>`;
        }

        input.value = '';
        output.scrollTop = output.scrollHeight;
    }

    renderWidgets() {
        return `
            <div style="height:100%;padding:20px;overflow:auto;">
                <h2 style="margin-bottom:20px;">Widgets</h2>
                <div style="display:grid;gap:16px;">
                    <div style="padding:20px;background:rgba(255,255,255,0.5);border-radius:12px;backdrop-filter:blur(10px);">
                        <h3 style="margin-bottom:12px;">Weather</h3>
                        <div style="font-size:48px;margin-bottom:8px;">⛅</div>
                        <div style="font-size:32px;font-weight:600;">72°F</div>
                        <div style="opacity:0.7;">Partly Cloudy</div>
                    </div>
                    <div style="padding:20px;background:rgba(255,255,255,0.5);border-radius:12px;backdrop-filter:blur(10px);">
                        <h3 style="margin-bottom:12px;">Calendar</h3>
                        <div style="font-size:24px;font-weight:600;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div style="padding:20px;background:rgba(255,255,255,0.5);border-radius:12px;backdrop-filter:blur(10px);">
                        <h3 style="margin-bottom:12px;">News</h3>
                        <div style="font-size:14px;line-height:1.6;">
                            <div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(0,0,0,0.1);">📰 Latest technology updates</div>
                            <div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(0,0,0,0.1);">🌍 World news highlights</div>
                            <div>💼 Business trends today</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

class UI {
    constructor() {
        this.activePanel = null;
        this.initClock();
        this.initPaint();
    }

    initClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        document.getElementById('taskbar-time').textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        document.getElementById('taskbar-date').textContent = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    }

    toggleStart() {
        const startMenu = document.getElementById('start-menu');
        const isHidden = startMenu.classList.contains('hidden');

        this.closeAllPanels();

        if (isHidden) {
            startMenu.classList.remove('hidden');
            this.activePanel = 'start';
            setTimeout(() => document.getElementById('start-search-input').focus(), 100);
        }
    }

    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        const isHidden = panel.classList.contains('hidden');

        this.closeAllPanels();

        if (isHidden) {
            panel.classList.remove('hidden');
            this.activePanel = panelId;
        }
    }

    closeAllPanels() {
        ['start-menu', 'quick-settings', 'notification-center', 'context-menu'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
        this.activePanel = null;
    }

    searchApps(query) {
        // Simple search implementation
        const tiles = document.querySelectorAll('.app-tile');
        tiles.forEach(tile => {
            const name = tile.querySelector('.app-tile-name').textContent.toLowerCase();
            tile.style.display = name.includes(query.toLowerCase()) ? 'flex' : 'none';
        });
    }

    contextAction(action) {
        console.log('Context action:', action);
        this.closeAllPanels();
    }

    clearNotifications() {
        document.getElementById('notif-list').innerHTML = '<div style="padding:40px;text-align:center;opacity:0.5;">No notifications</div>';
    }

    showPowerMenu() {
        if (confirm('Close this tab? (Simulates shutdown)')) {
            window.close();
        }
    }

    toggleAllApps() {
        alert('All apps view - Feature coming soon!');
    }

    initPaint() {
        // Initialize paint canvas when window opens
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const canvas = document.getElementById('paint-canvas');
                if (canvas) {
                    canvas.width = canvas.offsetWidth;
                    canvas.height = canvas.offsetHeight;

                    const ctx = canvas.getContext('2d');
                    let painting = false;

                    canvas.addEventListener('mousedown', () => painting = true);
                    canvas.addEventListener('mouseup', () => painting = false);
                    canvas.addEventListener('mousemove', (e) => {
                        if (!painting) return;

                        const rect = canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        ctx.lineWidth = document.getElementById('paint-size').value;
                        ctx.lineCap = 'round';
                        ctx.strokeStyle = document.getElementById('paint-color').value;

                        ctx.lineTo(x, y);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                    });
                }
            }, 1000);
        });
    }
}

// Initialize
const windowManager = new WindowManager();
const appManager = new AppManager();
const ui = new UI();

// Global event listeners
document.addEventListener('click', (e) => {
    if (!e.target.closest('#start-menu, .start-button, #quick-settings, .system-tray, #notification-center, #context-menu')) {
        ui.closeAllPanels();
    }
});

document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('#desktop') && !e.target.closest('.window, #taskbar')) {
        e.preventDefault();
        const menu = document.getElementById('context-menu');
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
        menu.classList.remove('hidden');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Escape') {
        appManager.openApp('terminal');
    }
});

console.log('%cWindows 11 Web Desktop', 'font-size:24px;font-weight:bold;color:#0078D7');
console.log('%cFully functional web-based Windows 11 experience', 'font-size:14px;color:#666');
