"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Ping extends index_js_1.Functions {
    constructor() {
        super({
            name: '$ping',
            description: 'Ping the bot',
            brackets: false
        });
    }
    code(ctx) {
        return this.success(ctx.client.ws.ping);
    }
}
exports.default = Ping;
