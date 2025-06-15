"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ObjectHasOwn extends index_js_1.Functions {
    constructor() {
        super({
            name: '$objectHasOwn',
            description: 'Check if an object has a property',
            brackets: true,
            params: [
                {
                    name: 'object',
                    description: 'The object to check',
                    required: true,
                    type: index_js_1.ParamType.Object
                },
                {
                    name: 'property',
                    description: 'The property to check',
                    required: true,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(_ctx, [object, property]) {
        return this.success(Object.hasOwn(object, property.unescape()));
    }
}
exports.default = ObjectHasOwn;
