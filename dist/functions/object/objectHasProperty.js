"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ObjectHasProperty extends index_js_1.Functions {
    constructor() {
        super({
            name: '$objectHasProperty',
            description: 'Checks if an object has a property',
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
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [name, property]) {
        if (!ctx.hasObject(name))
            return await ctx.error(index_js_1.Constants.Errors.objectNotFound(name), this.name);
        const object = ctx.getObject(name);
        return this.success(Object.hasOwn(object ?? {}, property));
    }
}
exports.default = ObjectHasProperty;
