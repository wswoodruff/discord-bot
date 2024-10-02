'use strict';

const Schmervice = require('@hapipal/schmervice');

const { ButtonStyle } = require('discord.js');

const THUMBNAILS = {
    edit: 'https://i.imgur.com/iyzeC70.png',
    join: 'https://i.imgur.com/MBG0eBp.png',
    leave: 'https://i.imgur.com/A03traX.png',
    delete: 'https://i.imgur.com/c8GFlt7.png'
};

const IGNORED_CHANNEL_IDS = [
    '1177771803242938379', // #owners
    '1184561065921609880', // #member-suggestions
    '1209732783371718666' // #owners-meeting-room
];

const WELCOME_CHANNEL_NAME = 'welcome';

module.exports = class RejuvenationBotService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);

        this.webhooks = {
            botLogs: '1288626391394422855'
        };
    }

    initialize() {

        const { discordService } = this.server.services();

        const { nodeEnv } = this.options;

        console.log('Initializing rejuvenation bot!');

        discordService.registerListener({
            type: 'onMessage',
            func: this.onMessage.bind(this)
        });

        if (nodeEnv !== 'development') {
            discordService.registerListener({
                type: 'onMemberJoin',
                func: this.onMemberJoin.bind(this)
            });

            discordService.registerListener({
                type: 'onMemberLeave',
                func: this.onMemberLeave.bind(this)
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
    }

    async messageModerators({ guildId, message }) {

        const { guildService } = this.server.services();

        const mods = await guildService.getOwners(guildId);

        // Send a DM to each owner
        for (const [moderatorId, moderator] of mods) {
            try {
                await moderator.send(message);
                console.log(`Notified moderator ${moderator.user.tag} (ID: ${moderatorId}).`);
            }
            catch (error) {
                console.error(`Failed to send DM to moderator ${moderator.user.tag} (ID: ${moderatorId}):`, error);
            }
        }
    }

    async messageOwners({ guildId, message }) {

        const { guildService } = this.server.services();

        const owners = await guildService.getOwners(guildId);

        // Send a DM to each owner
        for (const [ownerId, owner] of owners) {
            try {
                await owner.send(message);
                console.log(`Notified owner ${owner.user.tag} (ID: ${ownerId}).`);
            }
            catch (error) {
                console.error(`Failed to send DM to owner ${owner.user.tag} (ID: ${ownerId}):`, error);
            }
        }
    }

    async onMemberJoin(member) {

        const { discordService } = this.server.services();

        // User's account creation date
        const accountCreationDate = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`;

        const richMessage = discordService.buildMessage({
            title: 'Member Joined',
            description: `A new member has joined the server: <@${member.user.id}>`,
            color: '#57F287', // Green color for joins
            thumbnail: THUMBNAILS.join,
            author: {
                name: member.user.tag,  // Display the username as the author name
                iconURL: member.user.displayAvatarURL({ dynamic: true })  // Avatar icon in the author section
            },
            fields: [
                { name: 'User', value: `**Name:** ${member.user.tag}\n**ID:** ${member.user.id}`, inline: true },
                { name: 'Joined Discord At', value: `${accountCreationDate}`, inline: true },  // New field for account creation date
                { name: 'Joined Server At', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false }  // Server join date
            ],
            timestamp: new Date()
        });

        await this.messageOwners({
            guildId: member.guild.id,
            message: richMessage
        });

        // Find the welcome channel by name (or use an ID for more reliability)
        const welcomeChannel = member.guild.channels.cache.find((channel) => channel.name === WELCOME_CHANNEL_NAME);

        // If the welcome channel is found, send the custom message
        if (welcomeChannel) {
            const welcomeMessage = `Heyo <@${member.user.id}> 👋\nHappy to have you here!\n\nWhen you get a chance, please react with :white_check_mark: on [this post](https://discord.com/channels/1177769276153810974/1200219167287156856/1200764199203258458) to acknowledge the rules and get verified. Thanks for joining! 🎉`;

            // Send the formatted welcome message
            await welcomeChannel.send(welcomeMessage);
        }
    }

    async onMemberLeave(member) {

        const { discordService } = this.server.services();

        // User's account creation date
        const accountCreationDate = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`;

        const richMessage = discordService.buildMessage({
            title: 'Member Left',
            description: `A member has left the server: <@${member.user.id}>`,
            color: '#ED4245', // Red color for leaves
            thumbnail: THUMBNAILS.leave,
            author: {
                name: member.user.tag,  // Display the username as the author name
                iconURL: member.user.displayAvatarURL({ dynamic: true })  // Avatar icon in the author section
            },
            fields: [
                { name: 'User', value: `**Name:** ${member.user.tag}\n**ID:** ${member.user.id}`, inline: true },
                { name: 'Joined Discord At', value: `${accountCreationDate}`, inline: true },  // Display the Discord account creation date
                { name: 'Joined Server At', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },  // Server join date
                { name: 'Left Server At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }  // Timestamp for when the user left
            ],
            timestamp: new Date()
        });

        await this.messageOwners({
            guildId: member.guild.id,
            message: richMessage
        });
    }

    async onMessage(message) {

        // Example bot response to a command
        if (message.content === '!ping') {
            await message.channel.send('Pong!');
        }
    }

    async onMessageEdit(oldMessage, newMessage) {

        const { discordService } = this.server.services();

        if (IGNORED_CHANNEL_IDS.includes(oldMessage.channel.id)) {
            console.log(`Message deletion from ignored channel; ignoring.`);
            return;
        }

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

            await this.messageOwners({
                guildId,
                message: richMessage
            });
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
            discordService
        } = this.server.services();

        if (IGNORED_CHANNEL_IDS.includes(message.channel.id)) {
            console.log(`Message deletion from ignored channel; ignoring.`);
            return;
        }

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

            // Create the rich message for deletion notification
            const richMessage = discordService.buildMessage({
                title: 'Message Deleted',
                description: `A message was deleted in **#${message.channel.name}**.`,
                color: '#ED4245', // Typically red for delete notifications
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

            await this.messageModerators({
                guildId: message.guild.id,
                message: richMessage
            });
        }
        catch (error) {
            // Log error with as much context as possible
            console.error('Error while handling message deletion: ', error);

            // Log partial details if full message info is not available
            console.error(`Failed to process message deletion. Partial message details: ID=${message.id}, Channel=${message.channel.name}, Content="${message.content || 'Unavailable'}"`);
        }
    }
};
