const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  name: 'emojiDelete',

  async execute(emoji) {
    const guild = emoji.guild;

    try {
      const config = db.getGuildConfig(guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0xE74C3C, // Red
        title: '🗑️ Log: Emoji Dihapus',
        fields: [
          { name: '😀 Nama Emoji', value: `\`:${emoji.name}:\``, inline: true },
          { name: '🆔 Emoji ID', value: emoji.id, inline: true }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in emojiDelete event:', error);
    }
  }
};
