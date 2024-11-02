use rusqlite::{params, Connection, Result};

pub async fn create_table_whitelist() -> Result<()> {
    let conn = Connection::open("bot.db")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS whitelist (
                  channel_id TEXT PRIMARY KEY
                  )",
        [],
    )?;
    Ok(())
}

pub async fn is_channel_in_whitelist(channel_id: &String) -> Result<bool> {
    let conn = Connection::open("bot.db")?;
    let mut stmt = conn.prepare("SELECT 1 FROM whitelist WHERE channel_id = ?1")?;
    let mut rows = stmt.query(params![channel_id])?;
    Ok(rows.next()?.is_some())
}

pub async fn add(channel_id: String) -> Result<()> {
    let conn = Connection::open("bot.db")?;
    conn.execute(
        "INSERT OR IGNORE INTO whitelist (channel_id) VALUES (?1)",
        params![channel_id],
    )?;
    Ok(())
}