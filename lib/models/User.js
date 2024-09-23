'use strict';

const Schwifty = require('@hapipal/schwifty');
const Joi = require('joi');

module.exports = class User extends Schwifty.Model {
    static tableName = 'Users';
    static joiSchema = Joi.object({
        id: Joi.number().integer(),
        discordId: Joi.number().integer(),
        info: Joi.object()
    });
};
