const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../database/database');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Manajemen Sticky Message agar selalu di bagian paling bawah channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    // Subcommand: create
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Membuat Sticky Message baru pada channel tertentu')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel target Sticky Message')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('content')
            .setDescription('Teks pesan reguler (opsional jika menggunakan embed)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('title')
            .setDescription('Judul Embed Sticky (opsional)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('description')
            .setDescription('Deskripsi Embed Sticky (opsional)')
            .setRequired(false)
        )
        .addIntegerOption(opt =>
          opt.setName('cooldown')
            .setDescription('Cooldown jeda pengiriman ulang dalam detik (default: 5)')
            .setMinValue(1)
            .setMaxValue(60)
            .setRequired(false)
        )
    )
    // Subcommand: edit
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Mengiubah isi Sticky Message pada channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel target Sticky Message')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('content')
            .setDescription('Teks pesan reguler baru (opsional)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('title')
            .setDescription('Judul Embed baru (opsional)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('description')
            .setDescription('Deskripsi Embed baru (opsional)')
            .setRequired(false)
        )
        .addIntegerOption(opt =>
          opt.setName('cooldown')
            .setDescription('Cooldown baru dalam detik (opsional)')
            .setMinValue(1)
            .setMaxValue(60)
            .setRequired(false)
        )
    )
    // Subcommand: delete
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('Menghapus Sticky Message dari channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel yang sticky message-nya akan dihapus')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    // Subcommand: list
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Daftar seluruh Sticky Message aktif di server ini')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    try {
      if (subcommand === 'create' || subcommand === 'edit') {
        const channel = interaction.options.getChannel('channel');
        const content = interaction.options.getString('content');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const cooldown = interaction.options.getInteger('cooldown') || 5;

        if (!content && !title && !description) {
          return interaction.reply({
            embeds: [ModernEmbedBuilder.warning('Input Kurang', 'Anda harus mengisi minimal salah satu dari: `content`, `title`, atau `description`.')],
            ephemeral: true
          });
        }

        const existingSticky = db.getSticky(guildId, channel.id);

        if (subcommand === 'create' && existingSticky) {
          return interaction.reply({
            embeds: [ModernEmbedBuilder.error('Sticky Sudah Ada', `Channel ${channel} sudah memiliki Sticky Message. Gunakan \`/sticky edit\` untuk mengubahnya.`)],
            ephemeral: true
          });
        }

        if (subcommand === 'edit' && !existingSticky) {
          return interaction.reply({
            embeds: [ModernEmbedBuilder.error('Sticky Tidak Ditemukan', `Channel ${channel} belum memiliki Sticky Message. Gunakan \`/sticky create\` terlebih dahulu.`)],
            ephemeral: true
          });
        }

        // Send initial message
        const payload = {};
        if (content) payload.content = content;
        if (title || description) {
          const embed = ModernEmbedBuilder.baseEmbed({
            title: title || '📌 Sticky Message',
            description: description || '',
            footerText: '📌 Sticky Message • Always at bottom'
          });
          payload.embeds = [embed];
        }

        // Hapus pesan lama jika ada
        if (existingSticky && existingSticky.message_id) {
          const oldMsg = await channel.messages.fetch(existingSticky.message_id).catch(() => null);
          if (oldMsg && oldMsg.deletable) {
            await oldMsg.delete().catch(() => {});
          }
        }

        const initialMsg = await channel.send(payload);
        db.setSticky(guildId, channel.id, initialMsg.id, content, title, description, cooldown);

        const actionWord = subcommand === 'create' ? 'Dibuat' : 'Diperbarui';
        return interaction.reply({
          embeds: [ModernEmbedBuilder.success(`Sticky Message Berhasil ${actionWord}`, `Sticky Message telah aktif di channel ${channel} dengan cooldown ${cooldown} detik.`)],
          ephemeral: true
        });
      }

      if (subcommand === 'delete') {
        const channel = interaction.options.getChannel('channel');
        const existingSticky = db.getSticky(guildId, channel.id);

        if (!existingSticky) {
          return interaction.reply({
            embeds: [ModernEmbedBuilder.warning('Tidak Ada Sticky', `Channel ${channel} tidak memiliki Sticky Message aktif.`)],
            ephemeral: true
          });
        }

        if (existingSticky.message_id) {
          const msg = await channel.messages.fetch(existingSticky.message_id).catch(() => null);
          if (msg && msg.deletable) {
            await msg.delete().catch(() => {});
          }
        }

        db.deleteSticky(guildId, channel.id);

        return interaction.reply({
          embeds: [ModernEmbedBuilder.success('Sticky Message Dihapus', `Sticky Message di channel ${channel} telah dihapus dari database.`)],
          ephemeral: true
        });
      }

      if (subcommand === 'list') {
        const stickyList = db.getAllSticky(guildId);

        if (stickyList.length === 0) {
          return interaction.reply({
            embeds: [ModernEmbedBuilder.info('Daftar Sticky Message', 'Belum ada Sticky Message yang dikonfigurasi di server ini.')],
            ephemeral: true
          });
        }

        const fields = stickyList.map((item, idx) => {
          const channel = interaction.guild.channels.cache.get(item.channel_id);
          const channelMention = channel ? `${channel}` : `ID: ${item.channel_id} (Dihapus)`;
          const preview = item.title || item.content || item.embed_description || 'Pesan Kosong';
          return {
            name: `${idx + 1}. Channel: ${channelMention}`,
            value: `**Preview:** ${preview.substring(0, 100)}\n**Cooldown:** ${item.cooldown} detik`,
            inline: false
          };
        });

        const embed = ModernEmbedBuilder.baseEmbed({
          title: '📌 Daftar Sticky Messages Aktif',
          description: `Total terdapat **${stickyList.length}** Sticky Message di server ini:`,
          fields: fields
        });

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      logger.error('Error executing /sticky command:', error);
      return interaction.reply({
        embeds: [ModernEmbedBuilder.error('Terjadi Kesalahan', 'Gagal memproses command sticky.')],
        ephemeral: true
      });
    }
  }
};
