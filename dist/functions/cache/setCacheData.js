"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class SetCacheData extends index_js_1.Functions {
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
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'key',
                    description: 'The key of the cache',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'value',
                    description: 'The value of the cache',
                    required: true,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [name, key, value]) {
        if (!ctx.hasCache(name.unescape()))
            return await ctx.error(index_js_1.Constants.Errors.cacheNotFound(name));
        ctx.setCacheData(name.unescape(), key.unescape(), value.unescape());
        return this.success();
    }
}
exports.default = SetCacheData;
