'use strict';

const Axios = require('axios');
const Schmervice = require('@hapipal/schmervice');

const {
    ButtonStyle,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

// Resource definitions

const DOG_API_URL = 'https://dog.ceo/api/breeds/image/random';
const DAD_JOKE_API_URL = 'https://icanhazdadjoke.com';

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
    turt_owo: '1291568218548342794'
    // TODO ADD turt_pizza, needs to work and show up for PIIIIIZZZAAAAA
};

const REACTION_GIFS = {
    skeletor: 'https://i.imgur.com/IK7BEBp.gif',
    disappointed: 'https://media1.tenor.com/m/6YpqK8I0NBoAAAAd/disappointed-hands-on-hips.gif',
    shrimpleAsThat: 'https://tenor.com/view/shrimp-simple-its-shrimple-gif-25735431',
    nothingToSeeHere: 'https://tenor.com/vEjm.gif'
};

const WELCOME_GIFS = [
    'https://media1.tenor.com/m/SpXWQo0Mq7EAAAAd/welcome-michael-scott.gif'
];

// Small util funcs
const random = (array) => array[Math.floor(Math.random() * array.length)];

// Resource maps and functions

const EMOJI_REACTION_MAP = [
    { partial: ['amaze'], emoji: EMOJI.turt_amazed },
    { partial: ['banana'], emoji: EMOJI.turt_banan },
    { partial: ['birthday'], emoji: EMOJI.turt_birthday },
    { partial: ['coffee'], emoji: EMOJI.turt_coffee },
    { partial: ['confounded'], emoji: EMOJI.turt_confounded },
    { partial: ['cool'], emoji: EMOJI.turt_cool },
    { partial: ['dizzy'], emoji: EMOJI.turt_dizzy },
    { partial: ['headphones'], emoji: EMOJI.turt_headphones },
    { partial: ['hotdog', 'hot dog', 'hot-dog'], emoji: EMOJI.turt_dog },
    { partial: ['love turt'], emoji: EMOJI.turt_blue_heart },
    { partial: ['milk'], emoji: EMOJI.turt_milk },
    { partial: ['morning!'], emoji: EMOJI.turt_sun },
    { partial: ['nooooo', 'this is why we can\'t have nice things'], emoji: EMOJI.nnnoooooooooo },
    { partial: ['rofl'], emoji: EMOJI.turt_rofl },
    { partial: ['shrimp', 'skrimp'], emoji: EMOJI.shrimp },
    { partial: ['strawberry', 'strawberries'], emoji: EMOJI.turt_strawberry },
    { partial: ['surprised'], emoji: EMOJI.turt_surprised },
    { partial: ['turt', 'uwu', 'owo'], emoji: EMOJI.turt_owo },
    { partial: ['upside down', 'upside-down'], emoji: EMOJI.turt_upside_down },
    { partial: ['yay!', 'hooray!'], emoji: '🎉' }
];

const REACTION_GIFS_MAP = [
    { partial: ['!disappointed'], gif: REACTION_GIFS.disappointed },
    { partial: ['!handsonhips'], gif: REACTION_GIFS.disappointed },
    { partial: ['arghhh'], gif: REACTION_GIFS.skeletor },
    { partial: ['arrgghhh'], gif: REACTION_GIFS.skeletor },
    { partial: ['nothing to see here'], gif: REACTION_GIFS.nothingToSeeHere },
    { partial: ['shrimple as that'], gif: REACTION_GIFS.shrimpleAsThat }
];

// These customIds aren't stored anywhere else, they're just used to set on buttons, and then look up the role based off id.
// Then, the 'name' prop is used to search for the matching role, based on role name.
const ROLES = {
    age: [
        { name: '13-17', emoji: '🎒', customId: 'role_13_17' },
        { name: '18-25', emoji: '🎓', customId: 'role_18_25' },
        { name: '26-34', emoji: '🏆', customId: 'role_26_34' },
        { name: '35+', emoji: '🌟', customId: 'role_35_plus' }
    ],
    gender: [
        { name: 'Male', emoji: '♂️', customId: 'role_male' },
        { name: 'Female', emoji: '♀️', customId: 'role_female' }
    ],
    location: [
        { name: 'USA', emoji: '🇺🇸', customId: 'role_usa' },
        { name: 'Africa', emoji: '🌍', customId: 'role_africa' },
        { name: 'Asia', emoji: '🌏', customId: 'role_asia' },
        { name: 'Canada', emoji: '🇨🇦', customId: 'role_canada' },
        { name: 'Europe', emoji: '🌍', customId: 'role_europe' },
        { name: 'Middle East', emoji: '🏜️', customId: 'role_middle_east' },
        { name: 'Oceania', emojiId: '1221220800292589710', customId: 'role_oceania' },
        { name: 'South America', emoji: '🌎', customId: 'role_south_america' }
    ],
    color: [
        { name: 'Pink', emoji: '🌸', customId: 'role_pink' },
        { name: 'Red', emoji: '🔴', customId: 'role_red' },
        { name: 'Blue', emoji: '🔵', customId: 'role_blue' },
        { name: 'Green', emoji: '🟢', customId: 'role_green' },
        { name: 'Yellow', emoji: '🟡', customId: 'role_yellow' },
        { name: 'Orange', emoji: '🟠', customId: 'role_orange' },
        { name: 'Purple', emoji: '🟣', customId: 'role_purple' }
    ],
    interest: [
        { name: 'Bible Memorization', emoji: '📜', customId: 'role_bible_memorization' },
        { name: 'Reading Accountability', emoji: '📖', customId: 'role_reading_accountability' },
        { name: 'Gamers', emoji: '🎮', customId: 'role_gamers' },
        { name: 'Prayer Team', emoji: '🙏', customId: 'role_prayer_team' },
        { name: 'Verse of the Day', emoji: '📅', customId: 'role_verse_of_the_day' },
        { name: 'Eccentric Enumerator', emoji: '🔢', customId: 'role_eccentric_enumerator' },
        { name: 'Bookworm', emoji: '🐛', customId: 'role_bookworm' },
        { name: 'Movie Club', emoji: '🎬', customId: 'role_movie_club' },
        { name: 'Daily Gratitude', emoji: '😊', customId: 'role_daily_gratitude' },
        { name: 'Study Buddy', emoji: '💡', customId: 'role_study_buddy' },
        { name: 'Foodies', emoji: '🍔', customId: 'role_foodies' },
        { name: 'QOTD', label: 'Question of the Day', emoji: '❓', customId: 'role_qotd' },
        { name: 'Supports', emoji: '🤝', customId: 'role_supports' },
        { name: 'Bible Study', emoji: '📚', customId: 'role_bible_study' },
        { name: 'Creatives', emoji: '🎨', customId: 'role_creatives' },
        { name: 'BQOTD', label: 'Bible Question of the Day', emoji: '❔', customId: 'role_bqotd' },
        { name: 'Fellowship Night', emoji: '🌙', customId: 'role_fellowship_night' },
        { name: 'Counting Run, Anyone?', emoji: '🔢', customId: 'role_counting_run_anyone' },
        { name: 'Connect Four, Anyone?', emojiId: '1315429681427644436', customId: 'role_connect_four_anyone' },
        { name: 'VC NOW', emoji: '🎙', customId: 'role_vc_now' }
    ]
};

const internals = {};

const RULES = [
    [
        {
            name: 'Be respectful and kind to one another, even if you do not agree with what they have to say.',
            description: '[Philippians 2:3] ”Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves.”'
        },
        {
            name: 'No NSFW posts of any kind.',
            description: '[Ephesians 5:3] ”But sexual immorality and all impurity or covetousness must not even be named among you, as is proper among saints.”'
        },
        {
            name: 'No posts that promote other faiths, false prophets, or information that does not align with Scripture.',
            description: '[Matthew 7:15] ”Beware of false prophets, who come to you in sheep\'s clothing but inwardly are ravenous wolves.”'
        },
        {
            name: 'Speak with Grace, Listen with Humility.',
            description: `Let your words reflect who you are in Christ. In both text and voice channels, we aim to create a space where everyone feels welcome, heard, and respected.

    [Ephesians 5:4] “Nor should there be obscenity, foolish talk or coarse joking, which are out of place, but rather thanksgiving.”

    [Romans 12:2] “Do not conform to the pattern of this world, but be transformed by the renewing of your mind.”

    We are called to be set apart, even in how we speak. While joy and fun are encouraged, please avoid chaos or volume that drowns out others, and refrain from disrespectful or crude language. Our conversations should build up, reflect grace, and help others feel safe to speak and chill in fellowship.

    [Colossians 4:6] “Let your conversation be always full of grace, seasoned with salt, so that you may know how to answer everyone.”

    [Proverbs 25:28] “Like a city whose walls are broken through is a person who lacks self-control.”`
        }
    ],
    [
        {
            name: 'Be receptive when leaders kindly step in to moderate.',
            description: `Correction is not given in malice, but in love to protect the peace and fellowship of the community. If you are looking to joke around more freely, we have different channels that you may move to.

Let’s aim to build one another up, not just in our words, but in how we listen and respond.

[Proverbs 15:32] “Whoever heeds correction gains understanding.”

[Hebrews 13:11] “No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace for those who have been trained by it.”

[Galatians 6:1] “Brothers, if anyone is caught in any transgression, you who are a spiritual should restore him in a spirit of gentleness.”`
        },
        {
            name: 'No public shaming. If you have disagreements or may not get along with someone and things escalate, please reach out to a moderator directly for assistance or speak about it in DMs rather than addressing it publicly.',
            description: `[Proverbs 15:1] “A gentle answer turns away wrath.“

If things escalate:

[Ephesians 4:26] “Be angry and do not sin; do not let the sun go down on your anger.“
[Proverbs 15:1] “A gentle answer turns away wrath.“`
        },
        {
            name: 'Don’t share any personal information (Common Safety).',
            description: 'Keep yourself and others safe.'
        },
        {
            name: 'Reminder this isn’t a dating platform. Please be mindful and respectful of others.',
            description: 'Don’t make it weird.'
        },
        {
            name: 'No depictions of violence or self-harm of any kind.',
            description: `Avoid speech, images, or showing weapons.

    If you’re in crisis and in the US/Canada, you can reach out to \'988\', if in Australia \'13 11 14\', if in the UK \'116 123\'.`
        },
        {
            name: 'No asking for donations directly from members.',
            description: 'We\'re here to share, not solicit. If you have a fund-raiser for a good cause, message moderators about it first and if accepted, mods will post on your behalf.'
        },
        {
            name: 'We affirm and uphold the Discord Community Guidelines.',
            description: 'https://discord.com/guidelines'
        },
        {
            name: 'No Groypers allowed.',
            description: 'A Groyper is a follower of Neo-Nazi Nick Fuentes.'
        }
    ]
];

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
    { partial: '!rules', response: (message, server) => {

        const { discordService } = server.services();

        let ruleCount = 0;

        // These rulesets are arbitrary and exist because Discord message limits.
        return RULES.map((ruleset, i) => {

            if (i === 0) {
                return discordService.buildMessage({
                    title: 'Rejuvenation Server Rules',
                    color: '#FF8C00',
                    fields: ruleset.map((rule, j) => ({
                        name: `${++ruleCount}. ${rule.name}`,
                        value: rule.description
                    }))
                });
            }

            return discordService.buildMessage({
                color: '#FF8C00',
                fields: ruleset.map((rule, j) => ({
                    name: `${++ruleCount}. ${rule.name}`,
                    value: rule.description
                }))
            });
        });
    } },
    { partial: '!welcome', response: (message, server) => {

        const { rejuvenationBotService } = server.services();

        return rejuvenationBotService.getWelcomeApplicationStep('Welcome1');
    } },
    {
        partial: '!roles',
        noReply: true,
        response: (message, server) => {

            const { discordService } = server.services();

            // Iterate through each category in the ROLES object
            return Object.entries(ROLES).map(([category, roles]) => {

                // Prepare an array to hold multiple action rows
                const actionRows = [];

                // Chunk the roles array into groups of 5 (Discord allows up to 5 buttons per action row)
                for (let i = 0; i < roles.length; i += 5) {
                    const chunk = roles.slice(i, i + 5);  // Create a chunk of up to 5 roles

                    // Create buttons for this chunk
                    const buttons = chunk.map((role) => {

                        return {
                            label: role.label || role.name,  // Use label if available, else name
                            customId: role.customId,         // Assign the role's customId
                            emoji: role.emoji || { id: role.emojiId },  // Handle both emoji and emojiId
                            style: ButtonStyle.Secondary       // Default button style
                        };
                    });

                    // Build the action row with the buttons for this chunk
                    const actionRow = new ActionRowBuilder();
                    buttons.forEach((button) => {

                        const builtButton = new ButtonBuilder()
                            .setLabel(button.label)
                            .setCustomId(button.customId)
                            .setStyle(button.style)
                            .setEmoji(button.emoji);

                        actionRow.addComponents(builtButton);
                    });

                    actionRows.push(actionRow);  // Add the action row to the array of action rows
                }

                // Build the message for this category
                return discordService.buildMessage({
                    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Roles`, // Category title
                    color: '#FF8C00',
                    buttons: actionRows  // Pass all the action rows for this category
                });
            });
        }
    },
    { partial: '!doggo', response: async (message, server) => {

        try {
            const response = await Axios.get(DOG_API_URL);
            const dogImageUrl = response.data.message;

            return { files: [dogImageUrl] };
        }
        catch (error) {
            console.error('Error fetching dog image:', error);
            return 'Oops! Something went wrong while fetching a doggo image. 🐶';
        }
    } },
    { partial: '!dadjoke', response: async (message, server) => {

        const IGNORE_DAD_JOKE_IDS = [
            '6EYLBscN7wc',
            'lyk3EIBQfxc'
        ];

        const getDadJoke = async () => {

            try {
                const response = await Axios.get(
                    DAD_JOKE_API_URL,
                    { headers: { Accept: 'application/json' } }
                );

                console.log('zlog dadjoke', response.data);

                if (IGNORE_DAD_JOKE_IDS.includes(response.data.id)) {
                    return await getDadJoke();
                }

                return response.data.joke;
            }
            catch (error) {
                console.error('Error fetching dad joke:', error);
                return 'Oops! Something went wrong while fetching a dad joke. 🙃';
            }
        };

        return await getDadJoke();
    } }
    // { partial: '!zelcome', response: (message, server) => {

    //     try {
    //         return { files: [random(WELCOME_GIFS)] };
    //     }
    //     catch (error) {
    //         console.error('Error sending welcome msg:', error);
    //     }
    // } }
];

// const WELCOME_CHANNEL_NAME = 'welcome';
const BOT_LOGS_CHANNEL_NAME = 'bot-logs';
const WELCOME_CATEGORY_NAME = 'welcome';

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

        for (let { partial, response, noReply } of TEXT_RESPONSE_MAP) {

            const match = [].concat(partial).find((p) => content.includes(p));

            if (match) {
                if (typeof response === 'function') {
                    response = await response(message, this.server);
                }

                response = [].concat(response);

                for (const res of response) {
                    if (noReply) {
                        await message.channel.send(res);
                    }
                    else {
                        await message.reply(res);
                    }
                }
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

        await newWelcomeChannel.send('_Only you and moderators are able to see this channel._');

        await internals.wait(2000);

        await newWelcomeChannel.send(this.getWelcomeApplicationStep('Welcome1'));

        await internals.wait(2000);

        await newWelcomeChannel.send(this.getWelcomeApplicationStep('Welcome2'));
    }

    async onButtonInteraction(interaction) {

        const { guildService } = this.server.services();

        const guild = interaction.guild;
        let member = interaction.member;

        if (!member.roles || !member.roles.cache) {
            member = await interaction.guild.members.fetch(member.id);
        }

        const isModerator = member.roles.cache.some((role) => role.name === 'Moderators');
        const isVerified = member.roles.cache.some((role) => role.name === 'Verified');

        if (interaction.customId === 'begin_application') {
            if (isModerator) {
                return await interaction.reply({
                    content: 'loL ur a mod why are u clicking this button silly?',
                    ephemeral: true
                });
            }
            else if (isVerified) {
                return await interaction.reply({
                    content: 'loL ur already verified why are u clicking this button silly?',
                    ephemeral: true
                });
            }

            await interaction.reply(this.getWelcomeApplicationStep('Q1'));
        }

        // Check if the interaction is for the "accept_rules" button
        if (interaction.customId === 'accept_rules') {
            if (isModerator) {
                return await interaction.reply({
                    content: 'loL ur a mod why are u clicking this button silly?',
                    ephemeral: true
                });
            }
            else if (isVerified) {
                return await interaction.reply({
                    content: 'loL ur already verified why are u clicking this button silly?',
                    ephemeral: true
                });
            }

            // Get or create the "Verified" role
            const verifiedRole = await guildService.getRoleByName(guild.id, 'Verified');

            // Assign the "Verified" role to the member
            await member.roles.add(verifiedRole);

            // Send a message to general, welcoming the new member.
            // const generalChannel = await guildService.getChannelByName(guild.id, 'general');
            /////////////////
            // await generalChannel.send();

            await interaction.reply({
                content: 'Thank you for accepting the rules! You have been verified. 🎉',
                ephemeral: false
            });
        }

        // Find the role associated with the clicked button
        let foundRole = null;

        // Loop through each category in ROLES
        Object.values(ROLES).find((roles) => {
            // Try to find the role with the matching customId in this category
            const role = roles.find((r) => r.customId === interaction.customId);

            if (role) {
                foundRole = role;  // Store the found role
            }

            return foundRole;
        });

        if (foundRole) {
            const role = await guildService.getRoleByName(guild.id, foundRole.name);

            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                await interaction.reply({
                    content: `You have removed the ${foundRole.name} role!`,
                    ephemeral: true
                });
            }
            else {
                await member.roles.add(role);
                await interaction.reply({
                    content: `You now have the ${foundRole.name} role!`,
                    ephemeral: true
                });
            }
        }
    }

    async handleWelcomeChannels(message) {

        const { discordService } = this.server.services();

        // Check if the sender has a moderator role
        const isModerator = message.member.roles.cache.some((role) => role.name === 'Moderators');

        if (isModerator) {
            if (message.content.toLowerCase().includes('!approve')) {

                let ruleCount = 0;

                // These rulesets are arbitrary and exist because Discord message limits.
                return RULES.forEach((ruleset, i) => {

                    if (i === 0) {
                        return message.channel.send(discordService.buildMessage({
                            title: 'Rejuvenation Server Rules',
                            description: `You've been approved! ✅\n\n**Please read and accept the rules to get verified. Thanks for joining! 🎉**`,
                            color: '#FF8C00',
                            footer: {
                                text: `Welcome to Rejuvenation! 🎉`
                            },
                            fields: ruleset.map((rule, j) => ({
                                name: `${++ruleCount}. ${rule.name}`,
                                value: rule.description
                            }))
                        }));
                    }

                    if (i === RULES.length - 1) {
                        return message.channel.send(discordService.buildMessage({
                            color: '#FF8C00',
                            fields: ruleset.map((rule, j) => ({
                                name: `${++ruleCount}. ${rule.name}`,
                                value: rule.description
                            })),
                            buttons: [
                                {
                                    label: 'Click to Acknowledge and Accept Rules',
                                    style: ButtonStyle.Success,
                                    customId: 'accept_rules',
                                    emoji: '✅'
                                }
                            ]
                        }));
                    }

                    message.channel.send(discordService.buildMessage({
                        color: '#FF8C00',
                        fields: ruleset.map((rule, j) => ({
                            name: `${++ruleCount}. ${rule.name}`,
                            value: rule.description
                        }))
                    }));
                });
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

    getWelcomeApplicationStep(stepName) {

        const { discordService } = this.server.services();

        switch (stepName) {
            case 'Welcome1':
                return discordService.buildMessage({
                    title: `🌟 Welcome! 🌟`,
                    description: `Welcome to Rejuvenation - a Faithful Community! 🎉✨`,
                    color: '#FF8C00',
                    fields: [
                        {
                            name: 'Dear Brothers and Sisters in Christ,',
                            value: `We are delighted to extend a heartfelt welcome to you in the name of our Lord and Savior, Jesus Christ. 🙏✨ Whether you are a long-time believer or someone exploring their faith, you've found a home here.\n\nAt Rejuvenation, we aim to create a Christ-centered community where we can share our faith, uplift one another, and grow together in the love and wisdom of God. Feel free to engage in discussions, share your favorite Bible verses, or simply find comfort in fellowship.`
                        },
                        {
                            name: '\u200B',  // This adds an empty field as a separator
                            value: `This server is intended to be a reflection of God's love, and we're here to strengthen each other on our Christian walk. We're blessed to have you with us!\n\nMay the grace and peace of our Lord Jesus Christ be with you always. 🕊️🌈\nIn His love,`
                        }
                    ],
                    footer: {
                        text: 'Rejuvenation Server Staff'
                    },
                    timestamp: new Date()
                });
            case 'Welcome2':
                return discordService.buildMessage({
                    title: 'Rejuvenation Application',
                    description: `As stated in our bio, we aim to maintain a positive atmosphere in our server. To help maintain that, we ask that you answer 3 questions.`,
                    color: '#288046',
                    buttons: [
                        {
                            label: 'Begin Application',
                            style: ButtonStyle.Success,
                            customId: 'begin_application',
                            emoji: '🚀'
                        }
                    ]
                });
            case 'Q1':
                return 'Q1: Do you believe that the God of Abraham (Yahweh) is the one true God?';
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
            throw new Error('Unsupported holiday! Please use ”Christmas” or ”Easter”.');
    }

    // Calculate the difference in milliseconds
    const diffInMilliseconds = targetDate - today;

    // Convert milliseconds to days
    const daysUntil = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
    return daysUntil;
};

internals.wait = async (wait = 0) => await new Promise((res) => setTimeout(res, wait));
