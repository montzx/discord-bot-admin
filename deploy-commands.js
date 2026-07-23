const { REST, Routes } = require('discord.js');
const config = require('./src/config');
const { loadCommands } = require('./src/handlers/commandHandler');
const logger = require('./src/utils/logger');

if (!config.token) {
  logger.error('DISCORD_TOKEN is missing in environment variables!');
  process.exit(1);
}

const dummyClient = {
  commands: new (require('discord.js').Collection)(),
  commandArray: []
};

loadCommands(dummyClient);

if (dummyClient.commandArray.length === 0) {
  logger.warn('No commands found to register!');
  process.exit(0);
}

const rest = new REST({ version: '10' }).setToken(config.token);
const appId = config.clientId;

(async () => {
  try {
    logger.info(`Deploying ${dummyClient.commandArray.length} commands...`);

    if (config.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(appId, config.guildId),
        { body: dummyClient.commandArray }
      );
      logger.info(`Successfully registered ${dummyClient.commandArray.length} Guild commands to Guild ID: ${config.guildId}`);
    }

    await rest.put(
      Routes.applicationCommands(appId),
      { body: dummyClient.commandArray }
    );
    logger.info(`Successfully registered ${dummyClient.commandArray.length} Global commands.`);

    console.log('✅ ALL COMMANDS SUCCESSFULLY REGISTERED TO DISCORD!');
  } catch (error) {
    logger.error('Error deploying commands:', error);
  }
})();
