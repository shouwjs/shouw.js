import { Functions, type Interpreter, ParamType } from '../../index.js';

export default class ClientToken extends Functions {
    constructor() {
        super({
            name: '$clientToken',
            description: 'Returns the token of the client.',
            brackets: false,
            params: [
                {
                    name: 'spoiler',
                    description: 'Whether to spoiler the token.',
                    type: ParamType.Boolean,
                    required: false
                }
            ]
        });
    }

    code(ctx: Interpreter, [spoiler = false]: [boolean?]) {
        return this.success(spoiler === true ? `||${ctx.client.token}||` : ctx.client.token);
    }
}
