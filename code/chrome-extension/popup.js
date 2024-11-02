document.addEventListener("DOMContentLoaded", function () {
    const summarizeButton = document.getElementById("summarizeButton");

    summarizeButton.addEventListener("click", async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    function: getTranscriptAndSummarize
                },
                (results) => {
                    if (results && results[0] && results[0].result) {
                        document.getElementById("summary").textContent = results[0].result;
                    }
                }
            );
        } catch (error) {
            document.getElementById("summary").textContent = "Error: Could not summarize the video.";
            console.error(error);
        }
    });
});

function getTranscriptAndSummarize() {
    const transcriptButton = document.querySelector('button.ytp-subtitles-button');

    if (!transcriptButton) {
        return "Transcript not available for this video.";
    }

    transcriptButton.click();

    return new Promise((resolve) => {
        setTimeout(() => {
            const transcriptElements = document.querySelectorAll('.ytd-transcript-renderer');
            let transcriptText = '';
            transcriptElements.forEach(element => {
                transcriptText += element.innerText + ' ';
            });

            if (!transcriptText) {
                resolve("Transcript could not be extracted.");
                return;
            }

            const sentences = transcriptText.match(/[^\.!\?]+[\.!\?]+/g);
            const summary = sentences ? sentences.slice(0, 3).join(" ") : transcriptText;
            resolve(summary);
        }, 3000);
    });
}
