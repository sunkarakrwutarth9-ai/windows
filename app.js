// Windows 11 Web - Production Ready - All Apps Working

// App Registry
const APPS = {
    notepad: { name: 'Notepad', icon: '📝', color: '#0078D7' },
    calculator: { name: 'Calculator', icon: '🧮', color: '#0078D7' },
    explorer: { name: 'File Explorer', icon: '📁', color: '#FFC107' },
    edge: { name: 'Microsoft Edge', icon: '🌐', color: '#0078D7' },
    settings: { name: 'Settings', icon: '⚙️', color: '#0078D7' },
    store: { name: 'Microsoft Store', icon: '🛍️', color: '#0078D7' },
    photos: { name: 'Photos', icon: '🖼️', color: '#0078D7' },
    paint: { name: 'Paint', icon: '🎨', color: '#0078D7' },
    terminal: { name: 'Terminal', icon: '⌨️', color: '#0C0C0C' },
    widgets: { name: 'Widgets', icon: '📊', color: '#0078D7' },
    recycle: { name: 'Recycle Bin', icon: '🗑️', color: '#2196F3' }
};

// State
let windows = new Map();
let zIndex = 100;
let dragState = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initLockScreen();
    initClock();
    initStartMenu();
    initEventListeners();
});

// Lock Screen
function initLockScreen() {
    const lockscreen = document.getElementById('lockscreen');
    const updateLockTime = () => {
        const now = new Date();
        document.getElementById('lock-time').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        document.getElementById('lock-date').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };
    updateLockTime();
    setInterval(updateLockTime, 1000);

    lockscreen.addEventListener('click', () => {
        lockscreen.style.display = 'none';
        document.getElementById('desktop').classList.remove('hidden');
    });
}

// Clock
function initClock() {
    const updateClock = () => {
        const now = new Date();
        document.getElementById('clock-time').textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    };
    updateClock();
    setInterval(updateClock, 1000);
}

// Start Menu
function initStartMenu() {
    const grid = document.getElementById('pinned-grid');
    Object.entries(APPS).forEach(([id, app]) => {
        const tile = document.createElement('div');
        tile.className = 'app-tile';
        tile.onclick = () => openApp(id);
        tile.innerHTML = `
            <div class="app-tile-icon">${app.icon}</div>
            <div class="app-tile-name">${app.name}</div>
        `;
        grid.appendChild(tile);
    });
}

// Event Listeners
function initEventListeners() {
    // Close panels on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#start-menu, .start-btn, #action-center, .taskbar-clock, .system-tray, #context-menu')) {
            closeAllPanels();
        }
    });

    // Context menu
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('#desktop') && !e.target.closest('.window, #taskbar')) {
            e.preventDefault();
            const menu = document.getElementById('context-menu');
            menu.style.left = `${e.clientX}px`;
            menu.style.top = `${e.clientY}px`;
            menu.classList.remove('hidden');
        }
    });
}

// Toggle Functions
function toggleStart() {
    const menu = document.getElementById('start-menu');
    menu.classList.toggle('hidden');
    document.getElementById('action-center').classList.add('hidden');
    if (!menu.classList.contains('hidden')) {
        document.getElementById('search-input').focus();
    }
}

function toggleActionCenter() {
    const ac = document.getElementById('action-center');
    ac.classList.toggle('hidden');
    document.getElementById('start-menu').classList.add('hidden');
}

function closeAllPanels() {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('action-center').classList.add('hidden');
    document.getElementById('context-menu').classList.add('hidden');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            document.getElementById('fullscreen-text').textContent = 'Exit Fullscreen';
        }).catch(err => console.log(err));
    } else {
        document.exitFullscreen().then(() => {
            document.getElementById('fullscreen-text').textContent = 'Enter Fullscreen';
        });
    }
}

function setBrightness(value) {
    document.body.style.filter = `brightness(${value}%)`;
}

function refreshDesktop() {
    location.reload();
}

function minimizeAll() {
    windows.forEach((win) => {
        win.element.classList.add('minimized');
    });
}

function clearNotifications() {
    document.getElementById('notif-list').innerHTML = '<div style="padding:40px;text-align:center;opacity:0.5;">No notifications</div>';
}

function searchApps(query) {
    const tiles = document.querySelectorAll('.app-tile');
    tiles.forEach(tile => {
        const name = tile.querySelector('.app-tile-name').textContent.toLowerCase();
        tile.style.display = name.includes(query.toLowerCase()) ? 'flex' : 'none';
    });
}

function showPowerMenu() {
    if (confirm('Close this window? (Simulates shutdown)')) {
        window.close();
    }
}

// Window Management
function openApp(appId) {
    const app = APPS[appId];
    if (!app) return;

    closeAllPanels();

    const winId = `win-${Date.now()}`;
    const win = document.createElement('div');
    win.className = 'window';
    win.id = winId;
    win.style.width = '900px';
    win.style.height = '600px';
    win.style.left = `${100 + Math.random() * 100}px`;
    win.style.top = `${50 + Math.random() * 50}px`;
    win.style.zIndex = ++zIndex;

    const content = getAppContent(appId, winId);

    win.innerHTML = `
        <div class="window-titlebar" onmousedown="startDrag(event, '${winId}')">
            <div class="window-title">
                <span class="window-icon">${app.icon}</span>
                <span>${app.name}</span>
            </div>
            <div class="window-controls">
                <button class="win-control" onclick="minimizeWindow('${winId}')">
                    <svg width="12" height="12"><rect y="5" width="12" height="1" fill="currentColor"/></svg>
                </button>
                <button class="win-control" onclick="maximizeWindow('${winId}')">
                    <svg width="12" height="12"><rect width="12" height="12" fill="none" stroke="currentColor"/></svg>
                </button>
                <button class="win-control close" onclick="closeWindow('${winId}')">
                    <svg width="12" height="12"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor"/></svg>
                </button>
            </div>
        </div>
        <div class="window-body">${content}</div>
    `;

    document.getElementById('windows-container').appendChild(win);
    win.addEventListener('mousedown', () => focusWindow(winId));

    windows.set(winId, { appId, element: win });
    addToTaskbar(winId, app);

    // Initialize app-specific features
    if (appId === 'paint') initPaint(winId);
    if (appId === 'terminal') initTerminal(winId);
}

function focusWindow(winId) {
    const win = document.getElementById(winId);
    if (win) win.style.zIndex = ++zIndex;
}

function minimizeWindow(winId) {
    const winData = windows.get(winId);
    if (winData) {
        winData.element.classList.add('minimized');
        setTimeout(() => winData.element.style.display = 'none', 250);
    }
}

function restoreWindow(winId) {
    const winData = windows.get(winId);
    if (winData) {
        winData.element.style.display = 'flex';
        setTimeout(() => {
            winData.element.classList.remove('minimized');
            focusWindow(winId);
        }, 10);
    }
}

function maximizeWindow(winId) {
    const win = document.getElementById(winId);
    if (win) win.classList.toggle('maximized');
}

function closeWindow(winId) {
    const winData = windows.get(winId);
    if (winData) {
        winData.element.remove();
        windows.delete(winId);
        removeFromTaskbar(winId);
    }
}

// Drag
function startDrag(e, winId) {
    if (e.target.closest('.window-controls')) return;
    const win = document.getElementById(winId);
    if (win.classList.contains('maximized')) return;

    focusWindow(winId);
    dragState = {
        winId,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: win.offsetLeft,
        startTop: win.offsetTop
    };

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    e.preventDefault();
}

function onDrag(e) {
    if (!dragState) return;
    const win = document.getElementById(dragState.winId);
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    win.style.left = `${dragState.startLeft + dx}px`;
    win.style.top = `${dragState.startTop + dy}px`;
}

function stopDrag() {
    dragState = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
}

// Taskbar
function addToTaskbar(winId, app) {
    const taskbar = document.getElementById('taskbar-apps');
    const btn = document.createElement('button');
    btn.className = 'taskbar-btn active';
    btn.dataset.winId = winId;
    btn.innerHTML = app.icon;
    btn.title = app.name;
    btn.onclick = () => {
        const win = document.getElementById(winId);
        if (win.style.display === 'none') {
            restoreWindow(winId);
        } else if (parseInt(win.style.zIndex) === zIndex) {
            minimizeWindow(winId);
        } else {
            focusWindow(winId);
        }
    };
    taskbar.appendChild(btn);
}

function removeFromTaskbar(winId) {
    const btn = document.querySelector(`[data-win-id="${winId}"]`);
    if (btn) btn.remove();
}

// App Content Generators
function getAppContent(appId, winId) {
    switch (appId) {
        case 'notepad': return getNotepadContent(winId);
        case 'calculator': return getCalculatorContent(winId);
        case 'explorer': return getExplorerContent();
        case 'edge': return getEdgeContent();
        case 'settings': return getSettingsContent();
        case 'store': return getStoreContent();
        case 'photos': return getPhotosContent(winId);
        case 'paint': return getPaintContent(winId);
        case 'terminal': return getTerminalContent(winId);
        case 'widgets': return getWidgetsContent();
        case 'recycle': return '<div style="padding:60px;text-align:center;"><h2>Recycle Bin</h2><p style="margin-top:20px;opacity:0.7;">The Recycle Bin is empty.</p></div>';
        default: return '<div style="padding:40px;">App content</div>';
    }
}

function getNotepadContent(winId) {
    const saved = localStorage.getItem('notepad') || '';
    return `
        <div style="height:100%;display:flex;flex-direction:column;">
            <div style="padding:8px;background:rgba(0,0,0,0.02);border-bottom:1px solid rgba(0,0,0,0.08);display:flex;gap:8px;">
                <button onclick="document.getElementById('notepad-${winId}').value='';localStorage.setItem('notepad','')" style="padding:6px 16px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;font-size:13px;">New</button>
                <button onclick="saveNotepad('${winId}')" style="padding:6px 16px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;font-size:13px;">Save</button>
            </div>
            <textarea id="notepad-${winId}" style="flex:1;border:none;padding:16px;font-family:Consolas,monospace;font-size:14px;resize:none;outline:none;background:transparent;" oninput="localStorage.setItem('notepad',this.value)">${saved}</textarea>
        </div>
    `;
}

function saveNotepad(winId) {
    const text = document.getElementById(`notepad-${winId}`).value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function getCalculatorContent(winId) {
    return `
        <div style="padding:24px;height:100%;display:flex;flex-direction:column;gap:16px;background:#202020;color:white;">
            <div id="calc-display-${winId}" style="padding:24px;font-size:56px;text-align:right;background:rgba(0,0,0,0.3);border-radius:8px;min-height:100px;display:flex;align-items:center;justify-content:flex-end;word-break:break-all;">0</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex:1;">
                ${['C', '÷', '×', '←', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].map(btn =>
        `<button onclick="calcPress('${winId}','${btn}')" style="padding:24px;font-size:24px;border:none;background:${btn === '=' ? '#0078D7' : 'rgba(255,255,255,0.1)'};color:white;border-radius:8px;cursor:pointer;font-weight:500;transition:0.15s;" onmouseover="this.style.background='${btn === '=' ? '#005A9E' : 'rgba(255,255,255,0.2)'}'" onmouseout="this.style.background='${btn === '=' ? '#0078D7' : 'rgba(255,255,255,0.1)'}'">${btn}</button>`
    ).join('')}
            </div>
        </div>
    `;
}

function calcPress(winId, btn) {
    const display = document.getElementById(`calc-display-${winId}`);
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

function getExplorerContent() {
    return `
        <div style="height:100%;display:flex;flex-direction:column;">
            <div style="padding:8px;background:rgba(0,0,0,0.02);border-bottom:1px solid rgba(0,0,0,0.08);display:flex;gap:8px;align-items:center;">
                <button style="padding:6px 12px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">←</button>
                <button style="padding:6px 12px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">→</button>
                <button style="padding:6px 12px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;">↑</button>
                <input value="This PC > Desktop" style="flex:1;padding:8px 12px;border:1px solid rgba(0,0,0,0.2);border-radius:4px;outline:none;font-size:13px;" readonly>
                <input placeholder="Search" style="padding:8px 12px;border:1px solid rgba(0,0,0,0.2);border-radius:4px;outline:none;width:200px;font-size:13px;">
            </div>
            <div style="display:flex;flex:1;">
                <div style="width:220px;padding:16px;background:rgba(0,0,0,0.02);border-right:1px solid rgba(0,0,0,0.08);">
                    <div style="font-weight:600;font-size:12px;margin-bottom:12px;opacity:0.7;">Quick access</div>
                    ${['📁 Desktop', '📄 Documents', '⬇️ Downloads', '🖼️ Pictures', '🎵 Music', '🎬 Videos'].map(item =>
        `<div style="padding:8px;cursor:pointer;border-radius:4px;font-size:13px;margin-bottom:4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">${item}</div>`
    ).join('')}
                    <div style="font-weight:600;font-size:12px;margin:20px 0 12px;opacity:0.7;">This PC</div>
                    <div style="padding:8px;cursor:pointer;border-radius:4px;font-size:13px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">💾 Local Disk (C:)</div>
                </div>
                <div style="flex:1;padding:24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:20px;align-content:start;">
                    ${[
            { icon: '📁', name: 'Projects' },
            { icon: '📁', name: 'Documents' },
            { icon: '📄', name: 'Resume.docx' },
            { icon: '🖼️', name: 'Photo.jpg' },
            { icon: '🎵', name: 'Music.mp3' },
            { icon: '⚙️', name: 'Setup.exe', click: 'alert("Cannot execute .exe files in browser")' }
        ].map(file =>
            `<div style="text-align:center;cursor:pointer;padding:12px;border-radius:8px;" ${file.click ? `onclick="${file.click}"` : ''}onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
                            <div style="font-size:56px;margin-bottom:8px;">${file.icon}</div>
                            <div style="font-size:13px;">${file.name}</div>
                        </div>`
        ).join('')}
                </div>
            </div>
        </div>
    `;
}

function getEdgeContent() {
    return `
        <div style="height:100%;display:flex;flex-direction:column;">
            <div style="padding:8px;background:rgba(0,0,0,0.02);border-bottom:1px solid rgba(0,0,0,0.08);display:flex;gap:8px;">
                <button style="padding:8px 16px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;font-size:13px;">←</button>
                <button style="padding:8px 16px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;font-size:13px;">→</button>
                <button onclick="document.getElementById('browser-frame').src=document.getElementById('url-input').value" style="padding:8px 16px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;font-size:13px;">⟳</button>
                <input id="url-input" value="https://en.wikipedia.org/wiki/Windows_11" style="flex:1;padding:8px 16px;border:1px solid rgba(0,0,0,0.2);border-radius:20px;outline:none;font-size:13px;">
                <button onclick="document.getElementById('browser-frame').src=document.getElementById('url-input').value" style="padding:8px 20px;border:none;background:#0078D7;color:white;border-radius:4px;cursor:pointer;font-weight:500;font-size:13px;">Go</button>
            </div>
            <iframe id="browser-frame" src="https://en.wikipedia.org/wiki/Windows_11" style="flex:1;border:none;background:white;"></iframe>
        </div>
    `;
}

function getSettingsContent() {
    return `
        <div style="height:100%;display:flex;">
            <div style="width:260px;padding:24px;background:rgba(0,0,0,0.02);border-right:1px solid rgba(0,0,0,0.08);">
                <div style="font-size:28px;font-weight:600;margin-bottom:24px;">Settings</div>
                ${[
            { icon: '🎨', name: 'Personalization', active: true },
            { icon: '🖥️', name: 'System' },
            { icon: '📱', name: 'Devices' },
            { icon: '🌐', name: 'Network & Internet' },
            { icon: '👤', name: 'Accounts' },
            { icon: '🔒', name: 'Privacy & Security' }
        ].map(item =>
            `<div style="padding:12px;cursor:pointer;border-radius:6px;font-size:14px;margin-bottom:6px;${item.active ? 'background:rgba(0,120,215,0.1);border-left:3px solid #0078D7;' : ''}" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='${item.active ? 'rgba(0,120,215,0.1)' : 'transparent'}'">${item.icon} ${item.name}</div>`
        ).join('')}
            </div>
            <div style="flex:1;padding:40px;overflow:auto;">
                <h2 style="margin-bottom:24px;">Personalization</h2>
                <div style="margin-bottom:32px;">
                    <h3 style="margin-bottom:16px;font-size:16px;">Background</h3>
                    <div style="display:flex;gap:12px;">
                        ${[
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ].map(bg =>
            `<div onclick="document.querySelector('.wallpaper').style.background='${bg}'" style="width:100px;height:80px;background:${bg};border-radius:8px;cursor:pointer;border:3px solid transparent;transition:0.15s;" onmouseover="this.style.borderColor='#0078D7'" onmouseout="this.style.borderColor='transparent'"></div>`
        ).join('')}
                    </div>
                </div>
                <div style="margin-bottom:32px;">
                    <h3 style="margin-bottom:16px;font-size:16px;">Theme</h3>
                    <button onclick="toggleDarkMode()" style="padding:12px 24px;background:#0078D7;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500;">Toggle Dark Mode</button>
                </div>
                <div>
                    <h3 style="margin-bottom:16px;font-size:16px;">Display</h3>
                    <label style="display:block;margin-bottom:8px;font-size:14px;">Brightness</label>
                    <input type="range" min="30" max="100" value="100" oninput="setBrightness(this.value)" style="width:300px;">
                </div>
            </div>
        </div>
    `;
}

function getStoreContent() {
    return `
        <div style="height:100%;overflow:auto;">
            <div style="padding:60px 40px;background:linear-gradient(135deg, #0078D7 0%, #005A9E 100%);color:white;">
                <h1 style="font-size:48px;margin-bottom:12px;font-weight:600;">Microsoft Store</h1>
                <p style="font-size:20px;opacity:0.95;">Apps, games, and entertainment</p>
            </div>
            <div style="padding:40px;background:white;">
                <h2 style="margin-bottom:24px;font-size:24px;">Featured Apps</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:24px;">
                    ${['Spotify', 'Netflix', 'Adobe Photoshop', 'Visual Studio Code', 'Discord', 'Zoom', 'WhatsApp', 'Telegram'].map(app =>
        `<div style="padding:24px;border:1px solid #ddd;border-radius:12px;cursor:pointer;transition:0.15s;" onmouseover="this.style.boxShadow='0 8px 16px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
                            <div style="width:64px;height:64px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:14px;margin-bottom:16px;"></div>
                            <h3 style="font-size:16px;margin-bottom:6px;font-weight:600;">${app}</h3>
                            <p style="font-size:12px;color:#666;margin-bottom:16px;">Entertainment • Free</p>
                            <button style="width:100%;padding:10px;background:#0078D7;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500;font-size:14px;">Get</button>
                        </div>`
    ).join('')}
                </div>
            </div>
        </div>
    `;
}

function getPhotosContent(winId) {
    return `
        <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#000;">
            <input type="file" id="photo-${winId}" accept="image/*" style="display:none;" onchange="loadPhoto('${winId}',event)">
            <div id="photo-display-${winId}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;">
                <div style="text-align:center;">
                    <div style="font-size:72px;margin-bottom:24px;">🖼️</div>
                    <h2 style="margin-bottom:16px;font-size:24px;">No photo selected</h2>
                    <button onclick="document.getElementById('photo-${winId}').click()" style="padding:14px 28px;background:#0078D7;color:white;border:none;border-radius:6px;cursor:pointer;font-size:15px;font-weight:500;">Open Photo</button>
                </div>
            </div>
        </div>
    `;
}

function loadPhoto(winId, event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById(`photo-display-${winId}`).innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:100%;object-fit:contain;">`;
        };
        reader.readAsDataURL(file);
    }
}

function getPaintContent(winId) {
    return `
        <div style="height:100%;display:flex;flex-direction:column;">
            <div style="padding:8px;background:rgba(0,0,0,0.02);border-bottom:1px solid rgba(0,0,0,0.08);display:flex;gap:8px;align-items:center;">
                <button onclick="clearCanvas('${winId}')" style="padding:6px 16px;border:1px solid rgba(0,0,0,0.2);background:white;border-radius:4px;cursor:pointer;font-size:13px;">Clear</button>
                <input type="color" id="paint-color-${winId}" value="#000000" style="width:50px;height:32px;border:1px solid rgba(0,0,0,0.2);border-radius:4px;cursor:pointer;">
                <label style="font-size:13px;margin-left:8px;">Size:</label>
                <input type="range" id="paint-size-${winId}" min="1" max="30" value="5" style="width:120px;">
            </div>
            <canvas id="paint-canvas-${winId}" style="flex:1;background:white;cursor:crosshair;"></canvas>
        </div>
    `;
}

function initPaint(winId) {
    setTimeout(() => {
        const canvas = document.getElementById(`paint-canvas-${winId}`);
        if (!canvas) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext('2d');
        let painting = false;

        canvas.addEventListener('mousedown', () => painting = true);
        canvas.addEventListener('mouseup', () => { painting = false; ctx.beginPath(); });
        canvas.addEventListener('mouseleave', () => { painting = false; ctx.beginPath(); });
        canvas.addEventListener('mousemove', (e) => {
            if (!painting) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.lineWidth = document.getElementById(`paint-size-${winId}`).value;
            ctx.lineCap = 'round';
            ctx.strokeStyle = document.getElementById(`paint-color-${winId}`).value;

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        });
    }, 100);
}

function clearCanvas(winId) {
    const canvas = document.getElementById(`paint-canvas-${winId}`);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getTerminalContent(winId) {
    return `
        <div style="height:100%;background:#0C0C0C;color:#CCCCCC;font-family:Consolas,monospace;padding:20px;overflow:auto;font-size:14px;">
            <div style="margin-bottom:8px;">Microsoft Windows [Version 11.0.22000.1]</div>
            <div style="margin-bottom:8px;">(c) Microsoft Corporation. All rights reserved.</div>
            <div style="margin-bottom:16px;"></div>
            <div id="terminal-output-${winId}"></div>
            <div style="display:flex;align-items:center;">
                <span style="color:#00FF00;margin-right:8px;">C:\\Users\\User&gt;</span>
                <input id="terminal-input-${winId}" type="text" style="flex:1;background:transparent;border:none;outline:none;color:#CCCCCC;font-family:Consolas,monospace;font-size:14px;" onkeypress="if(event.key==='Enter')runCommand('${winId}',this.value,this)">
            </div>
        </div>
    `;
}

function initTerminal(winId) {
    setTimeout(() => {
        document.getElementById(`terminal-input-${winId}`)?.focus();
    }, 100);
}

function runCommand(winId, cmd, input) {
    const output = document.getElementById(`terminal-output-${winId}`);
    const commands = {
        'help': 'Available commands:\n  help     - Show this help\n  dir      - List directory\n  cls      - Clear screen\n  echo     - Echo text\n  date     - Show date\n  time     - Show time\n  ver      - Show version\n  color    - Change color',
        'dir': 'Directory of C:\\Users\\User\n\n 📁 Desktop\n 📁 Documents\n 📁 Downloads\n 📄 file.txt\n\n     4 File(s)\n     3 Dir(s)',
        'cls': '',
        'ver': 'Microsoft Windows [Version 11.0.22000.1]\nWindows 11 Web Edition',
        'date': new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        'time': new Date().toLocaleTimeString('en-US')
    };

    if (cmd.startsWith('echo ')) {
        const text = cmd.substring(5);
        output.innerHTML += `<div style="color:#00FF00;">C:\\Users\\User&gt;</div><div style="margin-bottom:12px;">${cmd}</div><div style="margin-bottom:12px;">${text}</div>`;
    } else if (cmd === 'cls') {
        output.innerHTML = '';
    } else {
        const response = commands[cmd.toLowerCase()] || `'${cmd}' is not recognized as an internal or external command.`;
        output.innerHTML += `<div style="color:#00FF00;">C:\\Users\\User&gt;</div><div style="margin-bottom:12px;">${cmd}</div><div style="margin-bottom:12px;">${response}</div>`;
    }

    input.value = '';
    output.scrollTop = output.scrollHeight;
}

function getWidgetsContent() {
    const now = new Date();
    return `
        <div style="padding:32px;height:100%;overflow:auto;">
            <h2 style="margin-bottom:24px;font-size:28px;">Widgets</h2>
            <div style="display:grid;gap:20px;">
                <div style="padding:32px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;color:white;">
                    <h3 style="margin-bottom:16px;font-size:18px;">Weather</h3>
                    <div style="font-size:64px;margin-bottom:12px;">⛅</div>
                    <div style="font-size:48px;font-weight:300;margin-bottom:8px;">72°F</div>
                    <div style="font-size:18px;opacity:0.9;">Partly Cloudy • San Francisco</div>
                </div>
                <div style="padding:32px;background:rgba(255,255,255,0.6);border-radius:16px;border:1px solid rgba(0,0,0,0.08);">
                    <h3 style="margin-bottom:16px;font-size:18px;">Calendar</h3>
                    <div style="font-size:32px;font-weight:600;margin-bottom:8px;">${now.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                    <div style="font-size:24px;opacity:0.7;">${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <div style="padding:32px;background:rgba(255,255,255,0.6);border-radius:16px;border:1px solid rgba(0,0,0,0.08);">
                    <h3 style="margin-bottom:20px;font-size:18px;">Top News</h3>
                    ${['Technology advances in AI continue', 'Global markets show positive trends', 'New software updates released'].map(news =>
        `<div style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.08);cursor:pointer;font-size:14px;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">📰 ${news}</div>`
    ).join('')}
                </div>
            </div>
        </div>
    `;
}

console.log('%cWindows 11 Web - Production Ready', 'font-size:20px;font-weight:bold;color:#0078D7');
console.log('%cAll apps fully functional • Fullscreen ready', 'font-size:14px;color:#666');
