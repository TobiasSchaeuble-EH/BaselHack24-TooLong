from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from openai import OpenAI
from dotenv import load_dotenv
import os
from os import environ

load_dotenv()
 
app = Flask(__name__)
 
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)
 
@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Home route is working!"})
 
 
@app.route('/summarize', methods=['POST'])
def summarize():
    print("Summarize route was accessed")
 
    if not request.is_json:
        return jsonify({"error": "JSON data required"}), 400
 
    data = request.get_json()
    video_id = data.get("video_id")
 
    if not video_id:
        return jsonify({"error": "Video ID is required"}), 400
 
    summary = get_summary(video_id)
    if summary:
        return jsonify({"summary": summary})
    else:
        return jsonify({"error": "Failed to retrieve or summarize transcript"}), 500
 
def get_summary(video_id: str):
    if '=' in video_id:
        video_id = video_id.split("=")[1]
 
    transcript = get_video_transcript_with_fallback(video_id)
    if transcript:
        return get_transcript_summary_gpt4_turbo(transcript)
    else:
        return None
 
def get_video_transcript_with_fallback(video_id: str):
    transcript = get_video_transcript(video_id)
    if not transcript:
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
            return transcript
        except Exception as e:
            print(f"Exception in transcript retrieval: {e}")
            return None
    else:
        return transcript
 
def get_video_transcript(video_id: str):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return transcript
    except Exception as e:
        print(f"Exception: {e}")
        return None
 
def get_transcript_summary_gpt4_turbo(transcript):
    try:
        prompt = generate_prompt(transcript)
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        answer = response.choices[0].message.content
        return answer
    except Exception as e:
        print(f"Error in OpenAI API request: {e}")
        return None
 
def generate_prompt(transcript):
    prompt = "Please generate a concise summary for the following video transcript. Provide only the summary, with no introductory or concluding remarks:"
    for entry in transcript:
        prompt += "\n" + entry['text']
    return prompt
 
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(environ.get('PORT', 5000)))