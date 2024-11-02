from youtube_transcript_api import YouTubeTranscriptApi
import openai

def get_summary(video_id: str):

    if '=' in video_id:
        video_id = video_id.split("=")[1]   

    transpcript = get_video_transcript_with_fallback(video_id)
    result = get_transcript_summary_gpt4_turbo(transcript)
    return result


def get_video_transcript_with_fallback(video_id: str):
    # trys to generate transcript. First it will check if there is a transcript given, 
    # if not given it will try to get the englisch auto generated one
    transcript = get_video_transcript(video_id)
    if not transcript:
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
            return transcript
        except Exception as e:
            print(f"Exceptin: {e}")
            return None
    else:
        return transcript

def get_video_transcript(video_id: str):
    
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return transcript
    except Exception as e:
        print(f"Exceptin: {e}")
        return None

def get_transcript_summary_gpt4_turbo(transcript):
    openai.api_key = "API_KEY"

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "user", "content": generate_prompt(transcript)}
            ]
        )
        answer = response['choices'][0]['message']['content']
        return answer
    except Exception as e:
        print(f"Fehler bei der API-Anfrage: {e}")
        return None

def generate_prompt(transcript):
    prompt : str = "Please generate a concise summary for the following video transcript. Provide only the summary, with no introductory or concluding remarks:"
    for entry in transcript:
        prompt = prompt + "\n" + entry['text']

    return prompt
 

transcript = get_summary("https://www.youtube.com/watch?v=cSw61XmtsNo")
#for entry in transcript:
#            print(f"{entry['start']} - {entry['text']}")
        


