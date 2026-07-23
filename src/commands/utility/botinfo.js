const { SlashCommandBuilder, PermissionFlagsBits, version: djsVersion } = require('discord.js');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Menampilkan informasi rinci dan statistik sistem bot'),

  async execute(interaction) {
    const client = interaction.client;
    
    // Uptime calculation
    const totalSeconds = (client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = Math.floor(totalSeconds % 60);
    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // Memory usage
    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    const embed = ModernEmbedBuilder.baseEmbed({
      title: `🤖 Bot Info - ${client.user.username}`,
      thumbnail: client.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: '🏷️ Bot Name', value: client.user.tag, inline: true },
        { name: '🆔 Bot ID', value: client.user.id, inline: true },
        { name: '⏱️ Uptime', value: uptimeStr, inline: true },
        { name: '🟢 Node.js Version', value: process.version, inline: true },
        { name: '📦 Discord.js Version', value: `v${djsVersion}`, inline: true },
        { name: '💾 Memory Usage', value: `${memUsage} MB`, inline: true },
        { name: '💻 OS Architecture', value: `${os.type()} (${os.arch()})`, inline: true },
        { name: '🏰 Total Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Total Users Cached', value: `${client.users.cache.size}`, inline: true }
      ]
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
