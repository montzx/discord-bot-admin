const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  name: 'threadDelete',

  async execute(thread) {
    if (!thread.guild) return;

    try {
      const config = db.getGuildConfig(thread.guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = thread.guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0xE74C3C, // Red
        title: '🗑️ Log: Thread Dihapus',
        fields: [
          { name: '🧵 Nama Thread', value: `\`${thread.name}\``, inline: true },
          { name: '💬 Parent Channel', value: `${thread.parent || 'Dihapus'}`, inline: true },
          { name: '🆔 Thread ID', value: thread.id, inline: true }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in threadDelete event:', error);
    }
  }
};
