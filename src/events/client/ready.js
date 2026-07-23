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
        logger.info(`Registering ${client.commandArray.length} Slash Command(s)...`);

        // 1. Clear Global commands to eliminate duplicates in Discord UI
        await rest.put(
          Routes.applicationCommands(appId),
          { body: [] }
        ).catch(() => {});
        logger.info('Cleared Global Commands (preventing duplicates).');

        // 2. Register all 8 commands to ALL connected guilds instantly
        for (const [guildId, guild] of client.guilds.cache) {
          try {
            await rest.put(
              Routes.applicationGuildCommands(appId, guildId),
              { body: client.commandArray }
            );
            logger.info(`Successfully registered ${client.commandArray.length} Slash Commands to Guild: ${guild.name} (${guildId})`);
          } catch (gErr) {
            logger.error(`Failed to register commands to Guild ${guild.name} (${guildId}):`, gErr);
          }
        }
      } catch (error) {
        logger.error('Error registering slash commands:', error);
      }
    }
  }
};
