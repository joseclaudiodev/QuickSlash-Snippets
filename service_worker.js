async function openConfigPage() {
	const configUrl = chrome.runtime.getURL('config/config.html');
	const tabs = await chrome.tabs.query({ url: configUrl });

	if (tabs.length > 0) {
		chrome.tabs.update(tabs[0].id, { active: true });
		chrome.windows.update(tabs[0].windowId, { focused: true });
	}
	else chrome.tabs.create({ url: configUrl });
}

chrome.runtime.onInstalled.addListener((details) => { if (details.reason === 'install') openConfigPage(); });
chrome.action.onClicked.addListener(() => { openConfigPage(); });
chrome.commands.onCommand.addListener((command) => { if (command === 'open_config') openConfigPage(); });