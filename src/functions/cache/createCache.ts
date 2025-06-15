import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class CreateCache extends Functions {
    constructor() {
        super({
            name: '$createCache',
            description: 'Creates a new cache data',
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
        if (!ctx.hasCache(input.unescape())) ctx.createCache(input.unescape());
        return this.success();
    }
}
