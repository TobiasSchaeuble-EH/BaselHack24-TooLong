document.addEventListener("DOMContentLoaded", () => {
    const summarizeButton = document.getElementById("summarizeButton");
    const loadingElement = document.getElementById("loading");
    const summaryElement = document.getElementById("summary");
    const icon1 = document.getElementById("icon1");

    summaryElement.style.display = "none";

    summarizeButton.addEventListener("click", async () => {
        summaryElement.textContent = "";
        summaryElement.style.display = "none";
        loadingElement.style.display = "block";

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const videoUrl = tab.url;

            if (!isValidYouTubeUrl(videoUrl)) {
                summaryElement.textContent = "Please open a YouTube video.";
                summaryElement.style.display = "block";
                return;
            }

            const summary = await fetchVideoSummary(videoUrl);
            summaryElement.textContent = summary;
            summaryElement.style.display = "block";
        } catch (error) {
            console.error("Error summarizing the video:", error);
            summaryElement.textContent = "Error: Could not summarize the video.";
            summaryElement.style.display = "block";
        } finally {
            loadingElement.style.display = "none";
        }
    });

    icon1.addEventListener("click", async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const videoUrl = tab.url;

            if (!isValidYouTubeUrl(videoUrl)) {
                alert("Please open a YouTube video.");
                return;
            }

            chrome.runtime.sendMessage({ action: "getTranscript" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    alert("Could not retrieve transcript. Please try again.");
                    return;
                }

                if (!response || !response.transcript) {
                    alert("Could not retrieve transcript. Please try again.");
                    return;
                }

                const transcript = response.transcript;
                const chatGptUrl = "https://chat.openai.com/chat";
                const prompt = `Summarize the following YouTube video transcript:\n\n${transcript}`;

                chrome.tabs.create({ url: chatGptUrl }, (newTab) => {
                    chrome.scripting.executeScript({
                        target: { tabId: newTab.id },
                        func: (prompt) => {
                            const interval = setInterval(() => {
                                const textarea = document.querySelector("textarea");
                                if (textarea) {
                                    textarea.value = prompt;
                                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                                    clearInterval(interval);
                                }
                            }, 100);
                        },
                        args: [prompt]
                    });
                });
            });
        } catch (error) {
            console.error("Error processing the video:", error);
        }
    });

    function isValidYouTubeUrl(url) {
        return url.includes("youtube.com/watch");
    }

    async function fetchVideoSummary(videoUrl) {
        const response = await fetch("https://baselhack-backend-c16cb02c396d.herokuapp.com/dummy_summarize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ video_id: videoUrl })
        });

        if (!response.ok) {
            throw new Error("Failed to fetch summary from the API");
        }

        const data = await response.json();
        return data.summary;
    }
});
