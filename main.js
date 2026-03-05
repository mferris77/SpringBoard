const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let pyProc = null;

function startPython() {
  const script = path.join(__dirname, 'python', 'main.py');
  // Spawn Python process
  pyProc = spawn('python', [script], { stdio: 'inherit' });
  pyProc.on('error', (err) => console.error('Python process error:', err));
}

function stopPython() {
  if (pyProc) {
    pyProc.kill();
    pyProc = null;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join('app', 'index.html'));
}

app.whenReady().then(() => {
  startPython();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  stopPython();
});

process.on('exit', () => stopPython());
