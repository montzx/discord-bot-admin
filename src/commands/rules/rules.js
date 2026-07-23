const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Pengaturan dan manajemen Rules Embed Server')
    // Subcommand: setup
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Menyiapkan dan mengirim Rules Embed baru ke channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel tempat Rules akan dikirim')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('rules_list')
            .setDescription('Daftar peraturan (pisahkan antar poin dengan titik koma ";")')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('title')
            .setDescription('Judul Embed Rules (opsional)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('description')
            .setDescription('Deskripsi pembuka Rules (opsional)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('image_url')
            .setDescription('URL Banner/Gambar Embed (opsional)')
            .setRequired(false)
        )
    )
    // Subcommand: update
    .addSubcommand(sub =>
      sub.setName('update')
        .setDescription('Memperbarui isi Rules Embed yang sudah ada (otomatis buat ulang jika terhapus)')
        .addStringOption(opt =>
          opt.setName('rules_list')
            .setDescription('Daftar peraturan baru (pisahkan dengan ";")')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('title')
            .setDescription('Judul Embed baru (opsional)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('description')
            .setDescription('Deskripsi pembuka baru (opsional)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('image_url')
            .setDescription('URL Banner/Gambar Embed baru (opsional)')
            .setRequired(false)
        )
    )
    // Subcommand: delete
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('Menghapus Rules Embed dari channel dan database')
    )
    // Subcommand: preview
    .addSubcommand(sub =>
      sub.setName('preview')
        .setDescription('Menampilkan pratinjau Embed Rules tanpa menyimpannya')
        .addStringOption(opt =>
          opt.setName('rules_list')
            .setDescription('Daftar peraturan (pisahkan dengan ";")')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('title')
            .setDescription('Judul Embed (opsional)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('description')
            .setDescription('Deskripsi pembuka (opsional)')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    try {
      if (subcommand === 'setup') {
        const channel = interaction.options.getChannel('channel');
        const rulesRaw = interaction.options.getString('rules_list');
        const title = interaction.options.getString('title') || '📜 SERVER RULES & REGULATIONS';
        const description = interaction.options.getString('description') || 'Mohon patuhi seluruh peraturan di bawah ini demi menjaga kenyamanan bersama:';
        const imageUrl = interaction.options.getString('image_url');

        const rulesArray = rulesRaw.split(';').map(r => r.trim()).filter(r => r.length > 0);

        const embed = ModernEmbedBuilder.baseEmbed({
          title: title,
          description: description,
          image: imageUrl,
          footerText: '📜 Server Rules • Patuhi Peraturan yang Berlaku'
        });

        rulesArray.forEach((rule, index) => {
          embed.addFields({ name: `📌 Peraturan #${index + 1}`, value: rule, inline: false });
        });

        const sentMessage = await channel.send({ embeds: [embed] });

        // Save to Database
        db.setRules(guildId, channel.id, sentMessage.id, rulesArray, title, description, '#0099FF', imageUrl);
        db.updateGuildConfig(guildId, { rules_channel_id: channel.id, rules_message_id: sentMessage.id });

        return interaction.reply({
          embeds: [ModernEmbedBuilder.success('Rules Berhasil Disiapkan', `Embed Rules telah dikirim ke channel ${channel} dan disimpan di database.`)],
          ephemeral: true
        });
      }

      if (subcommand === 'update') {
        const existingRules = db.getRules(guildId);
        if (!existingRules) {
          return interaction.reply({
            embeds: [ModernEmbedBuilder.error('Rules Belum Disiapkan', 'Gunakan command `/rules setup` terlebih dahulu untuk menyiapkan Rules.')],
            ephemeral: true
          });
        }

        const rulesRaw = interaction.options.getString('rules_list');
        const title = interaction.options.getString('title') || existingRules.title;
        const description = interaction.options.getString('description') || existingRules.description;
        const imageUrl = interaction.options.getString('image_url') || existingRules.image_url;

        const rulesArray = rulesRaw.split(';').map(r => r.trim()).filter(r => r.length > 0);

        const channel = interaction.guild.channels.cache.get(existingRules.channel_id);
        if (!channel) {
          return interaction.reply({
            embeds: [ModernEmbedBuilder.error('Channel Tidak Ditemukan', 'Channel Rules yang terdaftar sudah tidak ada.')],
            ephemeral: true
          });
        }

        const embed = ModernEmbedBuilder.baseEmbed({
          title: title,
          description: description,
          image: imageUrl,
          footerText: '📜 Server Rules • Updated'
        });

        rulesArray.forEach((rule, index) => {
          embed.addFields({ name: `📌 Peraturan #${index + 1}`, value: rule, inline: false });
        });

        let targetMessage = null;
        if (existingRules.message_id) {
          targetMessage = await channel.messages.fetch(existingRules.message_id).catch(() => null);
        }

        // Re-create message if deleted manually
        if (!targetMessage) {
          logger.info(`Rules message was deleted in channel ${channel.id}. Re-creating new rules embed.`);
          targetMessage = await channel.send({ embeds: [embed] });
        } else {
          await targetMessage.edit({ embeds: [embed] });
        }

        // Update Database
        db.setRules(guildId, channel.id, targetMessage.id, rulesArray, title, description, '#0099FF', imageUrl);

        return interaction.reply({
          embeds: [ModernEmbedBuilder.success('Rules Berhasil Diperbarui', `Rules Embed di ${channel} telah berhasil diperbarui.`)],
          ephemeral: true
        });
      }

      if (subcommand === 'delete') {
        const existingRules = db.getRules(guildId);
        if (!existingRules) {
          return interaction.reply({
            embeds: [ModernEmbedBuilder.warning('Tidak Ada Rules', 'Belum ada Rules yang terkonfigurasi di server ini.')],
            ephemeral: true
          });
        }

        const channel = interaction.guild.channels.cache.get(existingRules.channel_id);
        if (channel && existingRules.message_id) {
          const msg = await channel.messages.fetch(existingRules.message_id).catch(() => null);
          if (msg && msg.deletable) {
            await msg.delete().catch(() => {});
          }
        }

        db.deleteRules(guildId);
        db.updateGuildConfig(guildId, { rules_channel_id: null, rules_message_id: null });

        return interaction.reply({
          embeds: [ModernEmbedBuilder.success('Rules Dihapus', 'Rules Embed dan data di database telah berhasil dihapus.')],
          ephemeral: true
        });
      }

      if (subcommand === 'preview') {
        const rulesRaw = interaction.options.getString('rules_list');
        const title = interaction.options.getString('title') || '📜 PREVIEW: SERVER RULES';
        const description = interaction.options.getString('description') || 'Ini adalah pratinjau tampilan Rules:';

        const rulesArray = rulesRaw.split(';').map(r => r.trim()).filter(r => r.length > 0);

        const embed = ModernEmbedBuilder.baseEmbed({
          title: title,
          description: description,
          footerText: '🔍 Pratinjau Rules (Tidak Disimpan)'
        });

        rulesArray.forEach((rule, index) => {
          embed.addFields({ name: `📌 Peraturan #${index + 1}`, value: rule, inline: false });
        });

        return interaction.reply({
          content: '🔎 **Pratinjau Rules Embed:**',
          embeds: [embed],
          ephemeral: true
        });
      }
    } catch (error) {
      logger.error('Error executing /rules command:', error);
      return interaction.reply({
        embeds: [ModernEmbedBuilder.error('Terjadi Kesalahan', 'Gagal memproses command rules.')],
        ephemeral: true
      });
    }
  }
};
