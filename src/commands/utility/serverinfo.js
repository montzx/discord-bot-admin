const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Menampilkan informasi rinci mengenai server ini'),

  async execute(interaction) {
    const guild = interaction.guild;
    await guild.fetch();

    const owner = await guild.fetchOwner();
    const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);

    const totalChannels = guild.channels.cache.size;
    const textChannels = guild.channels.cache.filter(c => c.isTextBased()).size;
    const voiceChannels = guild.channels.cache.filter(c => c.isVoiceBased()).size;
    const rolesCount = guild.roles.cache.size;
    const emojisCount = guild.emojis.cache.size;

    const embed = ModernEmbedBuilder.baseEmbed({
      title: `🏰 Server Info - ${guild.name}`,
      thumbnail: guild.iconURL({ dynamic: true }),
      fields: [
        { name: '👑 Server Owner', value: `${owner.user.tag} (${owner.id})`, inline: true },
        { name: '🆔 Server ID', value: guild.id, inline: true },
        { name: '📅 Dibuat Pada', value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`, inline: true },
        { name: '👥 Total Member', value: `**${guild.memberCount}** anggota`, inline: true },
        { name: '💬 Total Channels', value: `Total: ${totalChannels} (Text: ${textChannels}, Voice: ${voiceChannels})`, inline: true },
        { name: '🎭 Total Roles', value: `${rolesCount} role`, inline: true },
        { name: '😀 Total Emojis', value: `${emojisCount} emoji`, inline: true },
        { name: '🔒 Verification Level', value: `${guild.verificationLevel}`, inline: true },
        { name: '🚀 Boost Level', value: `Tier ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boost)`, inline: true }
      ]
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
