const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
    win = new BrowserWindow({ with: 800, heigth: 600 });
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'dist/maysenger/index.html'),
        protocol: 'file',
        slashes: true
    }));
    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-close', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});