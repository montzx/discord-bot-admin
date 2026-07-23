const { handleStickyMessage } = require('../../utils/stickyHandler');
const logger = require('../../utils/logger');

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    try {
      // Process Sticky Message logic
      await handleStickyMessage(message);
    } catch (error) {
      logger.error('Error in messageCreate event:', error);
    }
  }
};
