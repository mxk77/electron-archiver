const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
require('electron-reload')(__dirname); // авто-перезавантаження

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 320,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// — Відкриття діалогу для вибору файлів
ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Оберіть файли для архівації',
    properties: ['openFile', 'multiSelections']
  });
  return canceled ? [] : filePaths;
});

// — Відкриття діалогу для вибору директорій
ipcMain.handle('open-dir-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Оберіть директорії для архівації',
    properties: ['openDirectory', 'multiSelections']
  });
  return canceled ? [] : filePaths;
});


// — Відкриття діалогу для вибору папки призначення
ipcMain.handle('open-dest-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return canceled ? null : filePaths[0];
});

// Створення архіву
ipcMain.handle('create-archive', async (_, { files, output }) => {
  return new Promise((resolve, reject) => {
    const outputStream = fs.createWriteStream(output);
    const archive = archiver('zip', { zlib: { level: 9 } });

    outputStream.on('close', () => resolve({ success: true }));
    archive.on('error', err => reject({ success: false, error: err.message }));

    archive.pipe(outputStream);
    files.forEach(file => archive.file(file, { name: path.basename(file) }));
    archive.finalize();
  });
});
