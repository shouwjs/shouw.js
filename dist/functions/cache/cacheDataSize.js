"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class CacheDataSize extends index_js_1.Functions {
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
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [name]) {
        if (!ctx.hasCache(name.unescape()))
            return await ctx.error(index_js_1.Constants.Errors.cacheNotFound(name.unescape()));
        return this.success(ctx.getCacheSize(name.unescape()));
    }
}
exports.default = CacheDataSize;
