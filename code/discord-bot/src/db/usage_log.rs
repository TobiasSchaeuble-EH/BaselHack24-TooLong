use crate::db::DB_FILENAME;
use chrono::Utc;
use rusqlite::{params, Connection, Result};

pub fn create_usage_log_table() -> Result<()> {
    let conn = Connection::open(DB_FILENAME)?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS usage_log (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            url TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
        )",
        [],
    )?;
    Ok(())
}

pub async fn add_usage_log(user_id: u64, url: &str) -> Result<()> {
    let conn = Connection::open(DB_FILENAME)?;
    let timestamp = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO usage_log (user_id, url, timestamp) VALUES (?1, ?2, ?3)",
        params![user_id, url, timestamp],
    )?;
    Ok(())
}
