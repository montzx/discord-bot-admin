const db = require('../database/database');
const ModernEmbedBuilder = require('../embeds/embedBuilder');
const logger = require('./logger');

// Lock map to prevent race conditions during message bursts
const processingChannels = new Map();

/**
 * Handle sticky message on new message event
 * @param {import('discord.js').Message} message 
 */
async function handleStickyMessage(message) {
  if (!message.guild || message.author.bot) return;

  const channelId = message.channel.id;
  const guildId = message.guild.id;

  const stickyData = db.getSticky(guildId, channelId);
  if (!stickyData) return;

  // Prevent sticky loop if this is the bot's own sticky message
  if (stickyData.message_id === message.id) return;

  // Prevent race conditions per channel
  if (processingChannels.get(channelId)) return;
  processingChannels.set(channelId, true);

  try {
    const now = Date.now();
    const cooldownMs = (stickyData.cooldown || 5) * 1000;
    const timeSinceLast = now - (stickyData.last_posted_at || 0);

    // If still in cooldown period, schedule or delay
    if (timeSinceLast < cooldownMs) {
      const remaining = cooldownMs - timeSinceLast;
      await new Promise(resolve => setTimeout(resolve, remaining));
    }

    // Attempt to delete previous sticky message
    if (stickyData.message_id) {
      try {
        const oldMsg = await message.channel.messages.fetch(stickyData.message_id).catch(() => null);
        if (oldMsg && oldMsg.deletable) {
          await oldMsg.delete().catch(() => {});
        }
      } catch (err) {
        logger.warn(`Could not delete old sticky message in channel ${channelId}: ${err.message}`);
      }
    }

    // Build payload to send
    const payload = {};
    if (stickyData.content) {
      payload.content = stickyData.content;
    }

    if (stickyData.title || stickyData.embed_description) {
      const embed = ModernEmbedBuilder.baseEmbed({
        title: stickyData.title || '📌 Sticky Message',
        description: stickyData.embed_description || '',
        footerText: '📌 Sticky Message • Will stay at bottom'
      });
      payload.embeds = [embed];
    }

    if (Object.keys(payload).length === 0) {
      processingChannels.delete(channelId);
      return;
    }

    // Send new sticky message
    const newMsg = await message.channel.send(payload);

    // Update DB with new message ID
    db.updateStickyMessageId(guildId, channelId, newMsg.id);
  } catch (error) {
    logger.error(`Error processing sticky message in channel ${channelId}:`, error);
  } finally {
    processingChannels.delete(channelId);
  }
}

module.exports = { handleStickyMessage };
