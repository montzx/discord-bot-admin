const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Load all event listeners automatically from events subdirectories
 * @param {import('discord.js').Client} client 
 */
function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');

  if (!fs.existsSync(eventsPath)) {
    logger.warn('Events directory does not exist!');
    return;
  }

  const categoryFolders = fs.readdirSync(eventsPath);
  let totalEvents = 0;

  for (const folder of categoryFolders) {
    const categoryPath = path.join(eventsPath, folder);
    
    if (fs.statSync(categoryPath).isDirectory()) {
      const eventFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
      
      for (const file of eventFiles) {
        const filePath = path.join(categoryPath, file);
        try {
          delete require.cache[require.resolve(filePath)];
          const event = require(filePath);

          if (!event.name || !event.execute) {
            logger.warn(`Event at ${filePath} is missing "name" or "execute" export.`);
            continue;
          }

          if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
          } else {
            client.on(event.name, (...args) => event.execute(...args, client));
          }

          totalEvents++;
          logger.info(`Loaded Event: [${folder.toUpperCase()}] ${event.name}`);
        } catch (err) {
          logger.error(`Failed to load event at ${filePath}:`, err);
        }
      }
    }
  }

  logger.info(`Successfully loaded ${totalEvents} event listeners.`);
}

module.exports = { loadEvents };
