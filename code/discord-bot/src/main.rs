use dotenv::dotenv;
use regex::Regex;
use std::env;

use crate::db::whitelist::add_or_remove_from_whitelist;
use serenity::async_trait;
use serenity::model::channel::Message;
use serenity::prelude::*;

struct Handler;

mod api_commands;
mod db;

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, ctx: Context, msg: Message) {
        let content: Vec<&str> = msg.content.split_whitespace().collect();
        let yt_url_regex = Regex::new(r"https?://(www\.)?(youtube\.com|youtu\.be)/[^\s]+").unwrap();
        let yt_url = content.iter().find(|&&word| yt_url_regex.is_match(word));

        if msg.content.starts_with("https:") {
            //Check if channel is in whitelist
            if !db::whitelist::is_channel_in_whitelist(&msg.channel_id.to_string())
                .await
                .unwrap()
            {
                return;
            }
            api_commands::send_summarize(yt_url, &ctx, &msg).await;
        } else if msg.content.starts_with(".summarize") {
            api_commands::send_summarize(yt_url, &ctx, &msg).await;
        } else if msg.content.starts_with(".whitelist") {
            add_or_remove_from_whitelist(&ctx, &msg).await
        }
    }
}

#[tokio::main]
async fn main() {
    // create database
    db::whitelist::create_table_whitelist().expect("Failed to create whitelist table");
    db::users::create_users_table().expect("Failed to create users table");
    db::usage_log::create_usage_log_table().expect("Failed to create usage log table");

    dotenv().ok();
    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");
    // Set gateway intents, which decides what events the bot will be notified about
    let intents = GatewayIntents::GUILD_MESSAGES
        | GatewayIntents::DIRECT_MESSAGES
        | GatewayIntents::MESSAGE_CONTENT;

    // Create a new instance of the Client, logging in as a bot.
    let mut client = Client::builder(&token, intents)
        .event_handler(Handler)
        .await
        .expect("Err creating client");

    // Start listening for events by starting a single shard
    if let Err(why) = client.start().await {
        println!("Client error: {why:?}");
    }
}
