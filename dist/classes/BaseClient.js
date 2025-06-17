"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClient = void 0;
const discord_js_1 = require("discord.js");
class BaseClient extends discord_js_1.Client {
    constructor({ token, intents, partials, ...options }) {
        if (Array.isArray(intents))
            intents = intents.map((i) => discord_js_1.GatewayIntentBits[i] | i);
        if (Array.isArray(partials))
            partials = partials.map((p) => discord_js_1.Partials[p] | p);
        if (!token || typeof token !== 'string')
            throw new Error('Invalid bot token! Please provide a valid discord bot token!');
        if (!options.allowedMentions)
            options.allowedMentions = { parse: ['users', 'roles', 'everyone'], repliedUser: true };
        super({ intents: intents ?? [], partials: partials ?? [], ...options });
        super.login(token);
    }
}
exports.BaseClient = BaseClient;
