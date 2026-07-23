const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ModernEmbedBuilder = require('../../embeds/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Memeriksa latensi dan kecepatan respon bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sent = await interaction.reply({ content: '⚡ Memeriksa latensi...', fetchReply: true, ephemeral: true });
    const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsPing = interaction.client.ws.ping;

    const embed = ModernEmbedBuilder.baseEmbed({
      title: '🏓 Pong!',
      fields: [
        { name: '🌐 WebSocket Ping', value: `\`${wsPing}ms\``, inline: true },
        { name: '⏱️ Roundtrip Latency', value: `\`${roundtripLatency}ms\``, inline: true }
      ]
    });

    return interaction.editReply({ content: null, embeds: [embed] });
  }
};
