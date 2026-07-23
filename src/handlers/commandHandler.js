const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger');

/**
 * Load all commands automatically from commands subdirectories
 * @param {import('discord.js').Client} client 
 */
function loadCommands(client) {
  client.commands = new Collection();
  client.commandArray = [];

  const commandsPath = path.join(__dirname, '../commands');

  if (!fs.existsSync(commandsPath)) {
    logger.warn('Commands directory does not exist!');
    return;
  }

  const categoryFolders = fs.readdirSync(commandsPath);

  for (const folder of categoryFolders) {
    const categoryPath = path.join(commandsPath, folder);
    
    if (fs.statSync(categoryPath).isDirectory()) {
      const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        const filePath = path.join(categoryPath, file);
        try {
          // Clear require cache if reloading
          delete require.cache[require.resolve(filePath)];
          const command = require(filePath);

          if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            client.commandArray.push(command.data.toJSON());
            logger.info(`Loaded Command: [${folder.toUpperCase()}] /${command.data.name}`);
          } else {
            logger.warn(`Command at ${filePath} is missing required "data" or "execute" property.`);
          }
        } catch (err) {
          logger.error(`Failed to load command at ${filePath}:`, err);
        }
      }
    }
  }

  logger.info(`Successfully loaded ${client.commands.size} slash commands.`);
}

module.exports = { loadCommands };
