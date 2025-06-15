import { ParamType, Functions, Constants, type Interpreter } from '../../index.js';

export default class SetCacheData extends Functions {
    constructor() {
        super({
            name: '$setCacheData',
            description: 'Sets a cache data',
            brackets: true,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'key',
                    description: 'The key of the cache',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'value',
                    description: 'The value of the cache',
                    required: true,
                    type: ParamType.String
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name, key, value]: [string, string, string]) {
        if (!ctx.hasCache(name.unescape())) return await ctx.error(Constants.Errors.cacheNotFound(name));

        ctx.setCacheData(name.unescape(), key.unescape(), value.unescape());
        return this.success();
    }
}
