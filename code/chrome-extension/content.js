console.log("YouTube content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTranscript") {
        const getTranscript = () => {
            const transcriptElements = document.querySelectorAll('.cue-group-start-offset, .cue'); // Updated selector
            let transcriptText = "";
            transcriptElements.forEach(cue => {
                transcriptText += cue.innerText + " ";
            });
            return transcriptText;
        };

        const waitForTranscript = (attempts) => {
            if (attempts <= 0) {
                sendResponse({ transcript: null });
                return;
            }

            const transcript = getTranscript();
            if (transcript) {
                sendResponse({ transcript });
            } else {
                setTimeout(() => waitForTranscript(attempts - 1), 1000);
            }
        };

        waitForTranscript(10); // Wait for up to 10 seconds
    }
});
