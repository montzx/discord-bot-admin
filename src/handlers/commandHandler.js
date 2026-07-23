const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger');

// Explicit list of command modules for 100% deterministic loading across all OS environments
const commandModules = [
  require('../commands/rules/rules'),
  require('../commands/sticky/sticky'),
  require('../commands/welcome/welcome'),
  require('../commands/logs/logs'),
  require('../commands/config/config'),
  require('../commands/utility/ping'),
  require('../commands/utility/botinfo'),
  require('../commands/utility/serverinfo')
];

/**
 * Load all commands automatically and deterministically
 * @param {import('discord.js').Client} client 
 */
function loadCommands(client) {
  client.commands = new Collection();
  client.commandArray = [];

  for (const command of commandModules) {
    try {
      if (command && 'data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
        logger.info(`Loaded Command: /${command.data.name}`);
      } else {
        logger.warn('A command module is missing required "data" or "execute" property.');
      }
    } catch (err) {
      logger.error('Failed to load command module:', err);
    }
  }

  logger.info(`Successfully loaded ${client.commands.size} slash commands.`);
}

module.exports = { loadCommands };
