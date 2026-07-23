const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  name: 'voiceStateUpdate',

  async execute(oldState, newState) {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    const guild = newState.guild || oldState.guild;

    try {
      const config = db.getGuildConfig(guild.id);
      if (!config.log_enabled || !config.log_channel_id) return;

      const logChannel = guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      // 1. Join Voice
      if (!oldState.channelId && newState.channelId) {
        const embed = ModernEmbedBuilder.baseEmbed({
          color: 0x2ECC71, // Green
          title: '🔊 Log: Join Voice Channel',
          fields: [
            { name: '👤 Member', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: '💬 Channel Voice', value: `${newState.channel}`, inline: true }
          ]
        });
        return await logChannel.send({ embeds: [embed] }).catch(() => {});
      }

      // 2. Leave Voice
      if (oldState.channelId && !newState.channelId) {
        const embed = ModernEmbedBuilder.baseEmbed({
          color: 0x95A5A6, // Grey
          title: '🔇 Log: Leave Voice Channel',
          fields: [
            { name: '👤 Member', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: '💬 Channel Voice', value: `${oldState.channel}`, inline: true }
          ]
        });
        return await logChannel.send({ embeds: [embed] }).catch(() => {});
      }

      // 3. Move Voice
      if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const embed = ModernEmbedBuilder.baseEmbed({
          color: 0x3498DB, // Blue
          title: '🔀 Log: Pindah Voice Channel (Move)',
          fields: [
            { name: '👤 Member', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: '⬅️ Dari Channel', value: `${oldState.channel}`, inline: true },
            { name: '➡️ Ke Channel', value: `${newState.channel}`, inline: true }
          ]
        });
        return await logChannel.send({ embeds: [embed] }).catch(() => {});
      }

      // 4. Server Mute / Unmute
      if (oldState.serverMute !== newState.serverMute) {
        const isMuted = newState.serverMute;
        const embed = ModernEmbedBuilder.baseEmbed({
          color: isMuted ? 0xE74C3C : 0x2ECC71,
          title: isMuted ? '🎙️ Log: Server Mute (Muted)' : '🎙️ Log: Server Unmute (Unmuted)',
          fields: [
            { name: '👤 Member', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: '💬 Voice Channel', value: `${newState.channel}`, inline: true }
          ]
        });
        return await logChannel.send({ embeds: [embed] }).catch(() => {});
      }

      // 5. Server Deafen / Undeafen
      if (oldState.serverDeaf !== newState.serverDeaf) {
        const isDeafened = newState.serverDeaf;
        const embed = ModernEmbedBuilder.baseEmbed({
          color: isDeafened ? 0xE74C3C : 0x2ECC71,
          title: isDeafened ? '🎧 Log: Server Deafen' : '🎧 Log: Server Undeafen',
          fields: [
            { name: '👤 Member', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: '💬 Voice Channel', value: `${newState.channel}`, inline: true }
          ]
        });
        return await logChannel.send({ embeds: [embed] }).catch(() => {});
      }
    } catch (error) {
      logger.error('Error in voiceStateUpdate event:', error);
    }
  }
};
