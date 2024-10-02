'use strict';

const Wreck = require('@hapi/wreck');
const Schmervice = require('@hapipal/schmervice');

const QueryString = require('querystring');

module.exports = class HttpService extends Schmervice.Service {
    constructor(server, options) {

        super(server, options);
    }

    getOptions({ headers, payload }) {

        const options = {};

        options.headers = Object.assign(
            {},
            { 'Content-Type': 'application/json' },
            headers
        );

        if (payload) {
            if (options.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
                options.payload = QueryString.stringify(payload);
            }
            else {
                options.payload = JSON.stringify(payload);
            }
        }

        return options;
    }

    processResponse(response) {

        response.payload = JSON.parse(response.payload);
        return response.payload;
    }

    async get(config) {

        const { url } = config;
        const options = this.getOptions(config);


        try {
            return this.processResponse(await Wreck.get(url, options));
        }
        catch (error) {

            this.handleError(error);
        }
    }

    async post(config) {

        const { url } = config;
        const options = this.getOptions(config);

        try {
            return this.processResponse(await Wreck.post(url, options));
        }
        catch (error) {

            this.handleError(error);
        }
    }

    handleError(error) {

        const statusCode = error.output?.statusCode || 500;
        const statusMessage = error.output?.payload?.error || 'Unknown Error';

        // Extract payload information (convert Buffer to string if necessary)
        let responsePayload = null;
        if (error.data?.payload) {
            try {
                responsePayload = JSON.parse(error.data.payload.toString());
            }
            catch (parsingError) {
                // Fallback to raw string if JSON parsing fails
                responsePayload = error.data.payload.toString();
            }
        }

        // Log the details for debugging
        console.error(`Request failed: ${statusCode} ${statusMessage}`);

        if (responsePayload) {
            console.error(`Response Payload: ${JSON.stringify(responsePayload, null, 2)}`);
        }
        else {
            console.error('No response payload available.');
        }

        throw new Error(`Request failed: ${statusCode} ${statusMessage}`);
    }

    async handleTokenError(error, config, method) {

        if (error.output?.statusCode === 401) { // Token expired or invalid
            console.log('Access token expired. Attempting to refresh...');

            try {
                await this.refreshAccessToken();

                // Retry the original request
                if (method === 'get') {
                    return await this.get(config);
                }
                else if (method === 'post') {
                    return await this.post(config);
                }
            }
            catch (refreshError) {
                console.error('Failed to refresh access token:', refreshError);
                throw refreshError;
            }
        }
        else {
            this.handleError(error);
        }
    }
};
