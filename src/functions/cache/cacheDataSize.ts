import { ParamType, Functions, Constants, type Interpreter } from '../../index.js';

export default class CacheDataSize extends Functions {
    constructor() {
        super({
            name: '$cacheDataSize',
            description: 'Check the size of a cache data',
            brackets: true,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache',
                    required: true,
                    type: ParamType.String
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name]: [string]) {
        if (!ctx.hasCache(name.unescape()))
            return await ctx.error(Constants.Errors.cacheNotFound(name.unescape()), this.name);

        return this.success(ctx.getCacheSize(name.unescape()));
    }
}
