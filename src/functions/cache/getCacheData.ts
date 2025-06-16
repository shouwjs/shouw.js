import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class GetCacheData extends Functions {
    constructor() {
        super({
            name: '$getCacheData',
            description: 'This function will return the cache data with the given name and key',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'key',
                    description: 'The key of the cache data to get',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name, key]: [string, string]) {
        if (!ctx.hasCache(name)) return await ctx.error(ctx.constants.Errors.cacheNotFound(name), this.name);

        return this.success(ctx.getCacheData(name, key));
    }
}

const example = `
$createCache[test]
$setCacheData[test;key;value]
$getCacheData[test;key] // returns value

$getCacheData[test;key2] // returns nothing 
`;
