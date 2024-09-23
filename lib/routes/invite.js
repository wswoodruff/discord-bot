'use strict';

module.exports = {
    method: 'GET',
    path: '/invite',
    options: {
        handler: (request, h) => {

            const { botService } = request.server.services();

            return h.redirect(botService.getInviteUrl());
        }
    }
};
