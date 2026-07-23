const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { initSchema } = require('./schema');
const logger = require('../utils/logger');

let db = null;

/**
 * Get or initialize SQLite Database connection lazily
 * @returns {import('better-sqlite3').Database}
 */
function getDb() {
  if (!db) {
    try {
      const dbPath = path.isAbsolute(config.dbPath) ? config.dbPath : path.resolve(process.cwd(), config.dbPath || './database.sqlite');
      const parentDir = path.dirname(dbPath);

      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      db = new Database(dbPath);
      logger.info(`Database connected at: ${dbPath}`);
      initSchema(db);
    } catch (error) {
      logger.error('Failed to initialize database connection:', error);
      throw error;
    }
  }
  return db;
}

// Database Helper Methods using Lazy DB Instance
const dbHelper = {
  getDb,

  // --- GUILD CONFIG ---
  getGuildConfig: (guildId) => {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM guild_config WHERE guild_id = ?');
    let row = stmt.get(guildId);
    if (!row) {
      database.prepare('INSERT INTO guild_config (guild_id) VALUES (?)').run(guildId);
      row = stmt.get(guildId);
    }
    return row;
  },

  updateGuildConfig: (guildId, data) => {
    const database = getDb();
    dbHelper.getGuildConfig(guildId); // Ensure exists
    const keys = Object.keys(data);
    if (keys.length === 0) return;

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), guildId];

    const stmt = database.prepare(`UPDATE guild_config SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE guild_id = ?`);
    stmt.run(...values);
  },

  // --- RULES ---
  getRules: (guildId) => {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM rules WHERE guild_id = ?');
    return stmt.get(guildId);
  },

  setRules: (guildId, channelId, messageId, rulesArray, title, description, color, image_url) => {
    const database = getDb();
    const rulesJson = JSON.stringify(rulesArray);
    const stmt = database.prepare(`
      INSERT INTO rules (guild_id, channel_id, message_id, rules_json, title, description, color, image_url, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(guild_id) DO UPDATE SET
        channel_id = excluded.channel_id,
        message_id = excluded.message_id,
        rules_json = excluded.rules_json,
        title = excluded.title,
        description = excluded.description,
        color = excluded.color,
        image_url = excluded.image_url,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(guildId, channelId, messageId, rulesJson, title || '📜 SERVERS RULES & REGULATION', description || 'Mohon patuhi peraturan server berikut:', color || '#0099FF', image_url || null);
  },

  updateRulesMessageId: (guildId, messageId) => {
    const database = getDb();
    const stmt = database.prepare('UPDATE rules SET message_id = ?, updated_at = CURRENT_TIMESTAMP WHERE guild_id = ?');
    stmt.run(messageId, guildId);
  },

  deleteRules: (guildId) => {
    const database = getDb();
    const stmt = database.prepare('DELETE FROM rules WHERE guild_id = ?');
    return stmt.run(guildId);
  },

  // --- STICKY MESSAGES ---
  getSticky: (guildId, channelId) => {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM sticky_messages WHERE guild_id = ? AND channel_id = ?');
    return stmt.get(guildId, channelId);
  },

  getAllSticky: (guildId) => {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM sticky_messages WHERE guild_id = ?');
    return stmt.all(guildId);
  },

  setSticky: (guildId, channelId, messageId, content, title, embedDescription, cooldown = 5) => {
    const database = getDb();
    const stmt = database.prepare(`
      INSERT INTO sticky_messages (guild_id, channel_id, message_id, content, title, embed_description, cooldown, last_posted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(guild_id, channel_id) DO UPDATE SET
        message_id = excluded.message_id,
        content = excluded.content,
        title = excluded.title,
        embed_description = excluded.embed_description,
        cooldown = excluded.cooldown,
        last_posted_at = excluded.last_posted_at
    `);
    stmt.run(guildId, channelId, messageId, content || null, title || null, embedDescription || null, cooldown, Date.now());
  },

  updateStickyMessageId: (guildId, channelId, messageId) => {
    const database = getDb();
    const stmt = database.prepare('UPDATE sticky_messages SET message_id = ?, last_posted_at = ? WHERE guild_id = ? AND channel_id = ?');
    stmt.run(messageId, Date.now(), guildId, channelId);
  },

  deleteSticky: (guildId, channelId) => {
    const database = getDb();
    const stmt = database.prepare('DELETE FROM sticky_messages WHERE guild_id = ? AND channel_id = ?');
    return stmt.run(guildId, channelId);
  }
};

module.exports = dbHelper;
