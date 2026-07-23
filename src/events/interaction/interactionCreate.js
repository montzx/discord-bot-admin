const { PermissionFlagsBits } = require('discord.js');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      logger.warn(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    // Double check Administrator permission
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        embeds: [ModernEmbedBuilder.error('Akses Ditolak', 'Seluruh command bot ini hanya dapat digunakan oleh Administrator.')],
        ephemeral: true
      });
    }

    try {
      logger.info(`Command Executed: /${interaction.commandName} by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name}`);
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Error executing command /${interaction.commandName}:`, error);

      const errorEmbed = ModernEmbedBuilder.error(
        'Internal Bot Error',
        'Terjadi kesalahan saat mengeksekusi perintah ini. Pengembang telah diberitahu.'
      );

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
      }
    }
  }
};
