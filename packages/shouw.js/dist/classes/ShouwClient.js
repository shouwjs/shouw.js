"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShouwClient = void 0;
const path = require("node:path");
const fs = require("node:fs");
const Reader_1 = require("../core/Reader");
const chalk_1 = require("chalk");
const _1 = require("./");
const BaseClient_1 = require("./BaseClient");
class ShouwClient extends BaseClient_1.BaseClient {
    constructor(options) {
        super(options);
        this.shouwOptions = options;
        this.prefix = Array.isArray(options.prefix) ? options.prefix : [options.prefix];
        this.functions = new _1.FunctionsManager(this);
        this.commands = new _1.CommandsManager(this, options.events);
        this.functions.load(path.join(__dirname, '../functions'), options.debug ?? false);
        options.extensions = Array.isArray(options.extensions) ? options.extensions : [options.extensions];
        for (const extension of options.extensions) {
            extension?.initialize(this);
        }
    }
    // ADD COMMAND TO CLIENT
    command(data) {
        if (typeof data !== 'object' ||
            !data ||
            !data.name ||
            !data.type ||
            !data.code ||
            (typeof data.code !== 'string' && typeof data.code !== 'function'))
            return this;
        const command = this.commands[data?.type];
        if (!command)
            return this;
        command.set(command.size, data);
        return this;
    }
    // LOAD COMMANDS FROM DIRECTORY
    loadCommands(dir, _logging = false) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (!fs.statSync(filePath).isDirectory()) {
                if (file.endsWith('.js')) {
                    let commands = require(filePath);
                    commands = Array.isArray(commands) ? commands : [commands];
                    for (const command of commands) {
                        if (typeof command !== 'object' || !command || !command.name || !command.type || !command.code)
                            continue;
                        this.command(command);
                        this.debug(`Loaded command ${command.name} from ${file}`, 'DEBUG');
                    }
                }
                else if (file.endsWith('.shouw') || file.endsWith('.shw') || file.endsWith('.sho')) {
                    const commands = new Reader_1.Parser(filePath).execute();
                    for (const command of commands) {
                        if (typeof command !== 'object' || !command || !command.name || !command.type || !command.code)
                            continue;
                        this.command(command);
                        this.debug(`Loaded command ${command.name} from ${file}`, 'DEBUG');
                    }
                }
                else {
                    this.debug(`Skipping ${file} because it's not a valid file type`, 'ERROR');
                }
            }
        }
        return this;
    }
    // DEBUG MESSAGE
    debug(message, type = 'DEBUG', force = false) {
        if (message && (force === true || this.shouwOptions.debug === true)) {
            const color = type === 'ERROR' ? chalk_1.red : chalk_1.blue;
            console.log(`[${color(type)}] :: ${message}`);
        }
        return this;
    }
}
exports.ShouwClient = ShouwClient;
