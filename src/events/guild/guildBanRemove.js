const { AuditLogEvent } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const { fetchAuditLogExecutor } = require('../../utils/auditLog');
const logger = require('../../utils/logger');

module.exports = {
  name: 'guildBanRemove',

  async execute(ban) {
    const guild = ban.guild;

    try {
      const config = db.getGuildConfig(guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const { executor } = await fetchAuditLogExecutor(
        guild,
        AuditLogEvent.MemberBanRemove,
        (entry) => entry.target.id === ban.user.id
      );

      const executorText = executor ? `${executor.tag} (${executor.id})` : 'Tidak Diketahui';

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0x2ECC71, // Green
        title: '🔓 Log: Ban Dicabut (Unban)',
        thumbnail: ban.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: '👤 Member Unban', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
          { name: '🛡️ Executor (Admin)', value: executorText, inline: true }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in guildBanRemove event:', error);
    }
  }
};
