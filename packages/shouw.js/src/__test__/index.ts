import { ShouwClient, type Interpreter } from '..';

const client = new ShouwClient({
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
    name: 'ready',
    type: 'ready',
    code: (ctx: Interpreter) => {
        ctx.client.debug(`Logged in as ${ctx.client.user?.username}`);
    }
});

client.loadCommands(`${__dirname}/commands`);
