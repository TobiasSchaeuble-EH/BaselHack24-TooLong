use crate::db::DB_FILENAME;
use rusqlite::{params, Connection, OptionalExtension, Result};

pub fn create_users_table() -> Result<()> {
    let conn = Connection::open(DB_FILENAME)?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            usages INTEGER NOT NULL
        )",
        [],
    )?;
    Ok(())
}

pub async fn update_or_add_user(user_id: u64, username: &str) -> Result<()> {
    let conn = Connection::open(DB_FILENAME)?;
    let mut stmt = conn.prepare("SELECT usages FROM users WHERE user_id = ?1")?;
    let user_exists: Option<u64> = stmt
        .query_row(params![user_id], |row| row.get(0))
        .optional()?;

    match user_exists {
        Some(_) => {
            // User exists, increase usage count
            conn.execute(
                "UPDATE users SET usages = usages + 1 WHERE user_id = ?1",
                params![user_id],
            )?;
        }
        None => {
            // User does not exist, add user
            conn.execute(
                "INSERT INTO users (user_id, username, usages) VALUES (?1, ?2, ?3)",
                params![user_id, username, 1],
            )?;
        }
    }
    Ok(())
}
