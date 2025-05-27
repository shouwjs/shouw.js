"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const typings_1 = require("../../typings");
class Wait extends core_1.Functions {
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
                    type: typings_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [time]) {
        const timer = Number.isNaN(Number(time)) ? ctx.helpers.time.parse(time).ms || 0 : Number(time);
        await ctx.helpers.sleep(Number(timer));
        return this.success();
    }
}
exports.default = Wait;
