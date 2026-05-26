let activeSnippets = [];
let keyBuffer = "";
let timeoutId = null;

async function loadSnippets() {
	if (typeof StorageManager !== 'undefined') {
		const currentUrl = window.location.href;
		activeSnippets = await StorageManager.getActiveSnippetsForUrl(currentUrl);
	}
	else activeSnippets = [];
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

function injectIntoNative(el, text, commandLength) {
	el.focus();
	const currentPos = el.selectionStart;
	el.setSelectionRange(Math.max(0, currentPos - commandLength), currentPos);
	document.execCommand('insertText', false, text);
}

function executeDOMFallback(el, text, commandLength) {
	try {
		const fallbackSelection = window.getSelection();
		if (fallbackSelection && fallbackSelection.rangeCount > 0) {
			const fallbackRange = fallbackSelection.getRangeAt(0);

			fallbackRange.collapse(false);

			let fTextNode = fallbackRange.startContainer;
			if (fTextNode.nodeType !== Node.TEXT_NODE) {
				const emptyNode = document.createTextNode("");
				fallbackRange.insertNode(emptyNode);
				fTextNode = emptyNode;
			}

			const fCurrentOffset = fallbackRange.startOffset;
			const startPos = Math.max(0, fCurrentOffset - commandLength);

			fallbackRange.setStart(fTextNode, startPos);
			fallbackRange.setEnd(fTextNode, fCurrentOffset);
			fallbackRange.deleteContents();

			const newNode = document.createTextNode(text);
			fallbackRange.insertNode(newNode);

			fallbackRange.setStartAfter(newNode);
			fallbackRange.collapse(true);
			fallbackSelection.removeAllRanges();
			fallbackSelection.addRange(fallbackRange);

			el.dispatchEvent(new InputEvent('input', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: text
			}));

			el.dispatchEvent(new Event('change', {
				bubbles: true
			}));
		}
	}
	catch (fallbackErr) {
		const errSel = window.getSelection();
		if (errSel) errSel.removeAllRanges();
	}
}

function injectIntoContentEditable(el, text, commandLength) {
	return new Promise((resolve) => {
		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return resolve();
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

					if (!el.textContent.includes(text)) executeDOMFallback(el, text, commandLength);
					resolve();
				}, 80);

			}
			catch (err) {
				selection.removeAllRanges();
				resolve();
			}
		}
		else {
			const targetElement = el.children[0] || el;
			targetElement.textContent = text;
			resolve();
		}
	});
}

async function injectText(el, text, commandLength) {
	const isNative = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';

	if (isNative) injectIntoNative(el, text, commandLength);
	else await injectIntoContentEditable(el, text, commandLength);
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
	timeoutId = setTimeout(() => {
		keyBuffer = "";
	}, 3000);

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