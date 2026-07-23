const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Embed Design Configuration
  colors: {
    primary: 0x0099FF, // #0099FF
    success: 0x2ECC71, // #2ECC71
    warning: 0xF1C40F, // #F1C40F
    error: 0xE74C3C,   // #E74C3C
    info: 0x3498DB     // #3498DB
  },

  footerText: 'Discord Admin Bot • System Management',

  // Database Path (mendukung Railway Persistent Volume & kustom DB_PATH)
  dbPath: process.env.DB_PATH || (process.env.RAILWAY_VOLUME_MOUNT_PATH ? require('path').join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'database.sqlite') : './database.sqlite')
};
