import { Functions, type Interpreter } from '../../index.js';

export default class Ping extends Functions {
    constructor() {
        super({
            name: '$ping',
            description: 'This function will return the ping of the bot.',
            brackets: false,
            example
        });
    }

    code(ctx: Interpreter) {
        return this.success(ctx.client.ws.ping);
    }
}

const example = `
$ping // returns the ping of the bot
`;
