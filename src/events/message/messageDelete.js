const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  name: 'messageDelete',

  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    try {
      const config = db.getGuildConfig(message.guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = message.guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const authorTag = message.author ? `${message.author.tag} (${message.author.id})` : 'Tidak Diketahui';
      const content = message.content || '*Tidak ada konten teks*';

      const fields = [
        { name: '👤 Pengirim Pesan', value: authorTag, inline: true },
        { name: '💬 Channel', value: `${message.channel}`, inline: true },
        { name: '📝 Konten Pesan', value: content.substring(0, 1000), inline: false }
      ];

      // Check if attachment deleted
      if (message.attachments.size > 0) {
        const attachmentUrls = message.attachments.map(a => a.name || a.url).join(', ');
        fields.push({ name: '📎 Attachment Dihapus', value: attachmentUrls, inline: false });
      }

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0xE74C3C, // Red
        title: message.attachments.size > 0 ? '📎 Log: Attachment & Pesan Dihapus' : '🗑️ Log: Pesan Dihapus',
        fields: fields
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in messageDelete event:', error);
    }
  }
};
