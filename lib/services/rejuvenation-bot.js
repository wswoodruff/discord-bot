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
    nnnoooooooooo: '1291568248529227888',
    shrimp: '1291826818894266500',
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
    turt_yum: '1291568233647706174'
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
    { partial: 'birthday', emoji: EMOJI.turt_birthday },
    { partial: 'shrimp', emoji: EMOJI.shrimp },
    { partial: 'skrimp', emoji: EMOJI.shrimp },
    { partial: 'yum', emoji: EMOJI.turt_yum },
    { partial: 'headphones', emoji: EMOJI.turt_headphones },
    { partial: 'turt', emoji: EMOJI.turt_uwu }
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
    { partial: 'shrimple as that', gif: REACTION_GIFS.shrimpleAsThat }
];

const internals = {};

const TEXT_RESPONSE_MAP = [
    { partial: '!ping', response: 'Pong!' },
    { partial: ['days until christmas', 'days til christmas'], response: () => {

        const daysUntil = internals.daysUntilHoliday('Christmas');

        return `${daysUntil} days until Christmas 🎉!`;
    } },
    { partial: ['days until easter', 'days til easter'], response: () => {

        const daysUntil = internals.daysUntilHoliday('Easter');

        return `${daysUntil} days until Easter 🎉!`;
    } },
    { partial: '!rules', response: (_message, server) => {

        const { discordService } = server.services();

        return discordService.buildMessage({
            title: 'Rejuvenation Server Rules',
            color: '#FF8C00',
            fields: RULES.map((rule, i) => ({
                name: `${i + 1}. ${rule.name}`,
                value: rule.description
            }))
        });
    } }
];

const WELCOME_CHANNEL_NAME = 'welcome';
const BOT_LOGS_CHANNEL_NAME = 'bot-logs';
const WELCOME_CATEGORY_NAME = 'welcome';

const RULES = [
    { name: 'Be Respectful and Kind', description: 'Treat others as you would like to be treated.' },
    { name: 'No NSFW posts of any kind', description: 'This includes text, images, and links.' },
    { name: 'No Trolling of any kind', description: 'Constructive conversations only.' },
    { name: 'No posting of NSFW, False Prophecy or Server Links', description: 'We want to keep this space safe and positive.' },
    { name: 'No public shaming - if there is behavior you\'d like to address, contact a member of staff', description: 'If you have concerns, contact a staff member privately.' },
    { name: 'Do not debate without a Moderator present', description: 'Keep debates civil and supervised.' },
    { name: 'Don\'t share any personal information (Common Safety)', description: 'Keep yourself and others safe.' },
    { name: 'Do not alienate others', description: 'Include everyone and be considerate of others\' viewpoints.' },
    { name: 'Reminder this isn\'t a dating platform. So please be mindful and respectful of others.', description: 'Be mindful and respectful in interactions.' },
    { name: 'No depictions of violence of any kind (Speech, Showing of weapons, etc.)', description: 'Avoid speech, images, or showing weapons.' },
    { name: 'Do not mass dm any member unless they give permission (Will result in a kick for the first offense)', description: 'This will result in a kick for the first offense.' },
    { name: 'No asking for donations directly from members' , description: 'We\'re here to share, not solicit.' }
];

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

            discordService.registerListener({
                type: 'onButtonInteraction',
                func: this.onButtonInteraction.bind(this)
            });
        }
    }

    async onMessage(message) {

        const content = this.truncateContent(message.content).toLowerCase();

        // Ignore DM messages
        if (message.guild && message.channel.name.startsWith('welcome-')) {
            return this.handleWelcomeChannels(message);
        }

        for (const { partial, emoji } of EMOJI_REACTION_MAP) {

            const match = [].concat(partial).find((p) => content.includes(p));

            if (match) {
                await message.react(emoji);
            }
        }

        for (const { partial, gif } of REACTION_GIFS_MAP) {

            const match = [].concat(partial).find((p) => content.includes(p));

            if (match) {
                await message.reply(gif);
            }
        }

        for (let { partial, response } of TEXT_RESPONSE_MAP) {

            const match = [].concat(partial).find((p) => content.includes(p));

            if (match) {
                if (typeof response === 'function') {
                    response = response(message, this.server);
                }

                await message.reply(response);
            }
        }
    }

    async onMemberJoin(member) {

        const {
            discordService,
            guildService
        } = this.server.services();

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
                { name: 'User', value: `**Name:** ${member.user.tag}\n**ID:** ${member.user.id}`, inline: false },
                { name: 'Joined Discord At', value: `${accountCreationDate}`, inline: false },  // New field for account creation date
                { name: 'Joined Server At', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false }  // Server join date
            ],
            timestamp: new Date()
        });

        // await this.messageModerators({
        //     guildId: member.guild.id,
        //     message: richModLogMessage
        // });

        const botLogsChannel = await guildService.getChannelByName(
            member.guild.id,
            BOT_LOGS_CHANNEL_NAME
        );

        // If the bot-logs channel is found, send the custom message
        if (botLogsChannel) {
            // Send the member joined message
            await botLogsChannel.send(richModLogMessage);
        }

        const welcomeCategory = await guildService.getCategoryByName(
            member.guild,
            WELCOME_CATEGORY_NAME
        );

        // Create new channel for user and moderators
        const newWelcomeChannel = await guildService.createChannelForUserAndMods({
            guildId: member.guild.id,
            member,
            categoryId: welcomeCategory
        });

        // Send welcome messages
        await newWelcomeChannel.send(this.getWelcomeApplicationStep('Welcome1', { member }));

        await internals.wait(2000);

        await newWelcomeChannel.send(this.getWelcomeApplicationStep('Welcome2'));

        await internals.wait(2000);

        await newWelcomeChannel.send('⊹˚₊‧──────────────────────────────────────────‧₊˚⊹');
        await newWelcomeChannel.send(this.getWelcomeApplicationStep('Q1'));
    }

    async onButtonInteraction(interaction) {

        const { guildService } = this.server.services();

        // Check if the interaction is for the "accept_rules" button
        if (interaction.customId === 'accept_rules') {
            const guild = interaction.guild;
            const member = interaction.member;

            const isModerator = member.roles.cache.some((role) => role.name === 'Moderators');

            if (isModerator) {
                await interaction.reply({
                    content: 'loL ur a mod why are u clicking this button silly?',
                    ephemeral: true
                });

                return;
            }

            // Get or create the "Verified" role
            const verifiedRole = await guildService.getRoleByName(guild.id, 'Verified');

            // Assign the "Verified" role to the member
            await member.roles.add(verifiedRole);

            await interaction.reply({
                content: 'Thank you for accepting the rules! You have been verified. 🎉',
                ephemeral: false
            });
        }
    }

    async handleWelcomeChannels(message) {

        const { discordService } = this.server.services();

        // Check if the sender has a moderator role
        const isModerator = message.member.roles.cache.some((role) => role.name === 'Moderators');

        if (isModerator) {

            if (message.content.toLowerCase().includes('!approve')) {
                const richRulesMessage = discordService.buildMessage({
                    title: 'Server Rules',
                    description: `You've been approved! 👋\nHappy to have you here!\n\n**Please read and accept the rules to get verified. Thanks for joining! 🎉**`,
                    color: '#FF8C00',
                    footer: {
                        text: `Welcome to the server! 🎉`
                    },
                    fields: RULES.map((rule, i) => ({
                        name: `${i + 1}. ${rule.name}`,
                        value: rule.description
                    })),
                    buttons: [
                        {
                            label: 'Acknowledge and Accept Rules',
                            style: ButtonStyle.Success,
                            customId: 'accept_rules',
                            emoji: '✅'
                        }
                    ]
                });

                await message.channel.send(richRulesMessage);
            }

            return;
        }

        // Fetch the last 10 messages in the welcome channel
        const messages = await message.channel.messages.fetch({ limit: 10 });
        const botMessages = messages.filter((msg) => msg.author.bot);
        const lastBotMessage = botMessages.first();

        // Determine the current question step based on the last bot message content
        let nextQuestionStep = 'Q1';

        // Determine next question step
        if (!lastBotMessage) {
            nextQuestionStep = 'Q1';
        }
        else if (this.truncateContent(lastBotMessage.content).startsWith('Q1:')) {
            nextQuestionStep = 'Q2';
        }
        else if (this.truncateContent(lastBotMessage.content).startsWith('Q2:')) {
            nextQuestionStep = 'Q3';
        }
        else if (this.truncateContent(lastBotMessage.content).startsWith('Q3:')) {
            nextQuestionStep = 'Completed';
        }

        // Handle responses based on the next question step
        switch (nextQuestionStep) {
            case 'Q2':
                // Send Q2 message after user has responded to Q1
                await message.channel.send(this.getWelcomeApplicationStep('Q2'));
                break;

            case 'Q3':
                // Send Q3 message after user has responded to Q2
                await message.channel.send(this.getWelcomeApplicationStep('Q3'));
                break;

            case 'Completed':
                // Respond after Q3 has been answered
                await message.channel.send('Thank you for answering! A moderator will review your responses shortly.');
                break;

            default:
                // Do nothing to allow for conversation
                break;
        }
    }

    getWelcomeApplicationStep(stepName, options) {

        const { discordService } = this.server.services();

        switch (stepName) {
            case 'Welcome1':

                const { member } = options;

                const richWelcomeMessage = discordService.buildMessage({
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
                });

                return richWelcomeMessage;
            case 'Welcome2':
                return `Hey there, welcome to Rejuvenation!
As stated in our bio, we aim to maintain a positive atmosphere in our server. To help maintain that, we ask that you answer the following 3 questions:`;
            case 'Q1':
                return 'Q1: Do you believe that the God of Abraham (YHWH) is the one true God?';
            case 'Q2':
                return 'Q2: What are your beliefs on the Trinity?';
            case 'Q3':
                return 'Q3: What are your beliefs on salvation?';
        }
    }

    async onMemberLeave(member) {

        const {
            discordService,
            guildService
        } = this.server.services();

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
                { name: 'User', value: `**Name:** ${member.user.tag}\n**ID:** ${member.user.id}`, inline: false },
                { name: 'Joined Discord At', value: `${accountCreationDate}`, inline: false },  // Display the Discord account creation date
                { name: 'Joined Server At', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },  // Server join date
                { name: 'Left Server At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }  // Timestamp for when the user left
            ],
            timestamp: new Date()
        });

        // await this.messageModerators({
        //     guildId: member.guild.id,
        //     message: richMessage
        // });

        const botLogsChannel = await guildService.getChannelByName(
            member.guild.id,
            BOT_LOGS_CHANNEL_NAME
        );

        // If the bot-logs channel is found, send the custom message
        if (botLogsChannel) {
            // Send the member joined message
            await botLogsChannel.send(richMessage);
        }
    }

    truncateContent(content) {

        if (!content) {
            return '';
        }

        const maxLength = 1024;
        return content.length > maxLength ? content.slice(0, maxLength - 3) + '...' : content;
    }

    // Intentionally sending msg edits to owners and not moderators
    async onMessageEdit(oldMessage, newMessage) {

        const { discordService } = this.server.services();

        // Ignore bot messages to prevent loops
        if (newMessage.author.bot) {
            return;
        }

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
                        value: `${this.truncateContent(oldMessage.content) || '*No content*'}`,
                        inline: true
                    },
                    {
                        name: 'After',
                        value: `${this.truncateContent(newMessage.content) || '*No content*'}`,
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

            // TODO just for TESTING
            // const {
            //     guildService
            // } = this.server.services();

            // const botLogsChannel = await guildService.getChannelByName(
            //     guildId,
            //     BOT_LOGS_CHANNEL_NAME
            // );

            // console.log('botLogsChannel', botLogsChannel);
        }
        catch (error) {
            // Log error with as much context as possible
            console.error('Error while handling message edit:', error);

            // Log partial details if full message info is not available
            console.error(`Failed to process message edit. Partial message details: ID=${oldMessage.id}, Channel=${oldMessage.channel?.name || 'Unknown'}, Content="${this.truncateContent(oldMessage.content) || 'Unavailable'}"`);
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
                content: this.truncateContent(message.content) ?? 'No content (partial or unavailable)'
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
            if (!this.truncateContent(message.content)) {
                console.warn(`Message content not available for message ID: ${message.id}`);
                return;
            }

            if (!message.guild) {
                throw new Error('Guild information is missing for the deleted message.');
            }

            // Log the message details before notifying moderators
            console.log(`Message deleted in #${message.channel.name} of guild "${message.guild.name}": "${this.truncateContent(message.content)}"`);

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
                        value: `${this.truncateContent(message.content) || '*No content available*'}`,
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
            console.error(`Failed to process message deletion. Partial message details: ID=${message.id}, Channel=${message.channel.name}, Content="${this.truncateContent(message.content) || 'Unavailable'}"`);
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

// Helper function to calculate Easter date using the "Meeus/Jones/Butcher" algorithm
internals.calculateEaster = (year) => {

    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // Month is zero-based
    const day = ((h + l - 7 * m + 114) % 31) + 1; // Day of the month

    return new Date(year, month, day);
};

internals.getNextEaster = (today) => {

    const currentYear = today.getFullYear();
    let easterDate = internals.calculateEaster(currentYear);

    // If today is after this year's Easter, get next year's Easter date
    if (today > easterDate) {
        easterDate = internals.calculateEaster(currentYear + 1);
    }

    return easterDate;
};

// Helper function to get the next Christmas date
internals.getNextChristmas = (today) => {

    const currentYear = today.getFullYear();
    const christmasDate = new Date(currentYear, 11, 25); // December 25th

    // If today is after Christmas, set Christmas to next year
    if (today > christmasDate) {
        christmasDate.setFullYear(currentYear + 1);
    }

    return christmasDate;
};

internals.daysUntilHoliday = (holidayName) => {

    const today = new Date();
    let targetDate;

    switch (holidayName.toLowerCase()) {
        case 'christmas':
            targetDate = internals.getNextChristmas(today);
            break;
        case 'easter':
            targetDate = internals.getNextEaster(today);
            break;
        default:
            throw new Error('Unsupported holiday! Please use "Christmas" or "Easter".');
    }

    // Calculate the difference in milliseconds
    const diffInMilliseconds = targetDate - today;

    // Convert milliseconds to days
    const daysUntil = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
    return daysUntil;
};

internals.wait = async (wait = 0) => await new Promise((res) => setTimeout(res, wait));
