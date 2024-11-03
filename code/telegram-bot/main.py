import os
from dotenv import load_dotenv
import logging
from uuid import uuid4
import requests

from telegram import Update, InlineQueryResultArticle, InputTextMessageContent
from telegram.ext import filters, InlineQueryHandler, MessageHandler, ApplicationBuilder, ContextTypes, CommandHandler

# local imports
from url_helpers import extract_youtube_urls
from constants import (
    # Messages
    MSG_START,
    MSG_NOT_VALID_LINK,
    MSG_MULTIPLE_LINKS,
    MSG_PLEASE_WAIT,
    MSG_UNKNOWN_CMD,
    # Inline options
    INLINE_SUMMARIZE
)



load_dotenv()
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
AI_SERVER_URL = os.getenv("AI_SERVER_URL")


logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# HELPERS
def decide_reaction(urls):
    if len(urls) == 0:
        return False, MSG_NOT_VALID_LINK
    elif len(urls) > 1:
        return True, MSG_MULTIPLE_LINKS
    else:
        return True, MSG_PLEASE_WAIT
    
def get_summary(video_id: str):
    response = requests.post(f"{AI_SERVER_URL}/summarize", json={"video_id": video_id})
    if response.status_code == 200:
        return response.json().get("summary")
    else:
        return "Failed to retrieve or summarize transcript"

# HANDLERS

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id,
                                    text=MSG_START)
async def summarize(update: Update, context: ContextTypes.DEFAULT_TYPE):
    urls = extract_youtube_urls(update.message.text)
    okay, msg = decide_reaction(urls)
    if okay:
        msg = get_summary(urls[0])
        await context.bot.send_message(chat_id=update.effective_chat.id, text=msg)
    
async def plain_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await summarize(update, context)

async def inline_plain_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.inline_query.query
    if not query:
        return
    urls = extract_youtube_urls(query)
    okay, msg = decide_reaction(urls)
    if okay:
        msg = get_summary(urls[0])
    results = []
    results.append(
        InlineQueryResultArticle(
            id=str(uuid4()),
            title=INLINE_SUMMARIZE,
            input_message_content=InputTextMessageContent(msg)
        )
    )
    await context.bot.answer_inline_query(update.inline_query.id, results)

async def unknown(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id, text=MSG_UNKNOWN_CMD)

if __name__ == '__main__':
    application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    
    start_handler = CommandHandler('start', start)
    application.add_handler(start_handler)

    summarize_handler = CommandHandler('summarize', summarize)
    application.add_handler(summarize_handler)

    plain_text_handler = MessageHandler(filters.TEXT & (~filters.COMMAND), plain_text)
    application.add_handler(plain_text_handler)

    inline_plain_text_handler = InlineQueryHandler(inline_plain_text)
    application.add_handler(inline_plain_text_handler)

    unknown_handler = MessageHandler(filters.COMMAND, unknown)
    application.add_handler(unknown_handler)
    
application.run_polling()