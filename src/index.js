const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const logger = require('./utils/logger');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

// Validate Discord Token
if (!config.token) {
  logger.error('CRITICAL: DISCORD_TOKEN is missing in environment variables or .env file!');
  process.exit(1);
}

// Global Process Error Handlers (Prevents Bot Crashes)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at Promise:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
});

process.on('uncaughtExceptionMonitor', (error, origin) => {
  logger.error('Uncaught Exception Monitor:', { error, origin });
});

// Initialize Client with required Gateway Intents & Partials
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration, // Replacement for GuildBans in d.js v14
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

// Load Handlers
loadCommands(client);
loadEvents(client);

// Lightweight HTTP server for Railway / Render Health Check
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'online',
    bot: client.user ? client.user.tag : 'Connecting...',
    uptime: `${Math.floor(process.uptime())} seconds`
  }));
}).listen(PORT, () => {
  logger.info(`HTTP Health Check server listening on port ${PORT}`);
});

// Connect Bot to Discord Gateway
client.login(config.token).catch(err => {
  logger.error('Failed to log in to Discord:', err);
  process.exit(1);
});
