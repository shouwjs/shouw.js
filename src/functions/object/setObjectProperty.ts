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
        if (!ctx.hasObject(name.unescape())) return await ctx.error(Constants.Errors.objectNotFound(name), this.name);

        let v = value.unescape();
        try {
            v = JSON.parse(value.unescape());
        } catch {
            v = value;
        }

        ctx.setObjectProperty(name.unescape(), property.unescape(), v);
        return this.success();
    }
}
