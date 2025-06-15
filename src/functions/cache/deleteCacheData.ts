import { ParamType, Functions, Constants, type Interpreter } from '../../index.js';

export default class DeleteCacheData extends Functions {
    constructor() {
        super({
            name: '$deleteCacheData',
            description: 'Delete a cache data',
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
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name, key]: [string, string]) {
        if (!ctx.hasCache(name.unescape())) return await ctx.error(Constants.Errors.cacheNotFound(name));

        ctx.deleteCacheData(name.unescape(), key.unescape());
        return this.success();
    }
}
