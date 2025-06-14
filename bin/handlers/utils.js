const chalk = require('chalk');

exports.log = (message, _type = 'INFO') => {
    const type = _type.toUpperCase() === 'INFO' ? chalk.blue('INFO') : chalk.red(_type.toUpperCase());

    console.log(`${chalk.bold(`[${type}]`)} :: ${message}`);
};

exports.versions = {
    node: process.version,
    discord: require('discord.js').version,
    shouw: require('../../package.json').version.replace('^', ''),
    requiredNode: 20,
    currentNode: process.version.split('.')[0].replace('v', '')
};
