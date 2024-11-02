use serenity::all::{Context, Message};
use reqwest::Client as ReqClient;

const SUMMARIZE_ENDPOINT: &str = "http://";

async fn send_api_request(endpoint: String, content: String) -> Option<String> {
    let client = ReqClient::new();
    match client.post(&endpoint)
        .body(content)
        .send()
        .await {
        Ok(response) => {
            if response.status().is_success() {
                match response.text().await {
                    Ok(body) => {
                        println!("Request successful: {}", body);
                        Some(body)
                    },
                    Err(err) => {
                        println!("Failed to read response body: {}", err);
                        None
                    }
                }
            } else {
                println!("Request failed with status: {}", response.status());
                None
            }
        },
        Err(err) => {
            println!("Failed to send request: {}", err);
            None
        }
    }
}



pub async fn send_summarize(yt_url: Option<&&str>, ctx: &Context, msg: &Message){
    let response: String;
    if let Some(url) = yt_url {
        let endpoint = SUMMARIZE_ENDPOINT.to_string();
        // If a YouTube URL is found, process it
        send_api_request(endpoint, url.to_string()).await;
        response = format!("Processing YouTube URL: {}", url);
    } else {
        // If no YouTube URL is found, send a different response
        response = "No YouTube URL found after .summarize".to_string();
    }

    if let Err(why) = msg.channel_id.say(&ctx.http, response).await {
        println!("Error sending message: {why:?}");
    }
}