chrome.runtime.onInstalled.addListener(() => {
    console.log("Background script installed");
});

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTranscript") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getTranscript" }, (response) => {
                sendResponse(response);
            });
        });
        return true; // Keep the message channel open for sendResponse
    }
});
