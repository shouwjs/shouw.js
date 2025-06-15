"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class GetObjectProperty extends index_js_1.Functions {
    constructor() {
        super({
            name: '$getObjectProperty',
            description: 'Get a property from an object',
            brackets: true,
            params: [
                {
                    name: 'name',
                    description: 'The name of the object',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'property',
                    description: 'The property name of the object',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [name, property]) {
        if (!ctx.hasObject(name.unescape()))
            return await ctx.error(index_js_1.Constants.Errors.objectNotFound(name), this.name);
        let v = ctx.getObjectProperty(name.unescape(), property.unescape());
        if (typeof v === 'object')
            v = JSON.stringify(v);
        return this.success(v);
    }
}
exports.default = GetObjectProperty;
