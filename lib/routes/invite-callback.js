'use strict';

module.exports = (server, options) => ({
    method: 'GET',
    path: '/oauth-callback',
    options: {
        handler: async (request, h) => {

            const { code } = request.query;

            const {
                botService,
                serverService
            } = server.services();

            if (!code) {
                return h.response('Missing authorization code').code(400);
            }

            try {
                const accessToken = await botService.exchangeCodeForToken(code);
                console.log('accessToken', accessToken);

                const guildInfo = await serverService.getGuildInfo(accessToken);
                // const accessToken = await serverService.register(token);

                await serverService.register({
                    guildInfo,
                    accessToken
                });

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
