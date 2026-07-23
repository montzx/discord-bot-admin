const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {
    const guild = member.guild;

    try {
      const config = db.getGuildConfig(guild.id);

      // 1. WELCOME SYSTEM
      if (config.welcome_enabled && config.welcome_channel_id) {
        const welcomeChannel = guild.channels.cache.get(config.welcome_channel_id);
        if (welcomeChannel) {
          const rulesData = db.getRules(guild.id);
          const rulesChannel = rulesData ? `<#${rulesData.channel_id}>` : '#rules';

          const rawMessage = config.welcome_message || 'Selamat datang {user} di **{server}**!\nMohon baca {rules}!';
          const parsedMessage = rawMessage
            .replace(/{user}/g, `${member}`)
            .replace(/{server}/g, guild.name)
            .replace(/{memberCount}/g, guild.memberCount.toString())
            .replace(/{rules}/g, rulesChannel);

          const welcomeEmbed = ModernEmbedBuilder.baseEmbed({
            title: config.welcome_title || '👋 Selamat Datang!',
            description: parsedMessage,
            thumbnail: member.user.displayAvatarURL({ dynamic: true }),
            footerText: `Member #${guild.memberCount} • Welcome`
          });

          await welcomeChannel.send({ content: `${member}`, embeds: [welcomeEmbed] }).catch(() => {});
        }
      }

      // 2. MEMBER JOIN LOG
      if (config.log_enabled && config.log_channel_id) {
        const logChannel = guild.channels.cache.get(config.log_channel_id);
        if (logChannel) {
          const accountCreated = Math.floor(member.user.createdTimestamp / 1000);

          const logEmbed = ModernEmbedBuilder.baseEmbed({
            color: 0x2ECC71, // Green
            title: '📥 Log: Member Bergabung (Join)',
            thumbnail: member.user.displayAvatarURL({ dynamic: true }),
            fields: [
              { name: '👤 Member', value: `${member.user.tag} (${member.id})`, inline: true },
              { name: '📅 Akun Dibuat', value: `<t:${accountCreated}:R>`, inline: true },
              { name: '👥 Total Member Now', value: `${guild.memberCount}`, inline: true }
            ]
          });

          await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }
      }
    } catch (error) {
      logger.error('Error in guildMemberAdd event:', error);
    }
  }
};
