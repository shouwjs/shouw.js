import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class HasCache extends Functions {
    constructor() {
        super({
            name: '$hasCache',
            description: 'This function will return true if the cache with the given name exists',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache to check',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [input]: [string]) {
        return this.success(ctx.hasCache(input));
    }
}

const example = `
$createCache[test]
$hasCache[test] // returns true
$hasCache[test2] // returns false
`;
