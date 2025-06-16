import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class DeleteCache extends Functions {
    constructor() {
        super({
            name: '$deleteCache',
            description: 'This function will delete the cache with the given name',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache to delete',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [input]: [string]) {
        if (!ctx.hasCache(input)) return await ctx.error(ctx.constants.Errors.cacheNotFound(input), this.name);

        ctx.deleteCache(input);
        return this.success();
    }
}

const example = `
$createCache[test]
$deleteCache[test] // deletes the cache with the name test

$deleteCache[test2] // returns error, cache not found
`;
