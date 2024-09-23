'use strict';

exports.up = async (knex) => {

    await knex.schema.createTable('Servers', (table) => {

        table.increments('id').primary();
        table.string('accessToken');
    });

    await knex.schema.alterTable('Users', (table) => {

        table.integer('serverId')
            .references('id')
            .inTable('Servers');
    });
};

exports.down = async (knex) => {

    await knex.schema.dropTable('Servers');

    await knex.schema.alterTable('Users', (table) => {

        table.dropColumn('serverId');
    });
};
