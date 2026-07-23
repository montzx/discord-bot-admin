const logger = require('../../utils/logger');

module.exports = {
  name: 'warn',
  execute(warning) {
    logger.warn('Discord Client Warning:', warning);
  }
};
