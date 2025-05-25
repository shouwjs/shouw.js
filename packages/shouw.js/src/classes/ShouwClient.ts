import * as path from 'node:path';
import * as fs from 'node:fs';
import { Parser } from '../core/Reader';
import { blue, red } from 'chalk';
import type { ShouwClientOptions, CommandData } from '../typings';
import { FunctionsManager, CommandsManager } from './';
import { BaseClient } from './BaseClient';

export class ShouwClient extends BaseClient {
    public functions: FunctionsManager;
    public commands: CommandsManager;
    public readonly prefix: Array<string>;
    public readonly shouwOptions: ShouwClientOptions;

    constructor(options: ShouwClientOptions) {
        super(options);
        this.shouwOptions = options;
        this.prefix = Array.isArray(options.prefix) ? options.prefix : [options.prefix];
        this.functions = new FunctionsManager(this);
        this.commands = new CommandsManager(this, options.events);
        this.functions.load(path.join(__dirname, '../functions'), options.debug ?? false);
    }

    public command(data: CommandData): ShouwClient {
        const command = this.commands[data.type];
        if (!command) return this;
        command.set(command.size, data);
        return this;
    }

    public loadCommands(dir: string, logging = false): ShouwClient {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (!fs.statSync(filePath).isDirectory()) {
                if (file.endsWith('.js')) {
                    let commands = require(filePath);
                    commands = Array.isArray(commands) ? commands : [commands];
                    for (const command of commands) {
                        if (typeof command !== 'object' || !command || !command.type || !command.code) continue;
                        this.command(command as CommandData);
                        this.debug(`Loaded command ${command.name} from ${file}`, 'DEBUG');
                    }
                } else if (file.endsWith('.shouw') || file.endsWith('.shw') || file.endsWith('.sho')) {
                    const commands = new Parser(filePath).execute();
                    for (const command of commands) {
                        if (typeof command !== 'object' || !command || !command.type || !command.code) continue;
                        this.command(command as CommandData);
                        this.debug(`Loaded command ${command.name} from ${file}`, 'DEBUG');
                    }
                } else {
                    this.debug(`Skipping ${file} because it's not a valid file type`, 'ERROR');
                }
            }
        }

        return this;
    }

    public debug(message, type: 'ERROR' | 'DEBUG' = 'DEBUG', force = false): ShouwClient {
        if (message && (force === true || this.shouwOptions.debug === true)) {
            const color = type === 'ERROR' ? red : blue;
            console.log(`[${color(type)}] :: ${message}`);
        }

        return this;
    }
}
