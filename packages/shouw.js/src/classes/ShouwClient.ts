import * as path from 'node:path';
import * as fs from 'node:fs';
import { Reader } from '../core';
import { cyan, blue, yellow, red } from 'chalk';
import type { ShouwClientOptions, CommandData } from '../typings';
import { FunctionsManager, CommandsManager } from './';
import { BaseClient } from './BaseClient';

export class ShouwClient extends BaseClient {
    public functions: FunctionsManager;
    public commands: CommandsManager;
    public database?: any;
    public readonly prefix: Array<string>;
    public readonly shouwOptions: ShouwClientOptions;

    constructor(options: ShouwClientOptions) {
        super(options);
        this.shouwOptions = options;
        this.prefix = Array.isArray(options.prefix) ? options.prefix : [options.prefix];
        this.functions = new FunctionsManager(this);
        this.commands = new CommandsManager(this, options.events);
        this.functions.load(path.join(__dirname, '../functions'), options.debug ?? false);

        options.extensions = Array.isArray(options.extensions) ? options.extensions : [options.extensions];
        for (const extension of options.extensions) {
            extension?.initialize(this);
        }
    }

    // ADD COMMAND TO CLIENT
    public command(data: CommandData): ShouwClient {
        if (
            typeof data !== 'object' ||
            !data ||
            !data.name ||
            !data.type ||
            !data.code ||
            (typeof data.code !== 'string' && typeof data.code !== 'function')
        )
            return this;
        const command = this.commands[data?.type];
        if (!command) return this;
        command.set(command.size, data);
        return this;
    }

    // LOAD COMMANDS FROM DIRECTORY
    public loadCommands(dir: string, _logging = false): ShouwClient {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (!fs.statSync(filePath).isDirectory()) {
                if (file.endsWith('.js')) {
                    let commands = require(filePath);
                    commands = commands ? (commands?.default ?? commands) : [];
                    commands = Array.isArray(commands) ? commands : [commands];
                    for (const command of commands) {
                        if (typeof command !== 'object' || !command || !command.name || !command.type || !command.code)
                            continue;
                        this.command(command as CommandData);
                        this.debug(`Loaded command ${cyan(command.name)} from ${cyan(file)}`, 'DEBUG');
                    }
                } else if (file.endsWith('.shouw') || file.endsWith('.shw') || file.endsWith('.sho')) {
                    const commands = new Reader(filePath).execute();
                    for (const command of commands) {
                        if (typeof command !== 'object' || !command || !command.name || !command.type || !command.code)
                            continue;
                        this.command(command as CommandData);
                        this.debug(`Loaded command ${cyan(command.name)} from ${cyan(file)}`, 'DEBUG');
                    }
                } else {
                    this.debug(`Skipping ${red(file)} because it's not a valid file type`, 'ERROR');
                }
            }
        }

        return this;
    }

    // DEBUG MESSAGE
    public debug(message: string, type: 'ERROR' | 'DEBUG' | 'WARN' = 'DEBUG', force = false): ShouwClient {
        if (message && (force === true || this.shouwOptions.debug === true)) {
            const color = type === 'ERROR' ? red : type === 'WARN' ? yellow : blue;
            console.log(`[${color(type)}] :: ${message}`);
        }

        return this;
    }
}
