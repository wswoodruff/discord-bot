'use strict';

exports.up = async (knex) => {

    await knex.schema.createTable('Guilds', (table) => {

        table.string('id').primary();
        table.string('name');
        table.string('accessToken');
        table.string('refreshToken');
        table.date('tokenExpiration');
        table.string('icon');
        table.string('scope');
        table.string('systemChannelId');
    });

    await knex.schema.createTable('Webhooks', (table) => {

        table.string('id').primary();
        table.string('guildId')
            .references('id')
            .inTable('Guilds');
        table.string('name');
        table.string('avatar');
        table.string('channelId');
        table.string('applicationId');
        table.string('ownerId');
        table.string('token');
        table.string('url');
    });
};

exports.down = async () => {

    return await true;
};
