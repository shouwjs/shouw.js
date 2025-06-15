"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class DeleteCache extends index_js_1.Functions {
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
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [input]) {
        if (!ctx.hasCache(input.unescape()))
            return await ctx.error(index_js_1.Constants.Errors.cacheNotFound(input));
        ctx.deleteCache(input.unescape());
        return this.success();
    }
}
exports.default = DeleteCache;
