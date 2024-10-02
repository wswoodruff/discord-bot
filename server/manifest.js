'use strict';

const Dotenv = require('dotenv');
const Confidence = require('@hapipal/confidence');
const Toys = require('@hapipal/toys');
const Schwifty = require('@hapipal/schwifty');

// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` });

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        host: 'localhost',
        port: {
            $param: 'PORT',
            $coerce: 'number',
            $default: 3000
        },
        debug: {
            $filter: 'NODE_ENV',
            $default: {
                log: ['error', 'start'],
                request: ['error']
            },
            production: {
                request: ['implementation']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: '../lib', // Main plugin
                options: {
                    nodeEnv: process.env.NODE_ENV,
                    token: process.env.DISCORD_TOKEN,
                    applicationId: process.env.DISCORD_APPLICATION_ID,
                    publicKey: process.env.DISCORD_PUBLIC_KEY,
                    clientId: process.env.DISCORD_CLIENT_ID,
                    clientSecret: process.env.DISCORD_CLIENT_SECRET,
                    botPermissions: process.env.DISCORD_BOT_PERMISSIONS,
                    redirectUri: process.env.DISCORD_REDIRECT_URI,
                    oauthScope: process.env.DISCORD_OAUTH_SCOPE
                }
            },
            {
                plugin: '@hapipal/schwifty',
                options: {
                    migrateOnStart: true,
                    knex: {
                        client: 'pg',
                        useNullAsDefault: true,
                        connection: {
                            host: process.env.DB_HOST,
                            user: process.env.DB_USER,
                            password: process.env.DB_PASS,
                            database: process.env.DB_NAME
                        },
                        migrations: {
                            stub: Schwifty.migrationsStubPath
                        }
                    }
                }
            },
            {
                plugin: {
                    $filter: 'NODE_ENV',
                    $default: '@hapipal/hpal-debug',
                    production: Toys.noop
                }
            }
        ]
    }
});
