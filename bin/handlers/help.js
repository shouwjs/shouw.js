const { log } = require('./utils.js');
const chalk = require('chalk');

/**
 * This function is used to display the help information.
 *
 * @param {string[]} args - The arguments passed to the command.
 * @returns {void} - Nothing.
 */
exports.HelpCommand = (args) => {
    const line = '='.repeat(process.stdout.columns || 80);
    console.log(line);
    console.log('\n');
    log(chalk.bold('Shouw.js CLI'), 'INFO');
    console.log('\n');

    if (!args || args.length === 0) {
        log('Usage: shouw <command> [options]');
        log('Commands:');
        log('  version, v, ver');
        log('      Display the current version');
        log('');
        log('  help, h, ?');
        log('      Show detailed help information');
        log('');
        log('  init, create');
        log('      Generate a new Shouw.js project');
    } else {
        const command = args[0].toLowerCase();
        switch (command) {
            case 'version':
            case 'v':
            case 'ver':
                log('Command: version');
                log('Usage: shouw version');
                log('Description:');
                log('  Prints the current installed version');
                break;

            case 'help':
            case 'h':
            case '?':
                log('Command: help');
                log('Usage: shouw help [command]');
                log('Description:');
                log('  Displays helpful information about available commands and their usage.');
                log('  If a command is provided, shows details for that specific command.');
                break;

            case 'init':
            case 'create':
                log('Command: init');
                log('Usage: shouw init <project-name> [options]');
                log('Description:');
                log('  Scaffolds a new Shouw.js project with default files and configurations.');
                break;

            default:
                log(`Unknown command: ${command}`, 'ERROR');
                log('Use "shouw help" to view a list of supported commands and usage examples.');
        }
    }

    console.log('\n');
    console.log(line);
};
