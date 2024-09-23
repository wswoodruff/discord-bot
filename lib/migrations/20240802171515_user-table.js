'use strict';

exports.up = async (knex) => {

    await knex.schema.createTable('Users', (table) => {

        table.increments('id').primary();
        table.string('discordId');
        table.json('info');
    });
};

exports.down = async (knex) => {

    await knex.schema.dropTable('Users');
};
