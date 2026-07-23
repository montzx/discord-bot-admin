const { AuditLogEvent } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const { fetchAuditLogExecutor } = require('../../utils/auditLog');
const logger = require('../../utils/logger');

module.exports = {
  name: 'guildMemberUpdate',

  async execute(oldMember, newMember) {
    const guild = newMember.guild;

    try {
      const config = db.getGuildConfig(guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
      const newTimeout = newMember.communicationDisabledUntilTimestamp;

      // Timeout added
      if (!oldTimeout && newTimeout && newTimeout > Date.now()) {
        const { executor, reason } = await fetchAuditLogExecutor(
          guild,
          AuditLogEvent.MemberUpdate,
          (entry) => entry.target.id === newMember.id
        );

        const timeoutUntil = Math.floor(newTimeout / 1000);
        const executorText = executor ? `${executor.tag} (${executor.id})` : 'Tidak Diketahui';

        const embed = ModernEmbedBuilder.baseEmbed({
          color: 0xE67E22, // Orange
          title: '⏳ Log: Member Di-Timeout',
          thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
          fields: [
            { name: '👤 Member', value: `${newMember.user.tag} (${newMember.id})`, inline: true },
            { name: '🛡️ Executor (Admin)', value: executorText, inline: true },
            { name: '⏰ Berakhir Pada', value: `<t:${timeoutUntil}:F> (<t:${timeoutUntil}:R>)`, inline: false },
            { name: '📝 Alasan', value: reason || 'Tidak ada alasan', inline: false }
          ]
        });

        return await logChannel.send({ embeds: [embed] }).catch(() => {});
      }

      // Timeout removed
      if (oldTimeout && (!newTimeout || newTimeout <= Date.now())) {
        const { executor } = await fetchAuditLogExecutor(
          guild,
          AuditLogEvent.MemberUpdate,
          (entry) => entry.target.id === newMember.id
        );

        const executorText = executor ? `${executor.tag} (${executor.id})` : 'Sistem / Disetujui Admin';

        const embed = ModernEmbedBuilder.baseEmbed({
          color: 0x2ECC71, // Green
          title: '⌛ Log: Timeout Dicabut (Timeout Removed)',
          thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
          fields: [
            { name: '👤 Member', value: `${newMember.user.tag} (${newMember.id})`, inline: true },
            { name: '🛡️ Executor (Admin)', value: executorText, inline: true }
          ]
        });

        return await logChannel.send({ embeds: [embed] }).catch(() => {});
      }
    } catch (error) {
      logger.error('Error in guildMemberUpdate event:', error);
    }
  }
};
