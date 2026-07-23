const { AuditLogEvent } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const { fetchAuditLogExecutor } = require('../../utils/auditLog');
const logger = require('../../utils/logger');

module.exports = {
  name: 'roleCreate',

  async execute(role) {
    const guild = role.guild;

    try {
      const config = db.getGuildConfig(guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const { executor } = await fetchAuditLogExecutor(
        guild,
        AuditLogEvent.RoleCreate,
        (entry) => entry.target.id === role.id
      );

      const executorText = executor ? `${executor.tag} (${executor.id})` : 'Tidak Diketahui';

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0x2ECC71, // Green
        title: '🎭 Log: Role Dibuat',
        fields: [
          { name: '🎭 Nama Role', value: `${role} (\`${role.name}\`)`, inline: true },
          { name: '🆔 Role ID', value: role.id, inline: true },
          { name: '🛡️ Executor (Admin)', value: executorText, inline: true }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in roleCreate event:', error);
    }
  }
};
