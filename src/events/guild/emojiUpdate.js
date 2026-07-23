const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  name: 'emojiUpdate',

  async execute(oldEmoji, newEmoji) {
    const guild = oldEmoji.guild;

    try {
      const config = db.getGuildConfig(guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      if (oldEmoji.name === newEmoji.name) return;

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0xF1C40F, // Yellow
        title: '✏️ Log: Emoji Diperbarui',
        thumbnail: newEmoji.url,
        fields: [
          { name: '😀 Emoji Target', value: `${newEmoji}`, inline: true },
          { name: '📝 Perubahan Nama', value: `\`:${oldEmoji.name}:\` ➡️ \`:${newEmoji.name}:\``, inline: false }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in emojiUpdate event:', error);
    }
  }
};
