"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Wait extends index_js_1.Functions {
    constructor() {
        super({
            name: '$wait',
            description: 'Waits for a given amount of time.',
            brackets: true,
            params: [
                {
                    name: 'time',
                    description: 'The time to wait for.',
                    required: true,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [time]) {
        const timer = Number.isNaN(Number(time)) ? ctx.time.parse(time).ms || 0 : Number(time);
        await ctx.sleep(Number(timer));
        return this.success();
    }
}
exports.default = Wait;
