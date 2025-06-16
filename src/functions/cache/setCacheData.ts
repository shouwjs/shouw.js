import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class SetCacheData extends Functions {
    constructor() {
        super({
            name: '$setCacheData',
            description: 'This function will set the cache data with the given name and key',
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
                    description: 'The key of the cache data to set',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'value',
                    description: 'The value of the cache data to set',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name, key, value]: [string, string, string]) {
        if (!ctx.hasCache(name)) return await ctx.error(ctx.constants.Errors.cacheNotFound(name), this.name);

        ctx.setCacheData(name, key, value);
        return this.success();
    }
}

const example = `
$createCache[test]
$setCacheData[test;key;value]
// sets the cache data with the name test and key key to value value
`;
