import EventEmitter from 'node:events';
import { Interpreter, type Objects, type Context, type ShouwClient } from '../index.js';
import { Collective } from '../utils/Collective.js';
import type { Channel, Guild } from 'discord.js';

export interface CustomEventData extends Objects {
    name?: string;
    listen: string;
    channel?: string;
    code: string | ((int: Interpreter, ctx: Context, data: Interpreter['Temporarily']) => any);
}

interface InterpreterEventData {
    client: ShouwClient;
    command: CustomEventData;
    channel?: Channel;
    guild?: Guild;
    eventData: any[];
}

/**
 * @class CustomEvent
 * @extends EventEmitter
 *
 * @param {ShouwClient} client - The client instance.
 */
export class CustomEvent {
    /**
     * The client instance.
     */
    public readonly client: ShouwClient;

    /**
     * The listened events.
     */
    readonly #listenedEvents: Collective<string, CustomEventData>;

    /**
     * The events.
     */
    readonly #events: EventEmitter;

    constructor(client: ShouwClient) {
        this.client = client;
        this.#listenedEvents = new Collective();
        this.#events = new EventEmitter();
    }

    /**
     * The listened events.
     *
     * @returns {Collective<string, CustomEventData>} The listened events.
     */
    public get listenedEvents(): Collective<string, CustomEventData> {
        return this.#listenedEvents;
    }

    /**
     * The events.
     *
     * @returns {EventEmitter} The events.
     */
    public get events(): EventEmitter {
        return this.#events;
    }

    /**
     * Add a command to the listened events.
     *
     * @param {CustomEventData[]} datas - The command data.
     * @returns {CustomEvent} The current instance.
     */
    public on(...datas: CustomEventData[]): CustomEvent {
        for (const data of datas) {
            if (typeof data !== 'object' || !data || !data.code || !data.listen) continue;
            this.listenedEvents.set(data.listen, data);
            this.#listen(data.listen, 'on');
        }

        return this;
    }

    /**
     * Add a command to the listened events.
     *
     * @param {CustomEventData[]} datas - The command data.
     * @returns {CustomEvent} The current instance.
     */
    public once(...datas: CustomEventData[]): CustomEvent {
        for (const data of datas) {
            if (typeof data !== 'object' || !data || !data.code || !data.listen) continue;
            this.listenedEvents.set(data.listen, data);
            this.#listen(data.listen, 'once');
        }

        return this;
    }

    /**
     * Emit an event.
     *
     * @param {string} name - The event name.
     * @param {any[]} args - The event arguments.
     * @returns {boolean} Whether the event was emitted.
     */
    public emit(name: string, ...args: any[]): boolean {
        return this.events.emit(name, ...args);
    }

    /**
     * Listen to an event.
     *
     * @param {string[]} name - The event name.
     * @returns {CustomEvent} The current instance.
     */
    #listen(name: string, type: 'on' | 'once' = 'on'): CustomEvent {
        if (!this.listenedEvents.has(name)) return this;
        this.events[type](name, async (...args: any[]) => {
            await Executer(name, this.client, ...args);
        });

        return this;
    }
}

/**
 * Execute the command.
 *
 * @param {string} name - The command name.
 * @param {ShouwClient} client - The client instance.
 * @param {any[]} eventData - The event data.
 * @returns {Promise<void>} The promise.
 */
async function Executer(name: string, client: ShouwClient, ...eventData: any[]): Promise<void> {
    const data = client.customEvents.listenedEvents.get(name);
    if (!data) return;
    const commands = client.customEvents.listenedEvents.filter((v) => v.listen === name);
    if (!commands.length) return;

    for (const command of commands) {
        let channel: Channel | null = null;
        let guild: Guild | null = null;

        if (command.channel?.includes('$')) {
            const parsed = await INIT({ client, command, eventData });
            if (parsed) {
                channel = client.channels.cache.get(parsed) ?? (await client.channels.fetch(parsed));
                guild = channel ? (channel as any)?.guild : null;
            }
        } else {
            channel =
                client.channels.cache.get(command.channel as string) ??
                (await client.channels.fetch(command.channel as string));
            guild = channel ? (channel as any)?.guild : null;
        }

        await INIT({
            client,
            command,
            channel: channel ?? void 0,
            guild: guild ?? void 0,
            eventData
        });
    }
}

/**
 * Initialize the interpreter.
 *
 * @param {InterpreterEventData} data - The interpreter data.
 * @returns {Promise<string>} The promise.
 */
async function INIT({ client, command, channel, guild, eventData }: InterpreterEventData): Promise<string> {
    return (
        (
            await Interpreter.run(command, {
                client,
                channel,
                guild,
                Temporarily: {
                    eventData
                } as any
            })
        )?.result ?? ''
    );
}
