import { Functions, type Interpreter } from '../../index.js';

export default class Ping extends Functions {
    constructor() {
        super({
            name: '$ping',
            description: 'Ping the bot',
            brackets: false
        });
    }

    code(ctx: Interpreter) {
        return this.success(ctx.client.ws.ping);
    }
}
