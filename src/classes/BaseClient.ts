import { Client, GatewayIntentBits as Intents, Partials } from 'discord.js';
import type { ShouwClientOptions } from '../index.js';

export interface Objects {
    [key: string | symbol | number | `${any}`]: unknown;
}

/**
 * The base client class for the Shouw.js library. This class extends the discord.js Client class and adds some additional functionality.
 *
 * @class BaseClient
 * @extends {import('discord.js').Client} - The discord.js Client class
 * @param {ShouwClientOptions} options - The options for the client
 */
export class BaseClient extends Client<true> {
    constructor({ token, intents, partials, ...options }: ShouwClientOptions) {
        if (Array.isArray(intents))
            intents = intents.map((i: string | unknown) => Intents[i as string] | (i as Intents));
        if (Array.isArray(partials))
            partials = partials.map((p: string | unknown) => Partials[p as string] | (p as Partials));
        if (!token || typeof token !== 'string')
            throw new Error('Invalid bot token! Please provide a valid discord bot token!');
        if (!options.allowedMentions)
            options.allowedMentions = { parse: ['users', 'roles', 'everyone'], repliedUser: true };

        super({ intents: intents ?? [], partials: partials ?? [], ...options });
        super.login(token);
    }
}
