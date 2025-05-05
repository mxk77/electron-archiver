const { ipcRenderer } = require('electron');

const selectFilesBtn = document.getElementById('select-files');
const selectDirsBtn  = document.getElementById('select-dirs');
const selectDestBtn  = document.getElementById('select-dest');
const fileListEl     = document.getElementById('file-list');
const archiveNameEl  = document.getElementById('archive-name');
const createBtn      = document.getElementById('create-archive');
const messageEl      = document.getElementById('message');

let selectedItems = [];
let destFolder    = null;

// Вибір файлів
selectFilesBtn.addEventListener('click', async () => {
   const items = await ipcRenderer.invoke('open-file-dialog');
    if (items.length) {
        selectedItems = items;
        fileListEl.innerHTML = items.map(i => `<li>${i}</li>`).join('');
    }
});

// Вибір директорій
selectDirsBtn.addEventListener('click', async () => {
  const dirs = await ipcRenderer.invoke('open-dir-dialog');
  if (dirs.length) {
    selectedItems.push(...dirs);
    fileListEl.innerHTML = selectedItems.map(i => `<li>${i}</li>`).join('');
  }
});

// Вибір папки/шляху збереження
selectDestBtn.addEventListener('click', async () => {
  const folder = await ipcRenderer.invoke('open-dest-dialog');
  if (folder) {
    destFolder = folder;
    // якщо користувач ще не вказав назву – задаємо дефолт
    archiveNameEl.value = archiveNameEl.value.trim() || 'archive';
    messageEl.textContent = `Папка для архіву: ${folder}`;
  }
});

// Створення архіву
createBtn.addEventListener('click', async () => {
  messageEl.textContent = '';
  if (!selectedItems.length) return messageEl.textContent = 'Оберіть файли/папки для архівації.';
  if (!destFolder)          return messageEl.textContent = 'Виберіть папку для збереження архіву.';

  const name = (archiveNameEl.value.trim() || 'archive') + '.zip';
  const outputPath = require('path').join(destFolder, name);

  createBtn.disabled = true;
  messageEl.textContent = 'Архівація…';
  try {
    const result = await ipcRenderer.invoke('create-archive', {
      files: selectedItems,
      output: outputPath
    });
    messageEl.textContent = result.success
      ? `Готово! Архів збережено:\n${outputPath}`
      : `Помилка: ${result.error}`;
  } catch (e) {
    messageEl.textContent = `Помилка: ${e.error || e}`;
  } finally {
    createBtn.disabled = false;
  }
});