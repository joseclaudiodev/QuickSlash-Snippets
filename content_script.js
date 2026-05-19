let activeSnippets = [];
let keyBuffer = "";
let timeoutId = null;

async function loadSnippets() {
  if (typeof StorageManager !== 'undefined') {
    const currentUrl = window.location.href;
    activeSnippets = await StorageManager.getActiveSnippetsForUrl(currentUrl);
  } else activeSnippets = [];
}

function simulateKeyCombo(element, key, ctrlOrCmd = true) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  const eventConfig = {
    key: key,
    code: key === 'Backspace' ? 'Backspace' : `Key${key.toUpperCase()}`,
    bubbles: true,
    cancelable: true,
    view: window,
    ctrlKey: !isMac && ctrlOrCmd,
    metaKey: isMac && ctrlOrCmd
  };

  element.dispatchEvent(new KeyboardEvent('keydown', eventConfig));
  element.dispatchEvent(new KeyboardEvent('keyup', eventConfig));
}

/**
 * @param {HTMLElement} el
 * @param {string} text
 * @param {number} commandLength
 */
async function injectText(el, text, commandLength) {
  const isNative = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
  
  if (isNative) {
    el.focus();
    const currentPos = el.selectionStart;
    el.setSelectionRange(Math.max(0, currentPos - commandLength), currentPos);
    document.execCommand('insertText', false, text);
  } else {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const textNode = selection.focusNode;

    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      try {
        const currentOffset = selection.focusOffset;
        const startOffset = Math.max(0, currentOffset - commandLength);

        range.setStart(textNode, startOffset);
        range.setEnd(textNode, currentOffset);
        
        selection.removeAllRanges();
        selection.addRange(range);

        setTimeout(() => {
          const clipboardData = new DataTransfer();
          clipboardData.setData('text/plain', text);

          const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData
          });
          
          if (textNode && textNode.parentNode) {
            textNode.parentNode.dispatchEvent(pasteEvent);
          }
        }, 80);

      } catch (err) {
        selection.removeAllRanges();
      }
    } else {
      const targetElement = el.children[0] || el;
      targetElement.textContent = text;
    }
  }
}

window.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  if (!active) return;
  if (!e || !e.key) return;

  if (e.key.length > 1) {
    if (e.key === 'Backspace') keyBuffer = "";
    return;
  }

  if (e.key === '/') keyBuffer = '/';
  else if (keyBuffer.length > 0) keyBuffer += e.key;

  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {keyBuffer = "";}, 3000);

  const match = keyBuffer.match(/\/(\w{2,})$/);
  if (match) {
    const typedCommand = match[1];
    const snippet = activeSnippets.find(s => s.command === typedCommand);

    if (snippet && snippet.enabled) {   
      const totalCommandLength = typedCommand.length + 1;
      keyBuffer = "";

      clearTimeout(timeoutId);

      setTimeout(() => {
        injectText(active, snippet.content, totalCommandLength);
      }, 10);

      return;
    }
  }
}, true);

window.addEventListener('blur', () => {
  if (keyBuffer !== "") keyBuffer = "";
}, true);

if (typeof chrome !== 'undefined' && chrome.storage) chrome.storage.onChanged.addListener(() => loadSnippets());
loadSnippets();
