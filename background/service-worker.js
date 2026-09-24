const switchTab = async (direction) => {
  try {
    const win = await chrome.windows.getLastFocused({ populate: false });
    if (!win) return;
    const tabs = await chrome.tabs.query({ windowId: win.id });
    if (!tabs || tabs.length <= 1) return;

    tabs.sort((a, b) => a.index - b.index);
    const curr = tabs.findIndex(t => t.active);
    if (curr === -1) return;

    const next = direction > 0 
      ? (curr + 1) % tabs.length 
      : (curr - 1 + tabs.length) % tabs.length;

    if (tabs[next]) {
      await chrome.tabs.update(tabs[next].id, { active: true });
    }
  } catch (err) {}
};

const isHistoryNavEnabled = async () => {
  try {
    const data = await chrome.storage.local.get({ historyNavEnabled: true });
    return data.historyNavEnabled !== false;
  } catch (err) {
    return true;
  }
};

const navigateHistory = async (direction) => {
  try {
    const enabled = await isHistoryNavEnabled();
    if (!enabled) return;

    const win = await chrome.windows.getLastFocused({ populate: false });
    if (!win) return;
    const tabs = await chrome.tabs.query({ windowId: win.id, active: true });
    if (!tabs || tabs.length === 0) return;

    const activeTab = tabs[0];
    if (!activeTab || !activeTab.id) return;

    if (direction < 0) {
      await chrome.tabs.goBack(activeTab.id);
    } else {
      await chrome.tabs.goForward(activeTab.id);
    }
  } catch (err) {}
};

chrome.commands.onCommand.addListener((cmd) => {
  if (cmd === 'next-tab') switchTab(1);
  if (cmd === 'prev-tab') switchTab(-1);
  if (cmd === 'history-back') navigateHistory(-1);
  if (cmd === 'history-forward') navigateHistory(1);
});
