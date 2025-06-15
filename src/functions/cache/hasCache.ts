import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class HasCache extends Functions {
    constructor() {
        super({
            name: '$hasCache',
            description: 'Check if a cache exists',
            brackets: true,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [input]: [string]) {
        return this.success(ctx.hasCache(input.unescape()));
    }
}
