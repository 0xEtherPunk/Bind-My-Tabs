let lastSwitchTime = 0;
const switchTab = async (direction) => {
  const now = Date.now();
  if (now - lastSwitchTime < 100) return;
  lastSwitchTime = now;

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

let lastNavTime = 0;
const navigateHistory = async (direction, tabId) => {
  const now = Date.now();
  if (now - lastNavTime < 100) return;
  lastNavTime = now;

  try {
    const enabled = await isHistoryNavEnabled();
    if (!enabled) return;

    let targetTabId = tabId;
    if (!targetTabId) {
      const win = await chrome.windows.getLastFocused({ populate: false });
      if (!win) return;
      const tabs = await chrome.tabs.query({ windowId: win.id, active: true });
      if (!tabs || tabs.length === 0) return;
      targetTabId = tabs[0]?.id;
    }

    if (!targetTabId) return;

    if (direction < 0) {
      await chrome.tabs.goBack(targetTabId);
    } else {
      await chrome.tabs.goForward(targetTabId);
    }
  } catch (err) {}
};

chrome.commands.onCommand.addListener((cmd) => {
  if (cmd === 'next-tab') switchTab(1);
  if (cmd === 'prev-tab') switchTab(-1);
  if (cmd === 'history-back') navigateHistory(-1);
  if (cmd === 'history-forward') navigateHistory(1);
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.action === 'next-tab') switchTab(1);
  if (msg?.action === 'prev-tab') switchTab(-1);
  if (msg?.action === 'history-back') navigateHistory(-1, sender?.tab?.id);
  if (msg?.action === 'history-forward') navigateHistory(1, sender?.tab?.id);
});

const injectContentScripts = async () => {
  try {
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const tab of tabs) {
      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          files: ['content/content-script.js']
        }).catch(() => {});
      }
    }
  } catch (err) {}
};

chrome.runtime.onInstalled.addListener(() => {
  injectContentScripts();
});

