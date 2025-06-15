"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class CreateCache extends index_js_1.Functions {
    constructor() {
        super({
            name: '$createCache',
            description: 'Creates a new cache data',
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
        if (!ctx.hasCache(input.unescape()))
            ctx.createCache(input.unescape());
        return this.success();
    }
}
exports.default = CreateCache;
