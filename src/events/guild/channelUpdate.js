const { AuditLogEvent } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const { fetchAuditLogExecutor } = require('../../utils/auditLog');
const logger = require('../../utils/logger');

module.exports = {
  name: 'channelUpdate',

  async execute(oldChannel, newChannel) {
    if (!oldChannel.guild) return;

    try {
      const config = db.getGuildConfig(oldChannel.guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = oldChannel.guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const changes = [];
      if (oldChannel.name !== newChannel.name) {
        changes.push(`**Nama:** \`${oldChannel.name}\` ➡️ \`${newChannel.name}\``);
      }
      if (oldChannel.topic !== newChannel.topic) {
        changes.push(`**Topic:** \`${oldChannel.topic || 'Kosong'}\` ➡️ \`${newChannel.topic || 'Kosong'}\``);
      }

      if (changes.length === 0) return;

      const { executor } = await fetchAuditLogExecutor(
        oldChannel.guild,
        AuditLogEvent.ChannelUpdate,
        (entry) => entry.target.id === oldChannel.id
      );

      const executorText = executor ? `${executor.tag} (${executor.id})` : 'Tidak Diketahui';

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0xF1C40F, // Yellow
        title: '✏️ Log: Channel Diperbarui (Channel Updated)',
        fields: [
          { name: '💬 Channel Target', value: `${newChannel}`, inline: true },
          { name: '🛡️ Executor (Admin)', value: executorText, inline: true },
          { name: '📝 Perubahan', value: changes.join('\n'), inline: false }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in channelUpdate event:', error);
    }
  }
};
