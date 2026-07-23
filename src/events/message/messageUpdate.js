const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  name: 'messageUpdate',

  async execute(oldMessage, newMessage) {
    if (!oldMessage.guild || oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return; // Pins, embeds, etc.

    try {
      const config = db.getGuildConfig(oldMessage.guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = oldMessage.guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const authorTag = oldMessage.author ? `${oldMessage.author.tag} (${oldMessage.author.id})` : 'Tidak Diketahui';

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0xF1C40F, // Yellow
        title: '✏️ Log: Pesan Diubah (Edited)',
        fields: [
          { name: '👤 Pengirim', value: authorTag, inline: true },
          { name: '💬 Channel', value: `${oldMessage.channel}`, inline: true },
          { name: '🔗 Lompati ke Pesan', value: `[Klik di sini](${newMessage.url})`, inline: true },
          { name: '⬅️ Pesan Sebelum', value: (oldMessage.content || '*Pesan Kosong*').substring(0, 1000), inline: false },
          { name: '➡️ Pesan Sesudah', value: (newMessage.content || '*Pesan Kosong*').substring(0, 1000), inline: false }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in messageUpdate event:', error);
    }
  }
};
