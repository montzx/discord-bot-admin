const { REST, Routes } = require('discord.js');
const config = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    logger.info(`=================================================`);
    logger.info(`Bot Logged in as: ${client.user.tag} (${client.user.id})`);
    logger.info(`Node.js Version: ${process.version}`);
    logger.info(`Discord.js Version: v${require('discord.js').version}`);
    logger.info(`=================================================`);

    // Set bot presence
    client.user.setPresence({
      activities: [{ name: 'Server Administration', type: 3 }], // Watching Server Administration
      status: 'online'
    });

    // Register Slash Commands automatically
    if (client.commandArray && client.commandArray.length > 0) {
      const rest = new REST({ version: '10' }).setToken(config.token);
      const appId = client.user.id;

      try {
        logger.info(`Deploying ${client.commandArray.length} Slash Commands to Discord...`);

        // 1. Clear Guild-level commands to prevent double entries in Discord UI
        if (config.guildId) {
          await rest.put(
            Routes.applicationGuildCommands(appId, config.guildId),
            { body: [] }
          ).catch(() => {});
        }
        for (const [gId] of client.guilds.cache) {
          await rest.put(
            Routes.applicationGuildCommands(appId, gId),
            { body: [] }
          ).catch(() => {});
        }

        // 2. Register all 8 commands cleanly to Global API (Single registration, 0 duplicates)
        await rest.put(
          Routes.applicationCommands(appId),
          { body: client.commandArray }
        );
        logger.info(`Successfully registered ${client.commandArray.length} Slash Commands Globally (0 duplicates).`);
      } catch (error) {
        logger.error('Error deploying slash commands:', error);
      }
    }
  }
};
