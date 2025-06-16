/**
 * Import the ShouwClient class from the shouw.js package.
 */
const { ShouwClient } = require('../..');

/**
 * Initialize the client.
 */
const client = new ShouwClient({
    token: process.env.TOKEN,
    prefix: '+',
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    events: ['messageCreate', 'interactionCreate'],
    disableFunctions: ['$clientToken']
});

/**
 * Register a command.
 */
client.command({
    type: 'ready',
    code: (ctx) => {
        ctx.client.debug(`Logged in as ${ctx.client.user.tag}!`);
    }
});

/**
 * Load the commands from the commands directory.
 */
client.loadCommands('tests/client/commands');
