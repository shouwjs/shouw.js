import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class CacheDataSize extends Functions {
    constructor() {
        super({
            name: '$cacheDataSize',
            description: 'This function returns the size of the cache data',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache data to get the size of',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name]: [string]) {
        if (!ctx.hasCache(name)) return await ctx.error(ctx.constants.Errors.cacheNotFound(name), this.name);

        return this.success(ctx.getCacheSize(name));
    }
}

const example = `
$createCache[test]
$setCacheData[test;key;value]
$cacheDataSize[test]  // returns 1

$cacheDataSize[test2] // returns error, cache not found
`;
