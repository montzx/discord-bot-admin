const logger = require('../utils/logger');

/**
 * Initialize database tables
 * @param {import('better-sqlite3').Database} db 
 */
function initSchema(db) {
  try {
    // Enable PRAGMA foreign keys & WAL mode for performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Guild Configuration Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS guild_config (
        guild_id TEXT PRIMARY KEY,
        rules_channel_id TEXT,
        rules_message_id TEXT,
        welcome_channel_id TEXT,
        welcome_enabled INTEGER DEFAULT 0,
        welcome_message TEXT DEFAULT 'Selamat datang {user} di **{server}**!',
        welcome_title TEXT DEFAULT 'Member Baru Bergabung!',
        welcome_color TEXT DEFAULT '#0099FF',
        log_channel_id TEXT,
        log_enabled INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Rules Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS rules (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        message_id TEXT,
        title TEXT DEFAULT '📜 SERVERS RULES & REGULATION',
        description TEXT DEFAULT 'Mohon patuhi peraturan server berikut demi kenyamanan bersama:',
        rules_json TEXT NOT NULL,
        color TEXT DEFAULT '#0099FF',
        footer TEXT DEFAULT 'Discord Admin Bot • Rules System',
        image_url TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sticky Messages Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sticky_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_id TEXT,
        content TEXT,
        title TEXT,
        embed_description TEXT,
        cooldown INTEGER DEFAULT 5,
        last_posted_at INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(guild_id, channel_id)
      );
    `);

    logger.info('Database tables initialized successfully.');
  } catch (error) {
    logger.error('Failed to initialize database schema:', error);
    throw error;
  }
}

module.exports = { initSchema };
