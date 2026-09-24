const elTabCount = document.getElementById('tab-count');
const elNext = document.getElementById('key-next');
const elPrev = document.getElementById('key-prev');
const elHistBack = document.getElementById('key-history-back');
const elHistFwd = document.getElementById('key-history-forward');
const toggleHistory = document.getElementById('toggle-history');
const btnCfg = document.getElementById('btn-cfg');

const init = async () => {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    elTabCount.textContent = tabs.length;

    const commands = await chrome.commands.getAll();
    commands.forEach(cmd => {
      if (cmd.name === 'next-tab') {
        elNext.textContent = cmd.shortcut || '[not set]';
      }
      if (cmd.name === 'prev-tab') {
        elPrev.textContent = cmd.shortcut || '[not set]';
      }
      if (cmd.name === 'history-back') {
        elHistBack.textContent = cmd.shortcut || '[not set]';
      }
      if (cmd.name === 'history-forward') {
        elHistFwd.textContent = cmd.shortcut || '[not set]';
      }
    });

    const data = await chrome.storage.local.get({ historyNavEnabled: true });
    toggleHistory.checked = data.historyNavEnabled !== false;
  } catch (err) {}
};

toggleHistory.addEventListener('change', async () => {
  try {
    await chrome.storage.local.set({ historyNavEnabled: toggleHistory.checked });
  } catch (err) {}
});

btnCfg.addEventListener('click', () => {
  chrome.tabs.create({ url: 'brave://extensions/shortcuts' });
});

document.addEventListener('DOMContentLoaded', init);
