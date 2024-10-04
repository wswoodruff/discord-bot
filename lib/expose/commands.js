'use strict';

module.exports = (server, options) => ({
    value: {
        listWebhooks: {
            description: '<guildId>',
            command: async (srv, [guildId]) => {

                console.log('guildId', guildId);

                const { guildService } = server.services();

                const webhooks = await guildService.getWebhooks(guildId);

                console.log('webhooks', webhooks);
            }
        },
        syncWebhooksWithDb: {
            description: '<guildId>',
            command: async (srv, [guildId]) => {

                const { guildService } = server.services();

                await guildService.syncWebhooksWithDB(guildId);
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
            description: '<guildId>',
            command: async (srv, [guildId]) => {

                const { guildService } = server.services();

                const mods = await guildService.getModerators(guildId);

                console.log('mods', mods);
            }
        },
        messageModerators: {
            description: '<guildId>',
            command: async (srv, [guildId, msg]) => {

                msg = msg || 'Testing Rejuvenation Bot Moderator DMs!';

                const { guildService } = server.services();

                const mods = await guildService.getModerators(guildId);

                for (const moderator of mods) {
                    await moderator.send(msg);
                }
            }
        },
        messageOwners: {
            description: '<guildId>',
            command: async (srv, [guildId, msg]) => {

                msg = msg || 'Testing Rejuvenation Bot Owner DMs!';

                const { guildService } = server.services();

                const owners = await guildService.getOwners(guildId);

                for (const owner of owners) {
                    await owner.send(msg);
                }
            }
        },
        listChannels: {
            description: '<guildId>',
            command: async (srv, [guildId]) => {

                const { guildService } = server.services();

                const channels = await guildService.getChannels(guildId);

                console.log('channels', channels);
            }
        },
        channelByName: {
            description: '<guildId> <channelName>',
            command: async (srv, [guildId, channelName]) => {

                const { guildService } = server.services();

                const channel = await guildService.getChannelByName(guildId, channelName);

                console.log('channel', channel);
            }
        }
    }
});
