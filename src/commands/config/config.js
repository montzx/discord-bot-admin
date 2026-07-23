const { SlashCommandBuilder, PermissionFlagsBits, version: djsVersion } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Menampilkan seluruh ringkasan konfigurasi bot di server ini'),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    try {
      const config = db.getGuildConfig(guildId);
      const rulesData = db.getRules(guildId);
      const stickyList = db.getAllSticky(guildId);

      const rulesChannel = rulesData ? `<#${rulesData.channel_id}>` : '`Belum Diset`';
      const welcomeChannel = config.welcome_channel_id ? `<#${config.welcome_channel_id}>` : '`Belum Diset`';
      const welcomeStatus = config.welcome_enabled ? '🟢 Aktif' : '🔴 Nonaktif';
      const logChannel = config.log_channel_id ? `<#${config.log_channel_id}>` : '`Belum Diset`';
      const logStatus = config.log_enabled ? '🟢 Aktif' : '🔴 Nonaktif';

      const ping = interaction.client.ws.ping;

      const embed = ModernEmbedBuilder.baseEmbed({
        title: `⚙️ Konfigurasi Bot Server: ${interaction.guild.name}`,
        description: 'Berikut adalah ringkasan seluruh status dan konfigurasi bot di server pribadi ini:',
        thumbnail: interaction.guild.iconURL({ dynamic: true }),
        fields: [
          { name: '📜 Rules System', value: `Channel: ${rulesChannel}\nStatus: ${rulesData ? '🟢 Terpasang' : '🔴 Belum Terpasang'}`, inline: true },
          { name: '👋 Welcome System', value: `Channel: ${welcomeChannel}\nStatus: ${welcomeStatus}`, inline: true },
          { name: '📋 Log System', value: `Channel: ${logChannel}\nStatus: ${logStatus}`, inline: true },
          { name: '📌 Sticky Messages', value: `Total Active Sticky: **${stickyList.length}** channel`, inline: true },
          { name: '💾 Database', value: `Type: **SQLite (better-sqlite3)**\nStatus: 🟢 Connected`, inline: true },
          { name: '⚡ System Info', value: `Latency: **${ping}ms**\nNode.js: **${process.version}**\nDiscord.js: **v${djsVersion}**`, inline: true }
        ]
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error('Error executing /config command:', error);
      return interaction.reply({
        embeds: [ModernEmbedBuilder.error('Terjadi Kesalahan', 'Gagal mengambil data konfigurasi.')],
        ephemeral: true
      });
    }
  }
};
