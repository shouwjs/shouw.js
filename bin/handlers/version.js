// @ts-check

const { log, versions } = require('./utils.js');

/**
 * This function is used to display the version information.
 *
 * @returns {void} - Nothing.
 */
exports.VersionCommand = () => {
    console.log('='.repeat(process.stdout.columns));
    console.log('\n');

    log(`Shouw.js v${versions.shouw}`);
    log(`Node.js ${versions.node}`);
    log(`Discord.js v${versions.discord}`);

    if (versions.currentNode < versions.requiredNode) {
        console.log('\n');
        log(
            `Shouw.js requires Node.js v${versions.requiredNode} or higher. You are using Node.js ${versions.currentNode}.`,
            'WARN'
        );
    }

    console.log('\n');
    console.log('='.repeat(process.stdout.columns));
};
