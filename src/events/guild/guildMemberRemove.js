const { AuditLogEvent } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const { fetchAuditLogExecutor } = require('../../utils/auditLog');
const logger = require('../../utils/logger');

module.exports = {
  name: 'guildMemberRemove',

  async execute(member) {
    const guild = member.guild;

    try {
      const config = db.getGuildConfig(guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      // Check if user was kicked by an Administrator via Audit Log
      const { executor, reason } = await fetchAuditLogExecutor(
        guild,
        AuditLogEvent.MemberKick,
        (entry) => entry.target.id === member.id
      );

      if (executor) {
        // Log Member Kick
        const kickEmbed = ModernEmbedBuilder.baseEmbed({
          color: 0xE74C3C, // Red
          title: '🥾 Log: Member Dikeluarkkan (Kick)',
          thumbnail: member.user.displayAvatarURL({ dynamic: true }),
          fields: [
            { name: '👤 Member', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: '🛡️ Executor (Admin)', value: `${executor.tag} (${executor.id})`, inline: true },
            { name: '📝 Alasan Kick', value: reason || 'Tidak ada alasan', inline: false }
          ]
        });
        return await logChannel.send({ embeds: [kickEmbed] }).catch(() => {});
      }

      // Normal Member Leave Log
      const leaveEmbed = ModernEmbedBuilder.baseEmbed({
        color: 0x95A5A6, // Grey
        title: '📤 Log: Member Keluar (Leave)',
        thumbnail: member.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: '👤 Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: '👥 Total Member Now', value: `${guild.memberCount}`, inline: true }
        ]
      });

      await logChannel.send({ embeds: [leaveEmbed] }).catch(() => {});
    } catch (error) {
      logger.error('Error in guildMemberRemove event:', error);
    }
  }
};
