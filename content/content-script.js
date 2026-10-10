if (!window.__bindMyTabsInjected) {
  window.__bindMyTabsInjected = true;

  let historyNavEnabled = true;

  chrome.storage.local.get({ historyNavEnabled: true }, (data) => {
    historyNavEnabled = data.historyNavEnabled !== false;
  });

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.historyNavEnabled) {
    historyNavEnabled = changes.historyNavEnabled.newValue !== false;
  }
});

const isEditable = (target) => {
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tagName = target.tagName ? target.tagName.toUpperCase() : '';
  if (tagName === 'INPUT' || tagName === 'TEXTAREA') return true;
  if (target.getAttribute && target.getAttribute('role') === 'textbox') return true;
  return false;
};

window.addEventListener('keydown', (e) => {
  const isCtrl = (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey;
  const isAlt = e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey;
  if (!isCtrl && !isAlt) return;

  const code = e.code;
  const key = e.key ? e.key.toLowerCase() : '';

  const isL = code === 'KeyL' || key === 'l' || key === 'д';
  const isO = code === 'KeyO' || key === 'o' || key === 'щ';
  const isZ = code === 'KeyZ' || key === 'z' || key === 'я';
  const isX = code === 'KeyX' || key === 'x' || key === 'ч';

  if ((isAlt || isCtrl) && isL) {
    // next-tab
    e.preventDefault();
    e.stopImmediatePropagation();
    chrome.runtime.sendMessage({ action: 'next-tab' });
  } else if ((isAlt || isCtrl) && isO) {
    // prev-tab
    e.preventDefault();
    e.stopImmediatePropagation();
    chrome.runtime.sendMessage({ action: 'prev-tab' });
  } else if (isCtrl && isZ) {
    // history-back
    if (historyNavEnabled && !isEditable(e.target)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      chrome.runtime.sendMessage({ action: 'history-back' });
    }
  } else if (isCtrl && isX) {
    // history-forward
    if (historyNavEnabled && !isEditable(e.target)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      chrome.runtime.sendMessage({ action: 'history-forward' });
    }
  }
}, true);
}
