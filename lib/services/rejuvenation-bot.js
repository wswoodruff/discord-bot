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

        console.log('message', message);

        // Example bot response to a command
        if (message.content === '!ping') {
            await message.channel.send('Pong!');
        }
    }

    async onMessageEdit(message) {

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
            console.log(`Message edited in #${message.channel.name} of guild "${message.guild.name}": "${message.content}"`);

            const owners = await guildService.getOwners(message.guild.id);

            console.log('eedddited message', message);

            // Use the buildMessage function to create the complete message object
            const richMessage = discordService.buildMessage({
                title: 'Message Edited',
                description: `A message was edited in **#${message.channel.name}**.`,
                color: '#5865F2',
                thumbnail: THUMBNAILS.edit,
                fields: [
                    { name: 'User', value: `**Name:** ${message.author?.tag}\n**Mention:** <@${message.author?.id}>\n**ID:** ${message.author?.id}`, inline: true },
                    { name: 'Channel', value: `**Name:** #${message.channel.name}\n**Mention:** <#${message.channel.id}>\n**ID:** ${message.channel.id}`, inline: true },
                    { name: 'Message Timestamp', value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: 'Before', value: `${message.oldContent || '*No previous content*'}`, inline: true },
                    { name: 'After', value: `${message.content || '*No content*'}`, inline: true }
                ],
                footer: { text: `Message ID: ${message.id}` },
                timestamp: new Date(),
                buttons: [
                    {
                        label: 'Jump to message',
                        style: ButtonStyle.Link,
                        url: `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`
                    }
                ]
            });

            // Send a DM to each owner
            for (const [moderatorId, moderator] of owners) {
                try {
                    await moderator.send(richMessage);
                    console.log(`Notified moderator ${moderator.user.tag} (ID: ${moderatorId}) about the edited message.`);
                }
                catch (error) {
                    console.error(`Failed to send DM to moderator ${moderator.user.tag} (ID: ${moderatorId}):`, error);
                }
            }
        }
        catch (error) {
            // Log error with as much context as possible
            console.error('Error while handling message edit: ', error);

            // Log partial details if full message info is not available
            console.error(`Failed to process message edit. Partial message details: ID=${message.id}, Channel=${message.channel.name}, Content="${message.content || 'Unavailable'}"`);
        }
    }

    async onMessageDelete(message) {

        return;

        const { guildService } = this.server.services();

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

            // Send a DM to each moderator
            // for (const [moderatorId, moderator] of mods) {
            //     try {
            //         await moderator.send(`Message deleted in #${message.channel.name}:\n"${message.content}"\n- Sent by: ${message.author?.tag ?? 'Unknown User'}`);
            //         console.log(`Notified moderator ${moderator.user.tag} (ID: ${moderatorId}) about the deleted message.`);
            //     }
            //     catch (error) {
            //         console.error(`Failed to send DM to moderator ${moderator.user.tag} (ID: ${moderatorId}):`, error);
            //     }
            // }
        }
        catch (error) {
            // Log error with as much context as possible
            console.error('Error while handling message deletion: ', error);

            // Log partial details if full message info is not available
            console.error(`Failed to process message deletion. Partial message details: ID=${message.id}, Channel=${message.channel.name}, Content="${message.content || 'Unavailable'}"`);
        }
    }
};