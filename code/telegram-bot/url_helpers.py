import re
from typing import List, Optional

# def is_valid_youtube_url(url: str) -> bool:
#     """
#     Validates if the given string is a valid YouTube URL.
    
#     Supports the following YouTube URL formats:
#     - Standard: https://www.youtube.com/watch?v=VIDEO_ID
#     - Shortened: https://youtu.be/VIDEO_ID
#     - Embedded: https://www.youtube.com/embed/VIDEO_ID
#     - With additional parameters: https://www.youtube.com/watch?v=VIDEO_ID&t=1s
    
#     Args:
#         url (str): The URL to validate
        
#     Returns:
#         bool: True if the URL is a valid YouTube URL, False otherwise
#     """
#     if not url or not isinstance(url, str):
#         return False
    
#     # Patterns for different YouTube URL formats
#     youtube_patterns = [
#         # Standard YouTube URL
#         r'^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}(&\S*)?$',
#         # Shortened youtu.be URL
#         r'^https?:\/\/youtu\.be\/[\w-]{11}(\?\S*)?$',
#         # Embedded YouTube URL
#         r'^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]{11}(\?\S*)?$'
#     ]
    
#     # Check if URL matches any of the patterns
#     return any(re.match(pattern, url) for pattern in youtube_patterns)


def extract_youtube_urls(text: str) -> List[str]:
    """
    Extracts all valid YouTube URLs from a given text string.
    
    Args:
        text (str): The input text that may contain YouTube URLs
        
    Returns:
        List[str]: A list of all valid YouTube URLs found in the text
    """
    if not text or not isinstance(text, str):
        return []
    
    # Pattern to match YouTube URLs
    youtube_pattern = r'https?:\/\/((?:www\.)?youtube\.com\/watch\?v=[\w-]{11}(?:&\S*)?|(?:www\.)?youtube\.com\/embed\/[\w-]{11}(?:\?\S*)?|youtu\.be\/[\w-]{11}(?:\?\S*)?)'
    
    # Find all matches
    urls = re.findall(youtube_pattern, text)
    
    # Reconstruct full URLs from matches
    full_urls = [f"https://{url}" if not url.startswith(('http://', 'https://')) else url 
                 for url in urls]
    
    return full_urls