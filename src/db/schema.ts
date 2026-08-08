/**
 * 中文名：数据表结构
 * 职责：定义 cards / records / playlists / playlist_items 建表语句
 */

export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT UNIQUE NOT NULL,
    ease REAL NOT NULL DEFAULT 2.5,
    interval INTEGER NOT NULL DEFAULT 0,
    repetitions INTEGER NOT NULL DEFAULT 0,
    due_date TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    starred INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER,
    character TEXT NOT NULL,
    evaluation TEXT NOT NULL,
    is_new INTEGER NOT NULL,
    source TEXT NOT NULL,
    practiced_at TEXT NOT NULL,
    FOREIGN KEY (card_id) REFERENCES cards(id)
  )`,
  `CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS playlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    character TEXT NOT NULL,
    position INTEGER NOT NULL,
    added_at TEXT NOT NULL,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_cards_due ON cards(due_date)`,
  `CREATE INDEX IF NOT EXISTS idx_records_char ON records(character)`,
  `CREATE INDEX IF NOT EXISTS idx_records_date ON records(practiced_at)`,
  `CREATE INDEX IF NOT EXISTS idx_playlist_items_pid ON playlist_items(playlist_id)`
]
