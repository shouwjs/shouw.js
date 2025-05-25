"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const client = new __1.ShouwClient({
    token: process.env.TOKEN,
    prefix: '+',
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    events: ['messageCreate'],
    debug: true,
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false
    }
});
client.command({
    name: 'eval',
    type: 'messageCreate',
    code: '```js\n$eval[$message;true;true;true;true;true]```'
});
client.command({
    type: 'ready',
    code: (ctx) => {
        ctx.client.debug(`Logged in as ${ctx.client.user?.username}`);
    }
});
client.loadCommands(`${__dirname}/commands`);
