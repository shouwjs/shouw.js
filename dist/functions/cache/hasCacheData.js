"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class HasCacheData extends index_js_1.Functions {
    constructor() {
        super({
            name: '$hasCacheData',
            description: 'Check if a cache data exists',
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
    code(ctx, [name, key]) {
        return this.success(ctx.hasCacheData(name.unescape(), key.unescape()));
    }
}
exports.default = HasCacheData;
