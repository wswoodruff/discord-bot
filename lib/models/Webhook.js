'use strict';

const Schwifty = require('@hapipal/schwifty');
const Joi = require('joi');

module.exports = class Webhook extends Schwifty.Model {
    static tableName = 'Webhooks';

    static joiSchema = Joi.object({
        id: Joi.string(),
        guildId: Joi.string(),
        name: Joi.string(),
        avatar: Joi.string().allow(null),
        channelId: Joi.string(),
        applicationId: Joi.string().allow(null),
        ownerId: Joi.string().allow(null),
        token: Joi.string().allow(null),
        url: Joi.string()
    });
};
