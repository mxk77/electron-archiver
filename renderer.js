const { ipcRenderer } = require('electron');

const selectFilesBtn = document.getElementById('select-files');
const selectDestBtn  = document.getElementById('select-dest');
const fileListEl     = document.getElementById('file-list');
const archiveNameEl  = document.getElementById('archive-name');
const createBtn      = document.getElementById('create-archive');
const messageEl      = document.getElementById('message');

let selectedFiles = [];
let savePath = null;

// Вибір файлів
selectFilesBtn.addEventListener('click', async () => {
  const files = await ipcRenderer.invoke('open-file-dialog');
  if (files.length) {
    selectedFiles = files;
    fileListEl.innerHTML = files.map(f => `<li>${f}</li>`).join('');
  }
});

// Вибір папки/шляху збереження
selectDestBtn.addEventListener('click', async () => {
  const path = await ipcRenderer.invoke('save-archive-dialog');
  if (path) {
    savePath = path;
    archiveNameEl.value = path.replace(/.*[\\/]/, '').replace(/\.zip$/, '');
  }
});

// Створення архіву
createBtn.addEventListener('click', async () => {
  messageEl.textContent = '';
  if (!selectedFiles.length) return messageEl.textContent = 'Оберіть хоча б один файл.';
  if (!savePath)         return messageEl.textContent = 'Вкажіть шлях для збереження архіву.';
  const customName = archiveNameEl.value.trim();
  if (customName) {
    savePath = savePath.replace(/[^\\/]+\.zip$/, customName + '.zip');
  }
  createBtn.disabled = true;
  messageEl.textContent = 'Архівація…';
  try {
    const result = await ipcRenderer.invoke('create-archive', { files: selectedFiles, output: savePath });
    messageEl.textContent = result.success ? 'Готово! Архів створено.' : `Помилка: ${result.error}`;
  } catch (e) {
    messageEl.textContent = `Помилка: ${e.error || e}`;
  } finally {
    createBtn.disabled = false;
  }
});