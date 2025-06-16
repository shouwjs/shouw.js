import * as path from 'node:path';
import * as fs from 'node:fs';
import { cyan, blue, yellow, red, gray } from 'chalk';
import type { ClientEvents, ClientOptions } from 'discord.js';
import {
    Reader,
    FunctionsManager,
    CommandsManager,
    Variables,
    CacheManager,
    CustomEvent,
    ConsoleDisplay,
    type CommandData
} from '../index.js';
import { BaseClient } from './BaseClient.js';

export interface ShouwClientOptions extends ClientOptions {
    token: undefined | string;
    events: Array<keyof ClientEvents>;
    prefix: string | string[];
    debug?: boolean;
    extensions?: any[];
    suppressAllErrors?: boolean;
    shouwLogs?: boolean;
    disableFunctions?: string[];
    [key: string | number | symbol | `${any}`]: any;
}

/**
 * The main client class for the Shouw.js library. This class extends the BaseClient class and adds some additional functionality.
 *
 * @class ShouwClient
 * @extends {BaseClient} - The BaseClient class
 * @param {ShouwClientOptions} options - The options for the client
 * @example const client = new ShouwClient({
 *     token: 'your token here',
 *     prefix: '!',
 *     intents: ['Guilds', 'GuildMessages', 'MessageContent'],
 *     events: ['messageCreate'],
 * })
 */
export class ShouwClient extends BaseClient {
    /**
     * The functions manager instance
     * @type {FunctionsManager}
     */
    public functions: FunctionsManager;

    /**
     * The commands manager instance
     * @type {CommandsManager}
     */
    public commands: CommandsManager;

    /**
     * The database instance
     * @type {any}
     */
    public database?: any;

    /**
     * The music instance
     * @type {any}
     */
    public music?: any;

    /**
     * The variables manager instance
     * @type {Variables}
     */
    public readonly variablesManager: Variables;

    /**
     * The cache manager instance
     * @type {CacheManager}
     */
    public readonly cacheManager: CacheManager;

    /**
     * The custom events instance
     * @type {CustomEvent}
     */
    public readonly customEvents: CustomEvent;

    /**
     * The prefix for the client
     * @type {Array<string>}
     */
    public readonly prefix: Array<string>;

    /**
     * The options for the client
     * @type {ShouwClientOptions}
     */
    public readonly shouwOptions: ShouwClientOptions;

    constructor(options: ShouwClientOptions) {
        super(options);
        options.shouwLogs = options.shouwLogs ?? true;
        this.shouwOptions = options;
        this.prefix = Array.isArray(options.prefix) ? options.prefix : [options.prefix];
        this.functions = new FunctionsManager(this);
        this.commands = new CommandsManager(this, options.events);
        this.variablesManager = new Variables(this);
        this.cacheManager = new CacheManager(this);
        this.customEvents = new CustomEvent(this);
        this.functions.load(path.join(__dirname, '../functions'), options.debug ?? false);

        this._disableFunctions(options.disableFunctions);
        this._loadExtensions(options.extensions);
    }

    /**
     * Set a new command to the client
     *
     * @param {CommandData} data - The command data to set
     * @return {ShouwClient} - The main client instance
     * @example <ShouwClient>.command({
     *     name: 'ping',
     *     code: 'Pong! $pingms'
     * })
     */
    public command(data: CommandData): ShouwClient {
        if (
            typeof data !== 'object' ||
            !data ||
            !data.code ||
            (typeof data.code !== 'string' && typeof data.code !== 'function')
        )
            return this;
        if (data.type === 'interactionCreate') {
            if (!this.commands.interactionCreate) return this;
            this.commands.interactionCreate[data.prototype ?? 'slash'].set(
                this.commands.interactionCreate[data.prototype ?? 'slash']?.size,
                data
            );
            return this;
        }

        const command = this.commands[data?.type ?? 'messageCreate'];
        if (!command) return this;
        command.set(command.size, data);
        return this;
    }

    /**
     * Load commands from a directory
     *
     * @param {string} dir - The directory to load commands from
     * @param {boolean} [logging] - Whether to log the commands being loaded
     * @return {ShouwClient} - The main client instance
     * @example <ShouwClient>.loadCommands('commands');
     */
    public loadCommands(dir: string, _logging = false): ShouwClient {
        const files = fs.readdirSync(dir);
        const loadedCommands: Array<{ name: string; command?: string; loaded: boolean; error?: Error }> = [];

        for (const file of files) {
            const filePath = path.join(dir, file);
            try {
                if (!fs.statSync(filePath).isDirectory()) {
                    if (
                        file.endsWith('.js') ||
                        file.endsWith('.cjs') ||
                        file.endsWith('.json') ||
                        file.endsWith('.mjs')
                    ) {
                        let commands = require(path.join(process.cwd(), filePath));
                        commands = commands ? (commands?.default ?? commands) : [];
                        commands = Array.isArray(commands) ? commands : [commands];
                        for (const command of commands) {
                            if (typeof command !== 'object' || !command || !command.code) continue;
                            command.type = command.type ?? 'messageCreate';

                            this.command({
                                ...command,
                                file: filePath
                            } as CommandData);

                            const debugName = `${gray(filePath.split(path.sep).slice(-2).join(path.sep))} (${cyan(command.type ?? 'unknown')})`;
                            loadedCommands.push({
                                name: debugName,
                                command: `${command.name ?? command.channel}`,
                                loaded: true
                            });
                            this.debug(`Loaded command ${cyan(command.name)} from ${cyan(file)}`, 'DEBUG');
                        }
                    } else if (file.endsWith('.shouw') || file.endsWith('.shw') || file.endsWith('.sho')) {
                        const commands = Reader.run(filePath);
                        for (const command of commands) {
                            if (typeof command !== 'object' || !command || !command.code) continue;
                            command.type = command.type ?? 'messageCreate';

                            this.command({
                                ...command,
                                file: filePath
                            } as CommandData);

                            const debugName = `${gray(filePath.split(path.sep).slice(-2).join(path.sep))}  (${cyan(command.type ?? 'unknown')})`;
                            loadedCommands.push({
                                name: debugName,
                                command: `${command.name ?? command.channel}`,
                                loaded: true
                            });
                            this.debug(`Loaded command ${cyan(command.name)} from ${cyan(file)}`, 'DEBUG');
                        }
                    } else {
                        const debugName = `${gray(filePath.split(path.sep).slice(-2).join(path.sep))}`;
                        loadedCommands.push({
                            name: debugName,
                            loaded: false,
                            error: new Error('Not a valid file type')
                        });
                        this.debug(`Skipping ${red(file)} because it's not a valid file type`, 'ERROR');
                    }
                }
            } catch (err: any) {
                const debugName = `${gray(filePath.split(path.sep).slice(-2).join(path.sep))}`;
                loadedCommands.push({ name: debugName, loaded: false, error: err });
                this.debug(`Error loading command ${red(file)}: ${err.stack}`, 'ERROR');
            }
        }

        if (this.shouwOptions.shouwLogs) ConsoleDisplay.commandList('white', loadedCommands);
        return this;
    }

    /**
     * Set variables to the database
     *
     * @param {Record<string, any>} variables - The variables to set
     * @param {string} table - The table to set the variables in
     * @return {ShouwClient} - The main client instance
     * @throws {Error} - Throw an error if the database instance is not defined
     * @example <ShouwClient>.variables({
     *     ping: 'pong',
     *     pong: 'ping'
     * }, 'table_name')
     */
    public variables(variables: Record<string, any>, table: string = this.database?.tables?.[0]): ShouwClient {
        if (!this.database)
            throw new Error('Database instance is not defined! Variables cannot be set without a database.');
        if (typeof variables !== 'object' || !variables) return this;

        for (const [key, value] of Object.entries(variables)) {
            this.variablesManager.set(key, value, table);
        }

        return this;
    }

    /**
     * Load extensions
     *
     * @param {any[] | undefined} extensions - The extensions to load
     * @return {void} - Nothing
     */
    private _loadExtensions(extensions: any[] | undefined): void {
        if (!Array.isArray(extensions)) return;
        for (const extension of extensions) {
            if (!extension || typeof extension?.initialize !== 'function') continue;
            extension.initialize(this);
            this.debug(`Loaded extension ${cyan(extension.name ?? 'unknown')}`, 'DEBUG');
        }
    }

    /**
     * Disable functions
     *
     * @param {string[] | undefined} funcs - The functions to disable
     * @return {void} - Nothing
     */
    private _disableFunctions(funcs: string[] | undefined): void {
        if (!Array.isArray(funcs)) return;
        for (const func of funcs) {
            if (!func) continue;
            const matched = this.functions.filter((f) => f.name.toLowerCase() === func.toLowerCase())[0];
            if (!matched) continue;
            this.functions.delete(matched.name);
            this.debug(`Disabled function ${red(matched.name)}`, 'DEBUG');
        }
    }

    /**
     * Debug function
     *
     * @param {string} message - The message to log
     * @param {'ERROR' | 'DEBUG' | 'WARN'} type - The type of message
     * @param {boolean} force - Whether to force the message to be logged
     * @return {ShouwClient} - The main client instance
     * @example <ShouwClient>.debug('This is a debug message', 'DEBUG', true);
     */
    public debug(message: string, type: 'ERROR' | 'DEBUG' | 'WARN' = 'DEBUG', force = false): ShouwClient {
        if (message && (force === true || this.shouwOptions.debug === true)) {
            const color = type === 'ERROR' ? red : type === 'WARN' ? yellow : blue;
            console.log(`[${color(type)}] :: ${message}`);
        }

        return this;
    }
}
