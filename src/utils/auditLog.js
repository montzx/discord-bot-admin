const { AuditLogEvent } = require('discord.js');
const logger = require('./logger');

/**
 * Fetch executor for a specific action from Discord Audit Logs
 * @param {import('discord.js').Guild} guild 
 * @param {AuditLogEvent} action 
 * @param {Function} filterPredicate 
 * @returns {Promise<{ executor: import('discord.js').User|null, reason: string|null }>}
 */
async function fetchAuditLogExecutor(guild, action, filterPredicate = null) {
  try {
    if (!guild.members.me.permissions.has('ViewAuditLog')) {
      return { executor: null, reason: 'Missing ViewAuditLog Permission' };
    }

    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 5,
      type: action,
    });

    const now = Date.now();
    const recentEntry = fetchedLogs.entries.find(entry => {
      // Entry should be within last 10 seconds
      const isRecent = (now - entry.createdTimestamp) < 10000;
      if (!isRecent) return false;
      return filterPredicate ? filterPredicate(entry) : true;
    });

    if (recentEntry) {
      return {
        executor: recentEntry.executor,
        reason: recentEntry.reason || 'Tidak ada alasan'
      };
    }

    return { executor: null, reason: null };
  } catch (error) {
    logger.error('Error fetching audit log executor:', error);
    return { executor: null, reason: null };
  }
}

module.exports = { fetchAuditLogExecutor };
