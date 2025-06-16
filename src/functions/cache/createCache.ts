import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class CreateCache extends Functions {
    constructor() {
        super({
            name: '$createCache',
            description: 'This function will create a new cache with the given name',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache to create',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [input]: [string]) {
        if (!ctx.hasCache(input)) ctx.createCache(input);
        return this.success();
    }
}

const example = `
$createCache[test] // creates a new cache with the name test
$createCache[test2] // creates a new cache with the name test2
`;
