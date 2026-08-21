const elTabCount = document.getElementById('tab-count');
const elNext = document.getElementById('key-next');
const elPrev = document.getElementById('key-prev');
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
    });
  } catch (err) {}
};

btnCfg.addEventListener('click', () => {
  chrome.tabs.create({ url: 'brave://extensions/shortcuts' });
});

document.addEventListener('DOMContentLoaded', init);
