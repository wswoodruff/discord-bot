'use strict';

const QueryString = require('querystring');

const Schmervice = require('@hapipal/schmervice');
const { Client, GatewayIntentBits } = require('discord.js');

module.exports = class BotService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);

        // Updated intents to match the required bot capabilities
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,      // Required to read messages
                GatewayIntentBits.GuildMembers,        // To access member information for admin-related tasks
                GatewayIntentBits.GuildMessageReactions // If you want to handle reactions
            ]
        });

        this.client.once('ready', this.onBotReady);
        this.client.on('messageCreate', this.onMessage);
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

        console.log('Discord bot is ready!');
    }

    async onMessage(message) {
        // Example bot response to a command
        if (message.content === '!ping') {
            await message.channel.send('Pong!');
        }
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

        console.log('payload', payload);

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
