"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
class Ping extends core_1.Functions {
    constructor() {
        super({
            name: '$ping',
            description: 'Ping the bot',
            brackets: true
        });
    }
    code(ctx) {
        return this.success(ctx.client.ws.ping);
    }
}
exports.default = Ping;
