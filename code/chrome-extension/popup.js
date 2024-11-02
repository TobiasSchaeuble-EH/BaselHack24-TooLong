// Wait for the DOM to fully load before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
    const summarizeButton = document.getElementById("summarizeButton");
    const loadingElement = document.getElementById("loading");
    const summaryElement = document.getElementById("summary");

    // Add click event listener to the summarize button
    summarizeButton.addEventListener("click", async () => {
        // Clear previous summary and show loading indicator
        summaryElement.textContent = "";
        loadingElement.style.display = "block";

        try {
            // Get the current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const videoUrl = tab.url;

            // Validate if the current tab is a YouTube video page
            if (!isValidYouTubeUrl(videoUrl)) {
                summaryElement.textContent = "Please open a YouTube video.";
                return;
            }

            // Request summary from the API
            const summary = await fetchVideoSummary(videoUrl);
            summaryElement.textContent = summary;
        } catch (error) {
            console.error("Error summarizing the video:", error);
            summaryElement.textContent = "Error: Could not summarize the video.";
        } finally {
            // Hide the loading indicator
            loadingElement.style.display = "none";
        }
    });

    // Function to validate YouTube video URL
    function isValidYouTubeUrl(url) {
        return url.includes("youtube.com/watch");
    }

    // Function to fetch video summary from the external API
    async function fetchVideoSummary(videoUrl) {
        // Dummy response for now
        return "This is a dummy summary. The actual summary will be provided once the API endpoint is implemented.";

        const payload = {
            link: videoUrl,
            type: "summarize"
        };

        const response = await fetch("https://api.example.com/summarize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Failed to fetch summary from the API");
        }

        const data = await response.json();
        return data.summary;
    }
});
