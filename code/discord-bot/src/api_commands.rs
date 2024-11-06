use crate::db::usage_log::add_usage_log;
use crate::db::users::update_or_add_user;
use reqwest::Client as ReqClient;
use serde_json::json;
use serenity::all::{Context, Message};

const SUMMARIZE_ENDPOINT: &str =
    "http://127.0.0.1:5000/summarize";

    const MAX_MESSAGE_LENGTH: usize = 2000;


async fn send_api_request(endpoint: String, url: String) -> Option<String> {
    let client = ReqClient::new();
    let payload = json!({ "video_id": url }).to_string();  // Create JSON payload

    match client.post(&endpoint)
        .header("Content-Type", "application/json")  // Set JSON content type header
        .body(payload)
        .send()
        .await
    {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<serde_json::Value>().await {
                    Ok(json) => {
                        if let Some(summary) = json.get("summary").and_then(|s| s.as_str()) {
                            println!("Request successful: {}", summary);
                            return Some(summary.to_string())
                        } else {
                            println!("Summary key not found in response");
                            None
                        }
                    }
                    Err(err) => {
                        println!("Failed to parse JSON response: {}", err);
                        None
                    }
                }
            } else {
                println!("Request failed with status: {}", response.status());
                None
            }
        }
        Err(err) => {
            println!("Failed to send request: {}", err);
            None
        }
    }
}

pub async fn send_summarize(yt_url: Option<&&str>, ctx: &Context, msg: &Message) {
    let response: String;
    let user_id = msg.author.id.get();

    if let Some(url) = yt_url {
        let endpoint = SUMMARIZE_ENDPOINT.to_string();
        // If a YouTube URL is found, process it
        let potential_response = send_api_request(endpoint, url.to_string()).await;
        match potential_response {
            None => response = "Couldnt establish connection".to_string(),
            Some(element) => response = element,
        }
        update_or_add_user(user_id, &msg.author.name)
            .await
            .expect("Could not add or increment usage for user");
        add_usage_log(user_id, url)
            .await
            .expect("Couldnt add the usage log");
    } else {
        // If no YouTube URL is found, send a different response
        response = "No YouTube URL found after .summarize".to_string();
    }

    // Check if user is in the database and update or add them
    send_long_message(msg, ctx, &response).await
}

async fn send_long_message(msg: &Message, ctx: &Context, response: &str) {
    let mut start = 0;
    let response_length = response.len();

    while start < response_length {
        // Determine the end index for the current chunk
        let end = std::cmp::min(start + MAX_MESSAGE_LENGTH, response_length);
        let chunk = &response[start..end];

        // Send the chunk
        if let Err(why) = msg.channel_id.say(&ctx.http, chunk).await {
            println!("Error sending message: {why:?}");
        }

        // Move the start index to the end of the current chunk
        start = end;
    }
}
