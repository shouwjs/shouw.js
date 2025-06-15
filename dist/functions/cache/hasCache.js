"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class HasCache extends index_js_1.Functions {
    constructor() {
        super({
            name: '$hasCache',
            description: 'Check if a cache exists',
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
    code(ctx, [input]) {
        return this.success(ctx.hasCache(input.unescape()));
    }
}
exports.default = HasCache;
