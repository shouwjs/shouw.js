// import the client class (currently only CommonJS is supported)
const { ShouwClient } = require('..');

// initialize the client instance
const client = new ShouwClient({
    token: process.env.TOKEN,
    prefix: '+',
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    events: ['messageCreate', 'interactionCreate'],
    debug: true,
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false
    }
});

// ready event
client.command({
    type: 'ready',
    code: (ctx) => {
        ctx.client.debug(`Logged in as ${ctx.client.user.tag}!`);
    }
});

// load commands from directory
client.loadCommands('test/commands');
