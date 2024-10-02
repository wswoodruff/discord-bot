'use strict';

module.exports = {
    method: 'GET',
    path: '/invite',
    options: {
        handler: (request, h) => {

            const { discordService } = request.server.services();

            return h.redirect(discordService.getInviteUrl());
        }
    }
};
