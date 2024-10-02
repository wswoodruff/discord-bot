'use strict';

module.exports = (server, options) => ({
    method: 'GET',
    path: '/oauth-callback',
    options: {
        handler: async (request, h) => {

            const { code } = request.query;

            const {
                discordService,
                guildService
            } = server.services();

            if (!code) {
                return h.response('Missing authorization code').code(400);
            }

            try {
                const tokenAndServerInfo = await discordService.exchangeCodeForTokenAndServerInfo(code);

                await guildService.register(tokenAndServerInfo);

                // You can store or use tokenData as needed
                return h.response('Bot successfully added to your server!');
            }
            catch (error) {
                console.error('Error exchanging code for token:', error);
                return h.response('Failed to add bot to your server').code(500);
            }
        }
    }
});
