import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Wait extends Functions {
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
                    type: ParamType.String
                }
            ]
        });
    }

    async code(ctx: Interpreter, [time]: [string]) {
        const timer = Number.isNaN(Number(time)) ? ctx.time.parse(time).ms || 0 : Number(time);
        await ctx.sleep(Number(timer));
        return this.success();
    }
}
