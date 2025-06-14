import { ParamType, Functions, type Interpreter, Constants } from '../../index.js';

export default class SetObjectProperty extends Functions {
    constructor() {
        super({
            name: '$setObjectProperty',
            description: 'Set an object property',
            brackets: true,
            params: [
                {
                    name: 'name',
                    description: 'The name of the object',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'property',
                    description: 'The property name of the object',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'value',
                    description: 'The value to set',
                    required: true,
                    type: ParamType.Any,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name, property, value]: [string, string, string]) {
        if (!ctx.hasObject(name)) return await ctx.error(Constants.Errors.objectNotFound(name), this.name);

        let v = value;
        try {
            v = JSON.parse(value);
        } catch {
            v = value;
        }

        ctx.setObjectProperty(name, property, v);
        return this.success();
    }
}
