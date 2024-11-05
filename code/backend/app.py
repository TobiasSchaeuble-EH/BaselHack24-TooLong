from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
from openai import OpenAI
from dotenv import load_dotenv
import os
import logging
from typing import Optional, List, Dict
from anthropic import Anthropic

# Initialize logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class TranscriptSummarizerApp:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Initialize Flask app
        self.app = Flask(__name__)
        CORS(self.app)  # Enable CORS for all domains
        
        # Initialize OpenAI client
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
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
        """
        Retrieve transcript for a YouTube video.
        
        Args:
            video_id: YouTube video ID
            
        Returns:
            List of transcript segments or None if retrieval fails
        """
        logger.debug(f"Getting transcript for video ID: {video_id}")
        try:
            return YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
        except Exception as e:
            logger.error(f"Failed to get transcript: {str(e)}")
            return None

    def _get_summary(self, transcript: List[Dict]) -> Optional[str]:
        """
        Generate summary of transcript using GPT-4.
        If USE_CLAUDE is set to True in environment, it will use Claude instead.
        
        Args:
            transcript: List of transcript segments
            
        Returns:
            Generated summary or None if summarization fails
        """
        try:
            prompt = self._generate_prompt(transcript)
            
            # Uncomment and set USE_CLAUDE=true in .env to use Claude instead of GPT-4
            """
            if os.getenv("USE_CLAUDE") == "true":
                anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
                response = anthropic_client.messages.create(
                    max_tokens=1024,
                    messages=[{
                        "role": "user",
                        "content": prompt
                    }],
                    model="claude-3-haiku-20240307"
                )
                return response.content
            """
            
            # Default to OpenAI GPT-4
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Failed to generate summary: {str(e)}")
            return None

    @staticmethod
    def _generate_prompt(transcript: List[Dict]) -> str:
        """
        Generate prompt for GPT-4 from transcript.
        
        Args:
            transcript: List of transcript segments
            
        Returns:
            Formatted prompt string
        """
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
    