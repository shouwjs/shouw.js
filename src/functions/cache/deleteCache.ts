import { ParamType, Functions, Constants, type Interpreter } from '../../index.js';

export default class DeleteCache extends Functions {
    constructor() {
        super({
            name: '$deleteCache',
            description: 'Deletes a cache data',
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

    async code(ctx: Interpreter, [input]: [string]) {
        if (!ctx.hasCache(input.unescape())) return await ctx.error(Constants.Errors.cacheNotFound(input));

        ctx.deleteCache(input.unescape());
        return this.success();
    }
}
