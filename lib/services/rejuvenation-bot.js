'use strict';

const Schmervice = require('@hapipal/schmervice');

const { ButtonStyle } = require('discord.js');

const THUMBNAILS = {
    edit: 'https://i.imgur.com/iyzeC70.png',
    join: 'https://i.imgur.com/MBG0eBp.png',
    leave: 'https://i.imgur.com/A03traX.png',
    delete: 'https://i.imgur.com/c8GFlt7.png'
};

module.exports = class RejuvenationBotService extends Schmervice.Service {

    constructor(server) {

        super(server);

        this.webhooks = {
            botLogs: '1288626391394422855'
        };
    }

    initialize() {

        const { discordService } = this.server.services();

        console.log('Initializing rejuvenation bot!');

        discordService.registerListener({
            type: 'onMessage',
            func: this.onMessage.bind(this)
        });

        discordService.registerListener({
            type: 'onMessageEdit',
            func: this.onMessageEdit.bind(this)
        });

        discordService.registerListener({
            type: 'onMessageDelete',
            func: this.onMessageDelete.bind(this)
        });
    }

    async onMessage(message) {

        // Example bot response to a command
        if (message.content === '!ping') {
            await message.channel.send('Pong!');
        }
    }

    async onMessageEdit(oldMessage, newMessage) {

        const { guildService, discordService } = this.server.services();

        // Handle partial messages
        if (oldMessage.partial) {
            try {
                oldMessage = await oldMessage.fetch();
            }
            catch (error) {
                console.error('Could not fetch old message:', error);
                return;
            }
        }

        if (newMessage.partial) {
            try {
                newMessage = await newMessage.fetch();
            }
            catch (error) {
                console.error('Could not fetch new message:', error);
                return;
            }
        }

        // Ignore bot messages to prevent loops
        if (newMessage.author.bot) {
            return;
        }

        try {
            // Use newMessage.guild.id if oldMessage.guild.id is not available
            const guildId = oldMessage.guild?.id || newMessage.guild?.id;
            if (!guildId) {
                console.error('Guild ID is not available.');
                return;
            }

            const mods = await guildService.getModerators(guildId);

            // Use the buildMessage function to create the complete message object
            const richMessage = discordService.buildMessage({
                title: 'Message Edited',
                description: `A message was edited in **#${oldMessage.channel?.name || newMessage.channel?.name}**.`,
                color: '#5865F2',
                thumbnail: THUMBNAILS.edit,
                fields: [
                    {
                        name: 'User',
                        value: `**Name:** ${oldMessage.author?.tag || newMessage.author?.tag}\n**Mention:** <@${oldMessage.author?.id || newMessage.author?.id}>\n**ID:** ${oldMessage.author?.id || newMessage.author?.id}`,
                        inline: true
                    },
                    {
                        name: 'Channel',
                        value: `**Name:** #${oldMessage.channel?.name || newMessage.channel?.name}\n**Mention:** <#${oldMessage.channel?.id || newMessage.channel?.id}>\n**ID:** ${oldMessage.channel?.id || newMessage.channel?.id}`,
                        inline: true
                    },
                    {
                        name: 'Message Timestamp',
                        value: `<t:${Math.floor((oldMessage.createdTimestamp || newMessage.createdTimestamp) / 1000)}:F>`,
                        inline: false
                    },
                    {
                        name: 'Before',
                        value: `${oldMessage.content || '*No content*'}`,
                        inline: true
                    },
                    {
                        name: 'After',
                        value: `${newMessage.content || '*No content*'}`,
                        inline: true
                    }
                ],
                footer: { text: `Message ID: ${newMessage.id}` },
                timestamp: new Date(),
                buttons: [
                    {
                        label: 'Jump to message',
                        style: ButtonStyle.Link,
                        url: `https://discord.com/channels/${guildId}/${newMessage.channel.id}/${newMessage.id}`
                    }
                ]
            });

            // Send a DM to each moderator
            for (const [moderatorId, moderator] of mods) {
                try {
                    await moderator.send(richMessage);
                    console.log(`Notified moderator ${moderator.user.tag} (ID: ${moderatorId}) about the edited message.`);
                } catch (error) {
                    console.error(`Failed to send DM to moderator ${moderator.user.tag} (ID: ${moderatorId}):`, error);
                }
            }
        }
        catch (error) {
            // Log error with as much context as possible
            console.error('Error while handling message edit:', error);

            // Log partial details if full message info is not available
            console.error(`Failed to process message edit. Partial message details: ID=${oldMessage.id}, Channel=${oldMessage.channel?.name || 'Unknown'}, Content="${oldMessage.content || 'Unavailable'}"`);
        }
    }

    async onMessageDelete(message) {

        const {
            guildService,
            discordService
        } = this.server.services();

        try {
            // Capture partial details before attempting to fetch the full message
            const partialDetails = {
                id: message.id,
                authorTag: message.author?.tag ?? 'Unknown',
                channelName: message.channel.name,
                guildName: message.guild?.name ?? 'Unknown Guild',
                content: message.content ?? 'No content (partial or unavailable)'
            };

            // Attempt to fetch the full message if it's a partial
            if (message.partial) {
                try {
                    await message.fetch();
                }
                catch (error) {
                    // Log partial message information if fetch fails
                    console.error('Could not fetch the deleted partial message:', error);
                    console.error(`Partial message details: ${JSON.stringify(partialDetails)}`);
                    return;
                }
            }

            // Ensure the message content is available before continuing
            if (!message.content) {
                console.warn(`Message content not available for message ID: ${message.id}`);
                return;
            }

            if (!message.guild) {
                throw new Error('Guild information is missing for the deleted message.');
            }

            // Log the message details before notifying moderators
            console.log(`Message deleted in #${message.channel.name} of guild "${message.guild.name}": "${message.content}"`);

            const mods = await guildService.getModerators(message.guild.id);

            // Create the rich message for deletion notification
            const richMessage = discordService.buildMessage({
                title: 'Message Deleted',
                description: `A message was deleted in **#${message.channel.name}**.`,
                color: '#ED4245',  // Typically red for delete notifications
                thumbnail: THUMBNAILS.delete,
                fields: [
                    { name: 'User', value: `**Name:** ${message.author?.tag}\n**Mention:** <@${message.author?.id}>\n**ID:** ${message.author?.id}`, inline: true },
                    { name: 'Channel', value: `**Name:** #${message.channel.name}\n**Mention:** <#${message.channel.id}>\n**ID:** ${message.channel.id}`, inline: true },
                    { name: 'Message Timestamp', value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: 'Deleted Message', value: `${message.content || '*No content available*'}`, inline: false }
                ],
                footer: { text: `Message ID: ${message.id}` },
                timestamp: new Date(),
                buttons: [
                    {
                        label: 'Jump to channel',
                        style: ButtonStyle.Link,
                        url: `https://discord.com/channels/${message.guild.id}/${message.channel.id}`
                    }
                ]
            });

            // Send a DM to each owner
            for (const [moderatorId, moderator] of mods) {
                try {
                    await moderator.send(richMessage);
                    console.log(`Notified moderator ${moderator.user.tag} (ID: ${moderatorId}) about the deleted message.`);
                }
                catch (error) {
                    console.error(`Failed to send DM to moderator ${moderator.user.tag} (ID: ${moderatorId}):`, error);
                }
            }
        }
        catch (error) {
            // Log error with as much context as possible
            console.error('Error while handling message deletion: ', error);

            // Log partial details if full message info is not available
            console.error(`Failed to process message deletion. Partial message details: ID=${message.id}, Channel=${message.channel.name}, Content="${message.content || 'Unavailable'}"`);
        }
    }
};
