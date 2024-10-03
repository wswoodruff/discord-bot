'use strict';

const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class GuildService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);

        this.cache = {};
    }

    /**
     * Registers a guild and its associated webhook in the database.
     *
     * @param {Object} info - The information needed to register the guild and webhook.
     * @param {string} info.access_token - The access token for the guild.
     * @param {string} info.refresh_token - The refresh token for the guild.
     * @param {number} info.expires_in - The expiration time of the access token in seconds.
     * @param {string} info.scope - The scope of the guild.
     * @param {Object} info.guild - The guild object.
     * @param {string} info.guild.id - The ID of the guild.
     * @param {string} info.guild.icon - The icon of the guild.
     * @param {string} info.guild.system_channel_id - The ID of the system channel of the guild.
     * @param {Object} info.webhook - The webhook object.
     * @param {string} info.webhook.id - The ID of the webhook.
     * @param {string} info.webhook.name - The name of the webhook.
     * @param {string} info.webhook.avatar - The avatar of the webhook.
     * @param {string} info.webhook.channel_id - The ID of the channel of the webhook.
     * @param {string} info.webhook.application_id - The ID of the application of the webhook.
     * @param {string} info.webhook.token - The token of the webhook.
     * @param {string} info.webhook.url - The URL of the webhook.
     * @return {Promise<void>} - A promise that resolves when the guild and webhook are registered.
     */
    async register(info) {

        const {
            access_token,
            refresh_token,
            expires_in,
            scope,
            guild,
            webhook
        } = info;

        const { Guild, Webhook } = this.server.models();

        await Guild.query()
            .insert({
                id: guild.id,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiration: new Date(Date.now() + expires_in).toISOString(),
                icon: guild.icon,
                scope,
                systemChannelId: guild.system_channel_id
            });

        await Webhook.query()
            .insert({
                id: webhook.id,
                guildId: guild.id,
                name: webhook.name,
                avatar: webhook.avatar,
                channelId: webhook.channel_id,
                applicationId: webhook.application_id,
                token: webhook.token,
                url: webhook.url
            });
    }

    async getWebhooks(guildId) {

        const { discordService } = this.server.services();

        const guild = await discordService.fetchGuild(guildId);

        return await guild.fetchWebhooks();
    }

    setCacheInfo(guildId, info) {

        // Initialize cache entry for the guild if it does not exist
        if (!this.cache[guildId]) {
            this.cache[guildId] = {};
        }

        const newInfo = {};

        // Loop through each key-value pair in the `info` object
        Object.entries(info).forEach(([key, value]) => {
            // If the existing value in the cache is an object and the new value is also an object, merge them
            if (
                typeof this.cache[guildId][key] === 'object'
                    && !Array.isArray(this.cache[guildId][key])
                    && typeof value === 'object'
                    && !Array.isArray(value)
            ) {
                // Merge 1 lvl deep
                newInfo[key] = {
                    ...this.cache[guildId][key],
                    ...value
                };
            }
            else {
                // If it's a primitive value (boolean, number, string) or array, directly replace
                newInfo[key] = value;
            }
        });

        // Update the cache for the given guild
        this.cache[guildId] = {
            ...this.cache[guildId],
            ...newInfo
        };
    }

    ensureCache(guildId) {

        if (!this.cache[guildId]) {
            this.cache[guildId] = {};
        }
    }

    async updateMembersCache(guildId) {

        this.ensureCache(guildId);

        const { discordService } = this.server.services();

        let guild = this.cache[guildId].guild;

        if (!guild) {
            guild = await discordService.fetchGuild(guildId);
            this.cache[guildId].guild = guild;
        }

        // Fetch members
        await guild.members.fetch();

        const members = guild.members.cache;

        for (const member of members) {
            await member.fetch();
        }

        this.cache[guildId].members = members;

        return members;
    }

    async updateWebhookCache(guildId) {

        this.ensureCache(guildId);

        const { discordService } = this.server.services();

        let guild = this.cache[guildId].guild;

        if (!guild) {
            guild = await discordService.fetchGuild(guildId);
            this.cache[guildId].guild = guild;
        }

        // Fetch webhooks
        const webhooks = await guild.fetchWebhooks();

        this.cache[guildId].webhooks = webhooks;

        return webhooks;
    }

    async getOwners(guildId) {

        this.ensureCache(guildId);

        if (this.cache[guildId].owners) {
            return this.cache[guildId].owners;
        }

        const { discordService } = this.server.services();

        let guild = this.cache[guildId].guild;

        if (!guild) {
            guild = await discordService.fetchGuild(guildId);
            this.cache[guildId].guild = guild;
        }

        const owners = [];

        // Ensure all members are fetched and cached
        await guild.members.fetch();

        // Loop through each member in the guild
        for (let [memberId, member] of guild.members.cache) {
            try {
                // If `member.roles` is not populated or is missing, fetch full member data
                if (!member.roles || !member.roles.cache.size) {
                    member = await member.fetch(); // Fetch full member data, including roles
                }

                // Check if the member has any role with 'owner' in its name
                if (member.roles.cache.some((role) => role.name.toLowerCase().includes('owner'))) {
                    owners.push([memberId, member]);
                }
            }
            catch (error) {
                console.error(`Failed to fetch data for member ${member.user.tag}:`, error);
            }
        }

        // Cache the fetched owners for future use
        this.setCacheInfo(guildId, { owners });

        return owners;
    }

    async getModerators(guildId) {

        this.ensureCache(guildId);

        if (this.cache[guildId].moderators) {
            return this.cache[guildId].moderators;
        }

        const { discordService } = this.server.services();

        let guild = this.cache[guildId].guild;

        if (!guild) {
            guild = await discordService.fetchGuild(guildId);
            this.cache[guildId].guild = guild;
        }

        const moderators = [];

        // Ensure all members are fetched and cached
        await guild.members.fetch();

        // Loop through each member in the guild
        for (let [memberId, member] of guild.members.cache) {
            try {
                // If `member.roles` is not populated or is missing, fetch full member data
                if (!member.roles || !member.roles.cache.size) {
                    member = await member.fetch(); // Fetch full member data, including roles
                }

                // Check if the member has any role with 'moderator' in its name
                if (member.roles.cache.some((role) => role.name.toLowerCase().includes('moderator'))) {
                    moderators.push([memberId, member]);
                }
            }
            catch (error) {
                console.error(`Failed to fetch data for member ${member.user.tag}:`, error);
            }
        }

        // Cache the moderators for future use
        this.setCacheInfo(guildId, { moderators });

        return moderators;
    }

    async syncWebhooksWithDB(guildId) {

        this.ensureCache(guildId);

        const { Webhook } = this.server.models();

        const { discordService } = this.server.services();

        let guild = this.cache[guildId].guild;

        if (!guild) {
            guild = await discordService.fetchGuild(guildId);
            this.cache[guildId].guild = guild;
        }

        // Example webhook
        // {
        //     name: 'Rejuvenation Bot',
        //     avatar: '032cedd5df948f8ec69bd1dccce8c770',
        //     id: '1288626391394422855',
        //     type: 1,
        //     guildId: '1177769276153810974',
        //     channelId: '1182468364019445870',
        //     owner: User {
        //       id: '1095485903364964453',
        //       bot: false,
        //       system: false,
        //       flags: UserFlagsBitField { bitfield: 0 },
        //       username: 'zillogical',
        //       globalName: 'zill',
        //       discriminator: '0',
        //       avatar: '23f893679e943313e52292202b159635',
        //       banner: null,
        //       accentColor: null,
        //       avatarDecoration: null
        //     },
        //     applicationId: '1269043403329507368',
        //     sourceGuild: null,
        //     sourceChannel: null
        // }
        const webhooks = this.formatCollectionAsArray(await guild.fetchWebhooks())
            .map((webhook) => ({
                id: webhook.id,
                guildId,
                name: webhook.name,
                avatar: webhook.avatar,
                channelId: webhook.channelId,
                applicationId: webhook.applicationId,
                ownerId: webhook.owner.id,
                token: webhook.token,
                url: webhook.url
            }));

        const guildDBWebhooks = await Webhook.query()
            .select('id')
            .where({ guildId });

        const guildDBWebhookIds = guildDBWebhooks.map(({ id }) => id);

        const webhooksToAdd = webhooks.filter(({ id: webhookId }) => {

            return !guildDBWebhookIds.some((id) => id === webhookId);
        });

        const webhookIdsToDelete = guildDBWebhookIds.filter((webhookId) => {

            return !webhooks.some(({ id }) => id === webhookId);
        });

        if (!!webhooksToAdd.length) {
            await Webhook.query()
                .insert(webhooksToAdd);
        }

        if (!!webhookIdsToDelete.length) {
            await Webhook.query()
                .delete()
                .whereIn('id', webhookIdsToDelete);
        }

        // TODO cache webhooks for the guild
    }

    async deleteWebhook(webhookId) {

        const { Webhook } = this.server.models();
        const { discordService } = this.server.services();

        const webhook = await discordService.client.fetchWebhook(webhookId);

        await webhook.delete();

        await Webhook.query()
            .findById(webhookId)
            .delete();
    }

    formatCollectionAsArray(collection) {

        return Array.from(collection)
            .map(([id, item]) => ({
                id,
                ...item
            }));
    }
};
