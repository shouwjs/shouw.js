import { Events as DiscordEvents } from 'discord.js';
import { cyan } from 'chalk';
import {
    type Objects,
    type Interpreter,
    type Context,
    type TemporarilyData,
    type ShouwClient,
    Collective
} from '../index.js';

export interface CommandData extends Objects {
    name?: string | string[];
    aliases?: string | string[];
    channel?: string;
    code: string | ((int: Interpreter, ctx: Context, data: TemporarilyData) => any);
    type?: string;
    prototype?: 'slash' | 'button' | 'selectMenu' | 'modal';
    subCommand?: string;
    subCommandGroup?: string;
    [key: string | number | symbol | `${any}`]: any;
}

export type CommandsEventMap = {
    [K in keyof typeof EventsMap]?: Collective<number, CommandData>;
};

const EventsMap: Record<string, string> = {};
for (const event of Object.values(DiscordEvents) as string[]) {
    EventsMap[event] = event;
}

/**
 * The commands manager instance to manage client commands and events
 *
 * @class CommandsManager
 * @param {ShouwClient} client - The client instance
 * @param {string[]} events - The events to load
 */
export class CommandsManager implements CommandsEventMap {
    /**
     * The client instance
     */
    public readonly client: ShouwClient;

    /**
     * The events to load
     */
    public events?: string[];

    /**
     * The commands event map
     */
    [key: string | number | symbol | `${any}`]: CommandsEventMap | any;

    /**
     * The interaction create event object maps
     */
    public interactionCreate?: {
        slash: Collective<number, CommandData>;
        button: Collective<number, CommandData>;
        selectMenu: Collective<number, CommandData>;
        modal: Collective<number, CommandData>;
    };

    constructor(client: ShouwClient, events: string[] = []) {
        this.client = client;
        this.loadEvents(events);
    }

    /**
     * Load events from the events directory
     *
     * @param {string[]} events - The events to load
     * @return {void} - Nothing
     * @private
     */
    private loadEvents(events: string[]): undefined {
        if (!Array.isArray(events)) return;
        (this.events = events.filter((e: string) => Object.values(DiscordEvents).includes(e as DiscordEvents))).push(
            'ready'
        );

        for (const event of this.events) {
            const eventPath = `${this.getEventPath(event)}.js`;
            if (!eventPath.endsWith('.js')) continue;

            try {
                let EventModule = require(eventPath);
                EventModule = EventModule ? (EventModule?.default ?? EventModule) : void 0;

                if (!EventModule) {
                    this.client.debug(`Event ${event} has no default export`, 'WARN');
                    continue;
                }

                if (event === 'interactionCreate') {
                    this.interactionCreate = {
                        slash: new Collective(),
                        button: new Collective(),
                        selectMenu: new Collective(),
                        modal: new Collective()
                    };
                } else {
                    this[event] = new Collective();
                }

                this.client.on(event, async (...args: any[]) => {
                    try {
                        await EventModule(...args, this.client);
                    } catch (err: any) {
                        this.client.debug(`Error in event ${event}:\n${err.stack}`, 'ERROR');
                    }
                });

                this.client.debug(`Event loaded: ${cyan(event)}`);
            } catch (err: any) {
                this.client.debug(`Error in event ${event}:\n${err.stack}`, 'ERROR');
            }
        }
    }

    /**
     * Get the event path based on the event category
     *
     * @param {string} type - The event type to get the path for
     * @return {string} - The event path based on the event category
     * @private
     */
    private getEventPath(type: string): string {
        if (type.startsWith('message')) return `../events/message/${type}`;
        if (type.startsWith('guild')) return `../events/guild/${type}`;
        if (type.startsWith('role')) return `../events/role/${type}`;
        if (type.startsWith('channel')) return `../events/channel/${type}`;
        if (type.startsWith('stageInstance')) return `../events/stage/${type}`;
        if (type.startsWith('sticker')) return `../events/sticker/${type}`;
        if (type.startsWith('thread')) return `../events/thread/${type}`;
        if (type.startsWith('invite')) return `../events/invite/${type}`;
        if (type.startsWith('member')) return `../events/member/${type}`;
        if (type.startsWith('emoji')) return `../events/emoji/${type}`;
        if (type.startsWith('ban')) return `../events/ban/${type}`;
        if (type.startsWith('reaction')) return `../events/reaction/${type}`;
        if (type.startsWith('shard')) return `../events/shard/${type}`;
        if (type.startsWith('autoMod')) return `../events/automod/${type}`;
        if (type.startsWith('entitlement')) return `../events/entitlement/${type}`;
        return `../events/misc/${type}`;
    }
}
