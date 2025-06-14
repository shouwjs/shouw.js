const { ShouwClient } = require('../..');

const client = new ShouwClient({
    token: process.env.TOKEN,
    prefix: '+',
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    events: ['messageCreate', 'interactionCreate'],
    debug: true,
    disableFunctions: ['$clientToken']
});

client.command({
    type: 'ready',
    code: (ctx) => {
        ctx.client.debug(`Logged in as ${ctx.client.user.tag}!`);
    }
});

client.loadCommands('tests/client/commands');
