const { AuditLogEvent } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const { fetchAuditLogExecutor } = require('../../utils/auditLog');
const logger = require('../../utils/logger');

module.exports = {
  name: 'channelCreate',

  async execute(channel) {
    if (!channel.guild) return;

    try {
      const config = db.getGuildConfig(channel.guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = channel.guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const { executor } = await fetchAuditLogExecutor(
        channel.guild,
        AuditLogEvent.ChannelCreate,
        (entry) => entry.target.id === channel.id
      );

      const executorText = executor ? `${executor.tag} (${executor.id})` : 'Tidak Diketahui';

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0x2ECC71, // Green
        title: '📁 Log: Channel Dibuat',
        fields: [
          { name: '💬 Nama Channel', value: `${channel} (\`${channel.name}\`)`, inline: true },
          { name: '🆔 Channel ID', value: channel.id, inline: true },
          { name: '🛡️ Executor (Admin)', value: executorText, inline: true }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in channelCreate event:', error);
    }
  }
};
