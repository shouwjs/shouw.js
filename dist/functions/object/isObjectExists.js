"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class IsObjectExists extends index_js_1.Functions {
    constructor() {
        super({
            name: '$isObjectExists',
            description: 'Checks if an object exists',
            brackets: true,
            params: [
                {
                    name: 'name',
                    description: 'The name of the object',
                    required: true,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    code(ctx, [name]) {
        return this.success(ctx.hasObject(name.unescape()));
    }
}
exports.default = IsObjectExists;
