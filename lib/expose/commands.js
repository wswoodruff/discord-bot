'use strict';

const RejuvenationBotService = require("../services/rejuvenation-bot");

// Rejuvenation guild id
const GUILD_ID = '1177769276153810974';
const BOT_LOGS_CHANNEL_NAME = 'bot-logs';

module.exports = (server, options) => ({
    value: {
        listWebhooks: {
            command: async (srv, []) => {

                const { guildService } = server.services();

                const webhooks = await guildService.getWebhooks(GUILD_ID);

                console.log('webhooks', webhooks);
            }
        },
        syncWebhooksWithDb: {
            command: async (srv, []) => {

                const { guildService } = server.services();

                await guildService.syncWebhooksWithDB(GUILD_ID);
            }
        },
        deleteWebhook: {
            description: '<webhookId>',
            command: async (srv, [webhookId]) => {

                const { guildService } = server.services();

                await guildService.deleteWebhook(webhookId);
            }
        },
        listModerators: {
            command: async (srv, []) => {

                const { guildService } = server.services();

                const mods = await guildService.getModerators(GUILD_ID);

                console.log('mods', mods);
            }
        },
        messageModerators: {
            description: '<message>',
            command: async (srv, [msg]) => {

                msg = msg || 'Testing Rejuvenation Bot Moderator DMs!';

                const { guildService } = server.services();

                const mods = await guildService.getModerators(GUILD_ID);

                for (const moderator of mods) {
                    await moderator.send(msg);
                }
            }
        },
        messageOwners: {
            description: '<message>',
            command: async (srv, [msg]) => {

                msg = msg || 'Testing Rejuvenation Bot Owner DMs!';

                const { guildService } = server.services();

                const owners = await guildService.getOwners(GUILD_ID);

                for (const owner of owners) {
                    await owner.send(msg);
                }
            }
        },
        listChannels: {
            command: async (srv, []) => {

                const { guildService } = server.services();

                const channels = await guildService.getChannels(GUILD_ID);

                console.log('channels', channels);
            }
        },
        channelByName: {
            description: '<channelName>',
            command: async (srv, [channelName]) => {

                const { guildService } = server.services();

                const channel = await guildService.getChannelByName(
                    GUILD_ID,
                    channelName
                );

                console.log('channel', channel);
            }
        },
        categoryByName: {
            description: '<categoryName>',
            command: async (srv, [categoryName]) => {

                const { guildService } = server.services();

                const category = await guildService.getCategoryByName(
                    GUILD_ID,
                    categoryName
                );

                console.log('category', category);
            }
        },
        sendMsgToBotLogsChannel: {
            description: '<msg>',
            command: async (srv, [msg]) => {

                const { guildService } = server.services();

                const botLogsChannel = await guildService.getChannelByName(
                    GUILD_ID,
                    BOT_LOGS_CHANNEL_NAME
                );

                await botLogsChannel.send(msg);
            }
        },
        testUserJoin: {
            description: '<username>',
            command: async (srv, [username]) => {

                const {
                    guildService,
                    rejuvenationBotService
                } = server.services();

                const member = await guildService.getMemberByUsername(
                    GUILD_ID,
                    username
                );

                await rejuvenationBotService.onMemberJoin(member);

                console.log('member', member);
            }
        }
    }
});
