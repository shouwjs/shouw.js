import { Functions, type Interpreter } from '../../core';
import type { FunctionData, FunctionResultData } from '../../typings';

export default class Ping extends Functions {
    constructor() {
        super({
            name: '$ping',
            description: 'Ping the bot',
            brackets: true
        } as FunctionData);
    }

    code(ctx: Interpreter): FunctionResultData {
        return this.success(ctx.client.ws.ping);
    }
}
