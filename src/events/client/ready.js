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

        // 1. Register all 8 commands to Global API
        await rest.put(
          Routes.applicationCommands(appId),
          { body: client.commandArray }
        );
        logger.info(`Successfully registered ${client.commandArray.length} Global Slash Commands.`);

        // 2. Register all 8 commands to Private Guild ID if provided (instant update)
        if (config.guildId) {
          await rest.put(
            Routes.applicationGuildCommands(appId, config.guildId),
            { body: client.commandArray }
          );
          logger.info(`Successfully registered ${client.commandArray.length} Guild Slash Commands to Guild ID: ${config.guildId}`);
        } else {
          // Fetch all joined guilds and register instantly
          const fetchedGuilds = await client.guilds.fetch();
          for (const [gId] of fetchedGuilds) {
            await rest.put(
              Routes.applicationGuildCommands(appId, gId),
              { body: client.commandArray }
            ).catch(gErr => logger.error(`Failed guild registration for ${gId}:`, gErr));
          }
        }
      } catch (error) {
        logger.error('Error deploying slash commands:', error);
      }
    }
  }
};
