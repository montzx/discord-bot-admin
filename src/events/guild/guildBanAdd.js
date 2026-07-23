const { AuditLogEvent } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const { fetchAuditLogExecutor } = require('../../utils/auditLog');
const logger = require('../../utils/logger');

module.exports = {
  name: 'guildBanAdd',

  async execute(ban) {
    const guild = ban.guild;

    try {
      const config = db.getGuildConfig(guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const { executor, reason } = await fetchAuditLogExecutor(
        guild,
        AuditLogEvent.MemberBanAdd,
        (entry) => entry.target.id === ban.user.id
      );

      const executorText = executor ? `${executor.tag} (${executor.id})` : 'Tidak Diketahui / Audit Log Timeout';

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0x900C3F, // Dark Red
        title: '🔨 Log: Member Di-Ban (Ban)',
        thumbnail: ban.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: '👤 Member Di-Ban', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
          { name: '🛡️ Executor (Admin)', value: executorText, inline: true },
          { name: '📝 Alasan Ban', value: ban.reason || reason || 'Tidak ada alasan', inline: false }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in guildBanAdd event:', error);
    }
  }
};
