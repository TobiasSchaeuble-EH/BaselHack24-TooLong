from typing import Final

# Messages
MSG_START: Final = "Hi! I can sum up videos. Just send me a link!"
MSG_NOT_VALID_LINK: Final = "Ehh😅, could you please send a valid YouTube Link?"
MSG_MULTIPLE_LINKS: Final = "Ehh😅, you sent multiple links, I will sum up only the first one."
MSG_PLEASE_WAIT: Final = "Ready to sum, please wait a moment..."
MSG_SUMMARY_READY: Final = "Here is the summary:"
#ToDo: hardcoded list of commands, change this
MSG_UNKNOWN_CMD: Final = "Sorry, I didn't understand that command. Please use /summarize or /find"

# Inline options
INLINE_SUMMARIZE: Final = "Summarize!"