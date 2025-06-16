import { Functions, type Interpreter, ParamType } from '../../index.js';

export default class ClientToken extends Functions {
    constructor() {
        super({
            name: '$clientToken',
            description: 'This function will return the bot token.',
            brackets: false,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'spoiler',
                    description: 'Whether to spoiler the token or not.',
                    type: ParamType.Boolean,
                    required: false,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [spoiler = false]: [boolean?]) {
        return this.success(spoiler === true ? `||${ctx.client.token}||` : ctx.client.token);
    }
}

const example = `
$clientToken // returns the bot token
$clientToken[true] // returns the bot token with spoiler
`;
