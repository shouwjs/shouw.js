const { log } = require('./utils.js');
const { existsSync, mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const chalk = require('chalk');
const readline = require('node:readline');
const { execSync } = require('node:child_process');

// === Main Command === //

exports.InitCommand = async () => {
    const line = '='.repeat(process.stdout.columns);
    console.log(line);
    console.log('\n');
    log('You can skip these questions by leaving it blank or answer --exit to cancel the process.');
    console.log('\n');

    const name = await getName();
    if (name === '--exit') return log('Exiting...', 'EXIT');

    const description = await getDescription();
    if (description === '--exit') return log('Exiting...', 'EXIT');

    const musicOpt = await withMusic();
    if (musicOpt === '--exit') return log('Exiting...', 'EXIT');

    const token = await getToken();
    if (token === '--exit') return log('Exiting...', 'EXIT');

    const music = musicOpt === true;

    console.log('\n');

    if (!existsSync(name)) {
        log(`Creating project directory ${name}...`);
        mkdirSync(name);
    } else {
        log(`Project directory ${name} already exists.`, 'WARN');
        return process.exit(1);
    }

    log('Creating package.json...');
    writeFileSync(join(name, 'package.json'), getPackageJson(name, description, music));

    log('Creating index.js...');
    writeFileSync(join(name, 'index.js'), getIndexJs(music, token));

    log('Creating commands directory...');
    const commandsDir = join(name, 'commands');
    mkdirSync(commandsDir);
    const [helloCmd, hiSho] = getCommands();
    writeFileSync(join(commandsDir, 'hello.js'), helloCmd);
    writeFileSync(join(commandsDir, 'hi.sho'), hiSho);

    log('Installing dependencies...');
    try {
        execSync(`cd ${name} && npm install`, { stdio: 'inherit' });
    } catch (err) {
        log('Dependency installation failed.', 'ERROR');
        return process.exit(1);
    }

    console.log('\n');
    log('DONE!');
    log(`You can start your project by running ${chalk.bold(`cd ${name} && npm start`)}`);
    console.log('\n');
    console.log(line);
};

// === Helper Functions === //

async function question(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const answer = await new Promise((resolve) => rl.question(formatQuestion(query), resolve));
    rl.close();
    return answer.trim();
}

async function getName() {
    const name = await question('Enter your project name');
    if (!name) return 'shouw.js';
    return name.toLowerCase().replace(/ |\//g, '-');
}

async function getDescription() {
    const desc = await question('Enter your project description');
    if (!desc) return "A simple string package that helps you interact with Discord's API easily.";
    return desc;
}

async function getToken() {
    const token = await question('Enter your bot token');
    if (!token) return 'YOUR_TOKEN_HERE';
    return token;
}

async function withMusic() {
    const input = await question('Do you want to use music extension? (y/n)');
    if (input === '--exit') return '--exit';
    return input.toLowerCase() === 'y';
}

function formatQuestion(query) {
    return `${chalk.bold(`[${chalk.blue('?!')}]`)} :: ${query}: `;
}

function getPackageJson(name, description, music) {
    const dependencies = {
        'shouw.js': 'github:shouwjs/shouw.js'
    };
    if (music) {
        dependencies['shouw.music'] = 'github:shouwjs/music';
        dependencies['ffmpeg-static'] = 'latest';
    }

    return JSON.stringify(
        {
            name,
            version: '1.0.0',
            description,
            main: 'index.js',
            scripts: {
                start: 'node index.js'
            },
            keywords: [],
            author: 'You',
            license: 'ISC',
            dependencies
        },
        null,
        4
    );
}

function getIndexJs(music, token) {
    return `const { ShouwClient } = require('shouw.js');${
        music
            ? `const { ShouwMusic, Events } = require('shouw.music');

const music = new ShouwMusic({
    events: [Events.PlayerStart],
    youtube: {
        streamOptions: {
            useClient: 'WEB_EMBEDDED'
        },
        generateWithPoToken: true
    }
});\n`
            : ''
    }

const client = new ShouwClient({
    token: '${token}',${
        music
            ? `
    extensions: [music],`
            : ''
    }
    prefix: '!',
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    events: ['messageCreate'],
});

client.command({
    name: 'ping',
    code: 'Pong! $pingms'
});

client.loadCommands('./commands');
`;
}

function getCommands() {
    return [
        `module.exports = {
    name: 'hello',
    code: 'Hello command!'
};`,
        `@Command({
    name: 'hi'
})

Hi command!
`
    ];
}
