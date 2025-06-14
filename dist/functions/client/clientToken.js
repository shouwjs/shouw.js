"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ClientToken extends index_js_1.Functions {
    constructor() {
        super({
            name: '$clientToken',
            description: 'Returns the token of the client.',
            brackets: false,
            params: [
                {
                    name: 'spoiler',
                    description: 'Whether to spoiler the token.',
                    type: index_js_1.ParamType.Boolean,
                    required: false
                }
            ]
        });
    }
    code(ctx, [spoiler = false]) {
        return this.success(spoiler === true ? `||${ctx.client.token}||` : ctx.client.token);
    }
}
exports.default = ClientToken;
