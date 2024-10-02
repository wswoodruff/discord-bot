'use strict';

const Schwifty = require('@hapipal/schwifty');
const Joi = require('joi');

module.exports = class Guild extends Schwifty.Model {
    static tableName = 'Guilds';

    static joiSchema = Joi.object({
        id: Joi.string(),
        name: Joi.string(),
        accessToken: Joi.string(),
        refreshToken: Joi.string(),
        tokenExpiration: Joi.date().iso(),
        icon: Joi.string(),
        scope: Joi.string(),
        systemChannelId: Joi.string()
    });
};
