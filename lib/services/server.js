'use strict';

const Schmervice = require('@hapipal/schmervice');

module.exports = class ServerService extends Schmervice.Service {

    register({ guildInfo, accessToken }) {

        console.log('guildInfo', guildInfo);
        console.log('accessToken', accessToken);
    }

    // Function to get guild information
    async getGuildInfo(accessToken) {

        const { httpService } = this.server.services();

        const guildsURL = 'https://discord.com/api/users/@me/guilds';

        return await httpService.get({
            url: guildsURL,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    }
};
