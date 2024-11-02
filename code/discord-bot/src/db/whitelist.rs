use rusqlite::{params, Connection, Result};
use serenity::all::{Context, Message};
use crate::db::DB_FILENAME;

pub fn create_table_whitelist() -> Result<()> {
    let conn = Connection::open(DB_FILENAME)?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS whitelist (
                  channel_id TEXT PRIMARY KEY
                  )",
        [],
    )?;
    Ok(())
}

pub async fn is_channel_in_whitelist(channel_id: &String) -> Result<bool> {
    let conn = Connection::open(DB_FILENAME)?;
    let mut stmt = conn.prepare("SELECT 1 FROM whitelist WHERE channel_id = ?1")?;
    let mut rows = stmt.query(params![channel_id])?;
    Ok(rows.next()?.is_some())
}

pub async fn add(channel_id: String) -> Result<()> {
    let conn = Connection::open(DB_FILENAME)?;
    conn.execute(
        "INSERT OR IGNORE INTO whitelist (channel_id) VALUES (?1)",
        params![channel_id],
    )?;
    Ok(())
}

fn add_to_whitelist(conn: &Connection, channel_id: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO whitelist (channel_id) VALUES (?1)",
        params![channel_id],
    )?;
    Ok(())
}

fn remove_from_whitelist(conn: &Connection, channel_id: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM whitelist WHERE channel_id = ?1",
        params![channel_id],
    )?;
    Ok(())
}

fn is_in_whitelist(conn: &Connection, channel_id: &str) -> Result<bool> {
    let mut stmt = conn.prepare("SELECT 1 FROM whitelist WHERE channel_id = ?1")?;
    let mut rows = stmt.query(params![channel_id])?;
    Ok(rows.next()?.is_some())
}


pub async fn add_or_remove_from_whitelist(ctx: &Context, msg: &Message) {
    let conn = Connection::open(DB_FILENAME)
        .expect("Failed to connect to database");
    let channel_id = msg.channel_id.to_string();

    match is_in_whitelist(&conn, &channel_id) {
        Ok(true) => {
            match remove_from_whitelist(&conn, &channel_id) {
                Ok(_) => {
                    msg.channel_id.say(&ctx.http, "Removed this channel from whitelist")
                        .await
                        .expect("Can't send message");
                }
                Err(_) => {
                    msg.channel_id.say(
                        &ctx.http, "Could not remove this channel from whitelist")
                        .await
                        .expect("Can't send message");
                }
            }
        }
        Ok(false) => {
            match add_to_whitelist(&conn, &channel_id) {
                Ok(_) => {
                    msg.channel_id.say(&ctx.http, "Added this channel to whitelist")
                        .await
                        .expect("Can't send message");
                }
                Err(_) => {
                    msg.channel_id.say(&ctx.http, "Could not add this channel to whitelist")
                        .await
                        .expect("Can't send message");
                }
            }
        }
        Err(_) => {
            msg.channel_id.say(&ctx.http, "Error checking whitelist status")
                .await
                .expect("Can't send message");
        }
    }
}

