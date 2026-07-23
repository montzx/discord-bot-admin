const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Pengaturan dan manajemen sistem Welcome Member Baru')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    // Subcommand: setup
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Menyiapkan channel dan pesan Welcome Embed')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel tempat pesan Welcome akan dikirim')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('message')
            .setDescription('Format pesan (Gunakan: {user}, {server}, {memberCount}, {rules})')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('title')
            .setDescription('Judul Embed Welcome (opsional)')
            .setRequired(false)
        )
    )
    // Subcommand: edit
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Mengubah format pesan atau judul Welcome Embed')
        .addStringOption(opt =>
          opt.setName('message')
            .setDescription('Pesan baru (Gunakan: {user}, {server}, {memberCount}, {rules})')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('title')
            .setDescription('Judul Embed baru (opsional)')
            .setRequired(false)
        )
    )
    // Subcommand: disable
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Nonaktifkan sistem Welcome')
    )
    // Subcommand: preview
    .addSubcommand(sub =>
      sub.setName('preview')
        .setDescription('Pratinjau pesan Welcome Embed saat ini')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    try {
      if (subcommand === 'setup') {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message') || 'Selamat datang {user} di **{server}**!\n\nJangan lupa membaca peraturan di {rules}!';
        const title = interaction.options.getString('title') || '👋 Selamat Datang di Server!';

        db.updateGuildConfig(guildId, {
          welcome_channel_id: channel.id,
          welcome_enabled: 1,
          welcome_message: message,
          welcome_title: title
        });

        return interaction.reply({
          embeds: [ModernEmbedBuilder.success('Welcome System Berhasil Dikonfigurasi', `Sistem Welcome telah diaktifkan di channel ${channel}.\n\nPesan:\n> ${message}`)],
          ephemeral: true
        });
      }

      if (subcommand === 'edit') {
        const config = db.getGuildConfig(guildId);
        if (!config.welcome_channel_id) {
          return interaction.reply({
            embeds: [ModernEmbedBuilder.error('Welcome Belum Dikonfigurasi', 'Gunakan `/welcome setup` terlebih dahulu.')],
            ephemeral: true
          });
        }

        const message = interaction.options.getString('message') || config.welcome_message;
        const title = interaction.options.getString('title') || config.welcome_title;

        db.updateGuildConfig(guildId, {
          welcome_message: message,
          welcome_title: title,
          welcome_enabled: 1
        });

        return interaction.reply({
          embeds: [ModernEmbedBuilder.success('Welcome System Diperbarui', `Pesan Welcome telah diperbarui.\n\nPesan Baru:\n> ${message}`)],
          ephemeral: true
        });
      }

      if (subcommand === 'disable') {
        db.updateGuildConfig(guildId, { welcome_enabled: 0 });
        return interaction.reply({
          embeds: [ModernEmbedBuilder.warning('Welcome System Dinonaktifkan', 'Sistem Welcome member baru telah dinonaktifkan.')],
          ephemeral: true
        });
      }

      if (subcommand === 'preview') {
        const config = db.getGuildConfig(guildId);
        const rules = db.getRules(guildId);
        const rulesChannel = rules ? `<#${rules.channel_id}>` : '#rules';

        const rawMessage = config.welcome_message || 'Selamat datang {user} di **{server}**!\nMohon baca {rules}!';
        const parsedMessage = rawMessage
          .replace(/{user}/g, `${interaction.user}`)
          .replace(/{server}/g, interaction.guild.name)
          .replace(/{memberCount}/g, interaction.guild.memberCount.toString())
          .replace(/{rules}/g, rulesChannel);

        const embed = ModernEmbedBuilder.baseEmbed({
          title: config.welcome_title || '👋 Selamat Datang!',
          description: parsedMessage,
          thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
          footerText: `Member #${interaction.guild.memberCount} • Welcome Preview`
        });

        return interaction.reply({
          content: '🔎 **Pratinjau Welcome Embed:**',
          embeds: [embed],
          ephemeral: true
        });
      }
    } catch (error) {
      logger.error('Error executing /welcome command:', error);
      return interaction.reply({
        embeds: [ModernEmbedBuilder.error('Terjadi Kesalahan', 'Gagal memproses command welcome.')],
        ephemeral: true
      });
    }
  }
};
