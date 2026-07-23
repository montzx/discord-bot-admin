const { EmbedBuilder } = require('discord.js');
const config = require('../config');

class ModernEmbedBuilder {
  /**
   * Create a standardized base embed
   * @param {Object} options 
   * @returns {EmbedBuilder}
   */
  static baseEmbed(options = {}) {
    const embed = new EmbedBuilder()
      .setColor(options.color || config.colors.primary)
      .setTimestamp(options.timestamp !== false ? new Date() : null);

    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.url) embed.setURL(options.url);
    if (options.image) embed.setImage(options.image);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);

    const footerText = options.footerText || config.footerText;
    const footerIcon = options.footerIcon || null;
    embed.setFooter({ text: footerText, iconURL: footerIcon });

    if (options.fields && Array.isArray(options.fields)) {
      embed.addFields(options.fields);
    }

    return embed;
  }

  static success(title, description) {
    return this.baseEmbed({
      color: config.colors.success,
      title: `✅ ${title}`,
      description: description
    });
  }

  static error(title, description) {
    return this.baseEmbed({
      color: config.colors.error,
      title: `❌ ${title}`,
      description: description
    });
  }

  static warning(title, description) {
    return this.baseEmbed({
      color: config.colors.warning,
      title: `⚠️ ${title}`,
      description: description
    });
  }

  static info(title, description) {
    return this.baseEmbed({
      color: config.colors.info,
      title: `ℹ️ ${title}`,
      description: description
    });
  }
}

module.exports = ModernEmbedBuilder;
