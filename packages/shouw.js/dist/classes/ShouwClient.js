"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShouwClient = void 0;
const path = require("node:path");
const fs = require("node:fs");
const core_1 = require("../core");
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
                    commands = commands ? (commands?.default ?? commands) : [];
                    commands = Array.isArray(commands) ? commands : [commands];
                    for (const command of commands) {
                        if (typeof command !== 'object' || !command || !command.name || !command.type || !command.code)
                            continue;
                        this.command(command);
                        this.debug(`Loaded command ${(0, chalk_1.cyan)(command.name)} from ${(0, chalk_1.cyan)(file)}`, 'DEBUG');
                    }
                }
                else if (file.endsWith('.shouw') || file.endsWith('.shw') || file.endsWith('.sho')) {
                    const commands = new core_1.Reader(filePath).execute();
                    for (const command of commands) {
                        if (typeof command !== 'object' || !command || !command.name || !command.type || !command.code)
                            continue;
                        this.command(command);
                        this.debug(`Loaded command ${(0, chalk_1.cyan)(command.name)} from ${(0, chalk_1.cyan)(file)}`, 'DEBUG');
                    }
                }
                else {
                    this.debug(`Skipping ${(0, chalk_1.red)(file)} because it's not a valid file type`, 'ERROR');
                }
            }
        }
        return this;
    }
    // DEBUG MESSAGE
    debug(message, type = 'DEBUG', force = false) {
        if (message && (force === true || this.shouwOptions.debug === true)) {
            const color = type === 'ERROR' ? chalk_1.red : type === 'WARN' ? chalk_1.yellow : chalk_1.blue;
            console.log(`[${color(type)}] :: ${message}`);
        }
        return this;
    }
}
exports.ShouwClient = ShouwClient;
