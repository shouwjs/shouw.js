"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandsManager = void 0;
const utils_1 = require("../utils");
const discord_js_1 = require("discord.js");
const chalk_1 = require("chalk");
class CommandsManager {
    constructor(client, events) {
        this.client = client;
        if (Array.isArray(events)) {
            this.events = [...events.filter((e) => Object.values(discord_js_1.Events).includes(e)), 'ready'];
            for (const event of this.events) {
                if (event === 'interactionCreate') {
                    this[event] = {
                        slash: new utils_1.Collective(),
                        button: new utils_1.Collective(),
                        selectMenu: new utils_1.Collective(),
                        modal: new utils_1.Collective()
                    };
                }
                else {
                    this[event] = new utils_1.Collective();
                }
                this.client.on(event, (...args) => {
                    try {
                        require(`../events/${event}`).default(...args, this.client);
                    }
                    catch (err) {
                        this.client.debug(`Error in event ${event}: ${err.message}`, 'ERROR');
                    }
                });
                this.client.debug(`Event loaded: ${(0, chalk_1.cyan)(event)}`);
            }
        }
    }
}
exports.CommandsManager = CommandsManager;
