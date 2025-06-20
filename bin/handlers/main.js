const { log } = require("./utils.js");
const { VersionCommand } = require("./version.js");
const { HelpCommand } = require("./help.js");
const { InitCommand } = require("./init.js");

/**
 * This function is used to handle the main command.
 *
 * @returns {Promise<void>} - Nothing.
 */
async function main() {
	try {
		const _args = process.argv.slice(2);
		if (_args.length === 0) return HelpCommand();
		const flags = _args.filter((arg) => arg.startsWith("--"));
		const args = _args.filter((arg) => !arg.startsWith("--"));
		const command = args.shift();

		switch (command) {
			case "version":
			case "v":
			case "ver":
				return VersionCommand();
			case "help":
			case "h":
			case "?":
				return HelpCommand(args);
			case "init":
			case "create":
				return InitCommand(args, flags);
			default:
				return HelpCommand(args);
		}
	} catch (err) {
		log(err?.stack ?? err, "ERROR");
		process.exit(1);
	}
}

main();
