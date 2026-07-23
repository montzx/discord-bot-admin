const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Pengaturan dan sistem Audit Log Server')
    // Subcommand: setup
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Menentukan channel target untuk seluruh Log Server')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel tempat seluruh Log akan dikirim')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    // Subcommand: disable
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Menonaktifkan pengiriman Log Server')
    )
    // Subcommand: status
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Melihat status dan konfigurasi Log System saat ini')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    try {
      if (subcommand === 'setup') {
        const channel = interaction.options.getChannel('channel');

        db.updateGuildConfig(guildId, {
          log_channel_id: channel.id,
          log_enabled: 1
        });

        const embed = ModernEmbedBuilder.success(
          'Log System Berhasil Aktif',
          `Seluruh log aktivitas (Member, Message, Voice, Server, Administrator Audit) akan dikirim ke channel ${channel}.`
        );

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'disable') {
        db.updateGuildConfig(guildId, { log_enabled: 0 });

        const embed = ModernEmbedBuilder.warning(
          'Log System Dinonaktifkan',
          'Pengiriman log aktivitas server telah dimatikan.'
        );

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'status') {
        const config = db.getGuildConfig(guildId);
        const logChannel = config.log_channel_id ? `<#${config.log_channel_id}>` : '`Belum Diset`';
        const statusText = config.log_enabled ? '🟢 **AKTIF**' : '🔴 **NONAKTIF**';

        const embed = ModernEmbedBuilder.baseEmbed({
          title: '📋 Status System Logging',
          fields: [
            { name: 'Status Logging', value: statusText, inline: true },
            { name: 'Channel Log Target', value: logChannel, inline: true },
            {
              name: 'Kategori Log Tercover',
              value: [
                '👤 **Member**: Join, Leave, Ban, Unban, Kick, Timeout, Timeout Removed',
                '💬 **Message**: Message Deleted, Message Edited, Attachment Deleted',
                '🔊 **Voice**: Join, Leave, Move, Mute, Unmute, Deafen',
                '⚙️ **Server**: Channel, Role, Emoji, Thread (Created/Deleted/Updated)',
                '🛡️ **Administrator Audit Logs**: Executor admin tracking'
              ].join('\n'),
              inline: false
            }
          ]
        });

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      logger.error('Error executing /logs command:', error);
      return interaction.reply({
        embeds: [ModernEmbedBuilder.error('Terjadi Kesalahan', 'Gagal memproses command logs.')],
        ephemeral: true
      });
    }
  }
};
