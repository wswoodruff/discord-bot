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

const EMOJI = {
    turt_amazed: '1291567304831795346',
    turt_banan: '1291567783645155408',
    turt_birthday: '1291567799491231755',
    turt_blue_heart: '1291567811117977641',
    turt_coffee: '1291567824002744421',
    turt_confounded: '1291567883616256013',
    turt_cool: '1291567898728333356',
    turt_dizzy: '1291567913584824330',
    turt_dog: '1291567927203467315',
    turt_flushed: '1291567942634311801',
    turt_fruit_hat: '1291567963417346109',
    turt_happy: '1291567978235822080',
    turt_headphones: '1291567996371992649',
    turt_heart: '1291568014969540651',
    turt_hearts: '1291568037115330651',
    turt_milk: '1291568056165732424',
    turt_surprised: '1291568080660729940',
    turt_rofl: '1291568127481479320',
    turt_sad: '1291568148025311302',
    turt_strawberry: '1291568166388109395',
    turt_sun: '1291568184650104832',
    turt_upside_down: '1291568200810500158',
    turt_uwu: '1291568218548342794',
    turt_yum: '1291568233647706174',
    nnnoooooooooo: '1291568248529227888'
};

const EMOJI_REACTION_MAP = [
    { partial: 'banana', emoji: EMOJI.turt_banan },
    { partial: 'nooooo', emoji: EMOJI.nnnoooooooooo }, // Will include, ex: 'nnnnooooooooo'
    { partial: 'surprised', emoji: EMOJI.turt_surprised },
    { partial: 'rofl', emoji: EMOJI.turt_rofl },
    { partial: 'strawberry', emoji: EMOJI.turt_strawberry },
    { partial: 'milk', emoji: EMOJI.turt_milk },
    { partial: 'cool', emoji: EMOJI.turt_cool },
    { partial: 'yay!', emoji: '🎉' },
    { partial: 'hooray!', emoji: '🎉' },
    { partial: 'morning!', emoji: EMOJI.turt_sun },
    { partial: 'this is why we can\'t have nice things', emoji: EMOJI.nnnoooooooooo },
    { partial: 'birthday', emoji: EMOJI.turt_birthday }
];

const REACTION_GIFS = {
    skeletor: 'https://i.imgur.com/IK7BEBp.gif',
    disappointed: 'https://media1.tenor.com/m/6YpqK8I0NBoAAAAd/disappointed-hands-on-hips.gif',
    shrimpleAsThat: 'https://tenor.com/view/shrimp-simple-its-shrimple-gif-25735431'
};

const REACTION_GIFS_MAP = [
    { partial: 'arghhh', gif: REACTION_GIFS.skeletor },
    { partial: 'arrgghhh', gif: REACTION_GIFS.skeletor },
    { partial: '!disappointed', gif: REACTION_GIFS.disappointed },
    { partial: '!handsonhips', gif: REACTION_GIFS.disappointed },
    { partial: 'as shrimple as that', gif: REACTION_GIFS.shrimpleAsThat }
];

const WELCOME_CHANNEL_NAME = 'welcome';
const BOT_LOGS_CHANNEL_NAME = 'bot-logs';

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

        if (nodeEnv !== 'development') {
            discordService.registerListener({
                type: 'onMessage',
                func: this.onMessage.bind(this)
            });

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

    async onMessage(message) {

        const content = message.content.toLowerCase();

        if (content.includes('!ping')) {
            await message.channel.send('Pong!');
        }

        for (const { partial, emoji } of EMOJI_REACTION_MAP) {

            if (content.includes(partial)) {
                await message.react(emoji);
            }
        }

        for (const { partial, gif } of REACTION_GIFS_MAP) {

            if (content.includes(partial)) {
                await message.channel.send(gif);
            }
        }
    }

    async onMemberJoin(member) {

        const { discordService } = this.server.services();

        // User's account creation date
        const accountCreationDate = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`;

        const richModLogMessage = discordService.buildMessage({
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
            message: richModLogMessage
        });

        let channels = await member.guild.channels.cache;

        let welcomeChannel = channels.find((channel) => channel.name === WELCOME_CHANNEL_NAME);

        if (!welcomeChannel) {
            channels = await member.guild.channels.fetch();
            welcomeChannel = channels.find((channel) => channel.name === WELCOME_CHANNEL_NAME);
        }

        // If the welcome channel is found, send the welcome messages
        if (welcomeChannel) {

            const richWelcomeMessage = {
                title: `🌟 Welcome <@${member.user.id}> 🌟`,
                description: `Welcome to Rejuvenation - a Faithful Community! 🎉✨`,
                color: '#FF8C00',
                fields: [
                    {
                        name: 'Dear Brothers and Sisters in Christ,',
                        value: `We are delighted to extend a heartfelt welcome to you in the name of our Lord and Savior, Jesus Christ. 🙏✨ Whether you are a long-time believer or someone exploring their faith, you've found a home here.\n\nAt Rejuvenation, we aim to create a Christ-centered community where we can share our faith, uplift one another, and grow together in the love and wisdom of God. Feel free to engage in discussions, share your favorite Bible verses, or simply find comfort in fellowship.`
                    },
                    {
                        name: '🤝 Community Guidelines:',
                        value: `
        - **Love and Respect:** Treat others with the love and respect that Christ has shown us.
        - **Positive Vibes:** Foster an atmosphere of positivity, encouragement, and understanding.
        - **Scriptural Foundation:** Ground discussions in the teachings of the Bible.
        - **Prayer Support:** Lift each other up in prayer and support one another.`
                    },
                    {
                        name: 'Suggestions?',
                        value: 'Use the `/suggest` command to submit server suggestions or feedback. These will not be shown publicly and will be reviewed by server staff.'
                    },
                    {
                        name: '\u200B',  // This adds an empty field as a separator
                        value: `Remember, this server is a reflection of God's love, and we're here to strengthen each other on our Christian walk. We're blessed to have you with us!`
                    }
                ],
                footer: {
                    text: 'May the grace and peace of our Lord Jesus Christ be with you always. 🕊️🌈\nIn His love,\nRejuvenation Server Staff'
                },
                timestamp: new Date()
            };

            // Send initial welcome msg
            await welcomeChannel.send(richWelcomeMessage);

            await new Promise((res) => setTimeout(res, 3000));

            const richRulesInvitation = {
                content: `Heyo <@${member.user.id}> 👋\nHappy to have you here!`,
                description: `When you get a chance, please click the button below to review and react with :white_check_mark: on the rules to get verified. Thanks for joining! 🎉`,
                color: '#FF8C00',
                footer: {
                    text: `Welcome to the server, ${member.user.username}! 🎉`
                },
                buttons: [
                    {
                        label: 'Please Acknowledge the Rules',
                        style: ButtonStyle.Link,
                        url: 'https://discord.com/channels/1177769276153810974/1200219167287156856/1200764199203258458',
                        emoji: '📜'
                    }
                ]
            };

            // Send follow-up invitation to react with :white_check_mark: on the rules
            await welcomeChannel.send(richRulesInvitation);
        }

        const botLogsChannel = channels.find((channel) => channel.name === BOT_LOGS_CHANNEL_NAME);

        // If the bot-logs channel is found, send the custom message
        if (botLogsChannel) {
            // Send the member joined message
            await botLogsChannel.send(richModLogMessage);
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

        let channels = await member.guild.channels.cache;

        let botLogsChannel = member.guild.channels.cache.find((channel) => channel.name === BOT_LOGS_CHANNEL_NAME);

        if (!botLogsChannel) {
            channels = await member.guild.channels.fetch();
            botLogsChannel = channels.find((channel) => channel.name === BOT_LOGS_CHANNEL_NAME);
        }

        // If the bot-logs channel is found, send the custom message
        if (botLogsChannel) {
            // Send the member joined message
            await botLogsChannel.send(richMessage);
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
                    {
                        name: 'User',
                        value: `**Name:** ${message.author?.tag}\n**Mention:** <@${message.author?.id}>\n**ID:** ${message.author?.id}`,
                        inline: true
                    },
                    {
                        name: 'Channel',
                        value: `**Name:** #${message.channel.name}\n**Mention:** <#${message.channel.id}>\n**ID:** ${message.channel.id}`,
                        inline: true
                    },
                    {
                        name: 'Message Timestamp',
                        value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`,
                        inline: false
                    },
                    {
                        name: 'Deleted Message',
                        value: `${message.content || '*No content available*'}`,
                        inline: false
                    }
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

    async messageModerators({ guildId, message }) {

        const { guildService } = this.server.services();

        const mods = await guildService.getModerators(guildId);

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
};
