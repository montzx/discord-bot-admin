const { AuditLogEvent } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const { fetchAuditLogExecutor } = require('../../utils/auditLog');
const logger = require('../../utils/logger');

module.exports = {
  name: 'roleUpdate',

  async execute(oldRole, newRole) {
    const guild = oldRole.guild;

    try {
      const config = db.getGuildConfig(guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const changes = [];
      if (oldRole.name !== newRole.name) {
        changes.push(`**Nama:** \`${oldRole.name}\` ➡️ \`${newRole.name}\``);
      }
      if (oldRole.hexColor !== newRole.hexColor) {
        changes.push(`**Warna:** \`${oldRole.hexColor}\` ➡️ \`${newRole.hexColor}\``);
      }
      if (oldRole.hoist !== newRole.hoist) {
        changes.push(`**Dipisah di Member List:** \`${oldRole.hoist}\` ➡️ \`${newRole.hoist}\``);
      }

      if (changes.length === 0) return;

      const { executor } = await fetchAuditLogExecutor(
        guild,
        AuditLogEvent.RoleUpdate,
        (entry) => entry.target.id === oldRole.id
      );

      const executorText = executor ? `${executor.tag} (${executor.id})` : 'Tidak Diketahui';

      const embed = ModernEmbedBuilder.baseEmbed({
        color: 0xF1C40F, // Yellow
        title: '✏️ Log: Role Diperbarui (Role Updated)',
        fields: [
          { name: '🎭 Role Target', value: `${newRole}`, inline: true },
          { name: '🛡️ Executor (Admin)', value: executorText, inline: true },
          { name: '📝 Perubahan', value: changes.join('\n'), inline: false }
        ]
      });

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in roleUpdate event:', error);
    }
  }
};
