'use strict';

const QueryString = require('querystring');
const Schmervice = require('@hapipal/schmervice');

const {
    Client,
    GatewayIntentBits,
    WebhookClient,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Partials
} = require('discord.js');

module.exports = class DiscordService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);

        const { token } = options;

        // Updated intents to match the required bot capabilities
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildWebhooks
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.Reaction,
                Partials.User,
                Partials.GuildMember,
                // Partials.ThreadMember,        // If you handle threads
                Partials.GuildScheduledEvent  // If you handle scheduled events
            ]
        });

        this.client.on('messageCreate', this.onMessage.bind(this));
        this.client.on('messageUpdate', this.onMessageEdit.bind(this));
        this.client.on('messageDelete', this.onMessageDelete.bind(this));

        this.client.once('ready', this.onBotReady.bind(this));

        this.onMessageListeners = [];
        this.onMessageEditListeners = [];
        this.onMessageDeleteListeners = [];

        this.client.login(token);
    }

    async onMessage(message) {
        // Ignore bot's own messages to prevent loops
        if (message.author.bot) {
            return;
        }

        // Handle partial messages
        if (message.partial) {
            try {
                await message.fetch();
            }
            catch (error) {
                console.error('Could not fetch partial message:', error);
                return;
            }
        }

        // Handle partial users
        if (message.author.partial) {
            try {
                await message.author.fetch();
            }
            catch (error) {
                console.error('Could not fetch partial author:', error);
                return;
            }
        }

        // Call listeners
        this.onMessageListeners.forEach((listener) => listener(message));
    }

    async onMessageEdit(oldMessage, newMessage) {

        // Handle partial messages
        if (oldMessage.partial) {
            try {
                await oldMessage.fetch();
            } catch (error) {
                console.error('Could not fetch partial old message:', error);
                return;
            }
        }

        if (newMessage.partial) {
            try {
                await newMessage.fetch();
            }
            catch (error) {
                console.error('Could not fetch partial new message:', error);
                return;
            }
        }

        // Ignore bot's own messages
        if (newMessage.author.bot) {
            return;
        }

        // Handle partial users
        if (newMessage.author.partial) {
            try {
                await newMessage.author.fetch();
            }
            catch (error) {
                console.error('Could not fetch partial author:', error);
                return;
            }
        }

        // Proceed with your logic
        this.onMessageEditListeners.forEach((listener) => listener(oldMessage, newMessage));
    }

    onMessageDelete(message) {

        // Ignore bot's own messages to prevent loops
        if (message.author?.bot) {
            return;
        }

        this.onMessageDeleteListeners.forEach((listener) => listener(message));
    }

    /**
     * Builds a rich message with embed and optional buttons or other components.
     *
     * @param {Object} options - The options for building the message.
     * @param {String} options.title - Title of the embed.
     * @param {String} options.description - Description of the embed.
     * @param {String} options.url - URL for the embed's title hyperlink.
     * @param {String} options.color - Hex color code for the embed.
     * @param {Object} options.author - Author information (name, iconURL, url).
     * @param {String} options.thumbnail - URL for the embed thumbnail.
     * @param {String} options.image - URL for the embed image.
     * @param {Object} options.footer - Footer information (text, iconURL).
     * @param {Date} options.timestamp - Timestamp for the embed.
     * @param {Array} options.fields - Array of fields for the embed.
     * @param {Array} options.buttons - Array of button options to include in the message.
     *
     * @returns {Object} - The complete message object with embeds and components.
     */
    buildMessage(options) {

        const {
            title,
            description,
            url,
            color,
            author,
            thumbnail,
            image,
            footer,
            timestamp,
            fields = [],
            buttons = [] // New buttons array for interactive message components
        } = options;

        // Create a new EmbedBuilder instance (instead of MessageEmbed for discord.js v14+)
        const embed = new EmbedBuilder();

        // Conditionally set each property if provided
        if (title) {
            embed.setTitle(title);
        }

        if (description) {
            embed.setDescription(description);
        }

        if (url) {
            embed.setURL(url);
        }

        if (color) {
            embed.setColor(color);
        }

        if (author) {
            embed.setAuthor({
                name: author.name,
                iconURL: author.iconURL,
                url: author.url
            });
        }

        if (thumbnail) {
            embed.setThumbnail(thumbnail);
        }

        if (image) {
            embed.setImage(image);
        }

        if (footer) {
            embed.setFooter({
                text: footer.text,
                iconURL: footer.iconURL
            });
        }

        if (timestamp) {
            embed.setTimestamp(timestamp); // Use custom timestamp if provided, otherwise defaults to now
        }

        // Add fields if any are provided
        if (fields.length > 0) {
            embed.addFields(fields);
        }

        // Build the action row with buttons if any are provided
        let components = [];
        if (buttons.length > 0) {
            const actionRow = new ActionRowBuilder();

            // Create buttons from the options provided
            buttons.forEach((button) => {

                const builtButton = new ButtonBuilder()
                    .setLabel(button.label)
                    .setStyle(button.style || ButtonStyle.Primary) // Default to primary style if not provided
                    .setDisabled(button.disabled || false);

                if (button.customId) {
                    builtButton.setCustomId(button.customId); // For regular buttons with custom ID
                }

                if (button.url) {
                    builtButton.setURL(button.url); // For link buttons
                }

                if (button.emoji) {
                    builtButton.setEmoji(button.emoji); // Add emoji if provided
                }

                actionRow.addComponents(builtButton);
            });

            components = [actionRow];
        }

        // Return the message object with the constructed embed and components
        return {
            embeds: [embed],
            components
        };
    }

    async sendWebhookMessage({ webhookId, content, embeds = [], components = [] }) {

        const { Webhook } = this.server.models();

        const webhook = await Webhook.query()
            .findById(webhookId);

        if (!webhook) {
            throw new Error('Webhook not found');
        }
        else if (!webhook.token) {
            throw new Error('Webhook token not found');
        }

        const webhookClient = new WebhookClient({
            id: webhookId,
            token: webhook.token
        });

        return await webhookClient.send({
            content,
            embeds,
            components
        });
    }

    registerListener({ type, func }) {

        switch (type) {
            case 'onMessage':
                this.onMessageListeners.push(func);
                break;
            case 'onMessageEdit':
                this.onMessageEditListeners.push(func);
                break;
            case 'onMessageDelete':
                this.onMessageDeleteListeners.push(func);
                break;
            default:
                break;
        }
    }

    async fetchGuild(guildId) {

        const guild = this.client.guilds.cache.get(guildId);

        if (guild) {
            return guild;
        }

        // Will populate the cache
        return await this.client.guilds.fetch(guildId);
    }

    getInviteUrl() {

        const {
            clientId,
            botPermissions,
            redirectUri
        } = this.options;

        const inviteParams = QueryString.stringify({
            client_id: clientId,
            permissions: botPermissions,  // Admin permissions or other required permissions
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'bot applications.commands messages.read webhook.incoming applications.commands.permissions.update' // Updated scope string
        });

        return `https://discord.com/api/oauth2/authorize?${inviteParams}`;
    }

    onBotReady() {

        console.log('Discord bot is ready and logged-in!');
    }

    async exchangeCodeForTokenAndServerInfo(code) {

        const { httpService } = this.server.services();

        const {
            clientId,
            clientSecret,
            redirectUri
        } = this.options;

        const payload = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri
        };

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const tokenURL = 'https://discord.com/api/oauth2/token';

        return await httpService.post({
            url: tokenURL,
            payload,
            headers
        });
    }
};
