// Wait for the DOM to fully load before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
    const summarizeButton = document.getElementById("summarizeButton");
    const loadingElement = document.getElementById("loading");
    const summaryElement = document.getElementById("summary");

    // Initially hide the summary element
    summaryElement.style.display = "none";

    // Add click event listener to the summarize button
    summarizeButton.addEventListener("click", async () => {
        // Clear previous summary, hide it, and show loading indicator
        summaryElement.textContent = "";
        summaryElement.style.display = "none";
        loadingElement.style.display = "block";

        try {
            // Get the current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const videoUrl = tab.url;

            // Validate if the current tab is a YouTube video page
            if (!isValidYouTubeUrl(videoUrl)) {
                summaryElement.textContent = "Please open a YouTube video.";
                summaryElement.style.display = "block";
                return;
            }

            // Request summary from the API
            const summary = await fetchVideoSummary(videoUrl);
            summaryElement.textContent = summary;
            summaryElement.style.display = "block";
        } catch (error) {
            console.error("Error summarizing the video:", error);
            summaryElement.textContent = "Error: Could not summarize the video.";
            summaryElement.style.display = "block";
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
        // Public example endpoint for demonstration purposes
        const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch summary from the API");
        }

        const data = await response.json();
        return data.body;
    }
});
