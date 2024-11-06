from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import os
import logging
from typing import Optional, List, Dict
import subprocess

# Initialize logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class TranscriptSummarizerApp:
    def __init__(self):
        # Load environment variables
        self.app = Flask(__name__)
        CORS(self.app)  # Enable CORS for all domains

        # Register routes
        self._register_routes()

    def _register_routes(self):
        """Register all application routes."""
        self.app.route('/')(self.home)
        self.app.route('/summarize', methods=['POST'])(self.summarize)

    def home(self):
        """Home route handler."""
        return jsonify({"message": "YouTube Transcript Summarizer API is running!"})

    def summarize(self):
        """Handle video summarization requests."""
        logger.debug("Summarize route accessed")

        if not request.is_json:
            return jsonify({"error": "JSON data required"}), 400

        data = request.get_json()
        video_id = data.get("video_id")

        if not video_id:
            return jsonify({"error": "Video ID is required"}), 400

        # Extract video ID from full URL if necessary
        if '=' in video_id:
            video_id = video_id.split("=")[1]

        try:
            transcript = self._get_transcript(video_id)
            if not transcript:
                return jsonify({"error": "Failed to retrieve transcript"}), 404

            summary = self._get_summary(transcript)
            if not summary:
                return jsonify({"error": "Failed to generate summary"}), 500

            return jsonify({"summary": summary})

        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500

    def _get_transcript(self, video_id: str) -> Optional[List[Dict]]:
        """Retrieve transcript for a YouTube video."""
        logger.debug(f"Getting transcript for video ID: {video_id}")
        try:
            return YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
        except Exception as e:
            logger.error(f"Failed to get transcript: {str(e)}")
            return None

    def _get_summary(self, transcript: List[Dict]) -> Optional[str]:
        """Generate summary of transcript using Ollama."""
        try:
            prompt = self._generate_prompt(transcript)
            logger.debug(f"Generated prompt for Ollama: {prompt}")

            # Sanitize the prompt to remove problematic characters
            sanitized_prompt = self._sanitize_prompt(prompt)

            # Run the Ollama command
            result = subprocess.run(
                ["ollama", "run", "qwen2.5:3b"],
                input=sanitized_prompt,
                text=True,
                capture_output=True,
                encoding='utf-8'  # Ensure the output is handled as UTF-8
            )

            if result.returncode != 0:
                logger.error(f"Ollama command failed: {result.stderr}")
                return None
            logger.info(f'success: {result}')
            return result.stdout.strip()
        except Exception as e:
            logger.error(f"Failed to generate summary: {str(e)}")
            return None

    def _sanitize_prompt(self, prompt: str) -> str:
        """Remove or convert problematic characters from the prompt."""
        # Replace non-printable characters with a space or remove them
        sanitized = ''.join(char if char.isprintable() else ' ' for char in prompt)
        # Encode and decode to handle special characters
        return sanitized.encode('utf-8', 'replace').decode('utf-8')

    @staticmethod
    def _generate_prompt(transcript: List[Dict]) -> str:
        """Generate prompt for Ollama from transcript."""
        prompt = (
            "Please generate a concise summary for the following video transcript. "
            "Provide only the summary, with no introductory or concluding remarks:"
        )
        transcript_text = "\n".join(entry['text'] for entry in transcript)
        return f"{prompt}\n{transcript_text}"


def create_app():
    """Create and configure the application."""
    summarizer = TranscriptSummarizerApp()
    return summarizer.app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
