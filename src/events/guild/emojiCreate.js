const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  name: 'emojiCreate',

  async execute(emoji) {
    const guild = emoji.guild;

    try {
      const config = db.getGuildConfig(guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0x2ECC71, // Green
        title: '😀 Log: Emoji Dibuat',
        thumbnail: emoji.url,
        fields: [
          { name: '😀 Emoji', value: `${emoji} (\`:${emoji.name}:\`)`, inline: true },
          { name: '🆔 Emoji ID', value: emoji.id, inline: true }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in emojiCreate event:', error);
    }
  }
};
