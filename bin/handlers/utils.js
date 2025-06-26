// @ts-check

const chalk = require('chalk');

/**
 * This function is used to log messages to the console.
 *
 * @param {string} message - The message to log.
 * @param {string} _type - The type of the message.
 * @returns {void} - Nothing.
 */
exports.log = (message, _type = 'INFO') => {
    const type = _type.toUpperCase() === 'INFO' ? chalk.blue('INFO') : chalk.red(_type.toUpperCase());

    console.log(`${chalk.bold(`[${type}]`)} :: ${message}`);
};

/**
 * This object is used to store the versions of the dependencies.
 * @type {{ node: string, discord: string, shouw: string, requiredNode: number, currentNode: number }}
 */
exports.versions = {
    node: process.version,
    discord: require('discord.js').version,
    shouw: require('../../package.json').version.replace('^', ''),
    requiredNode: 20,
    currentNode: Number.parseInt(process.version.split('.')[0].replace('v', ''))
};
