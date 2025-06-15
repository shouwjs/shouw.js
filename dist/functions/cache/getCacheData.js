"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class GetCacheData extends index_js_1.Functions {
    constructor() {
        super({
            name: '$getCacheData',
            description: 'Gets a cache data',
            brackets: true,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'key',
                    description: 'The key of the cache',
                    required: true,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [name, key]) {
        if (!ctx.hasCache(name.unescape()))
            return await ctx.error(index_js_1.Constants.Errors.cacheNotFound(name));
        return this.success(ctx.getCacheData(name.unescape(), key.unescape()));
    }
}
exports.default = GetCacheData;
