import { ParamType, Functions, type Interpreter, Constants } from '../../index.js';

export default class GetObjectProperty extends Functions {
    constructor() {
        super({
            name: '$getObjectProperty',
            description: 'Get a property from an object',
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
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name, property]: [string, string]) {
        if (!ctx.hasObject(name.unescape())) return await ctx.error(Constants.Errors.objectNotFound(name), this.name);

        let v = ctx.getObjectProperty(name.unescape(), property.unescape());
        if (typeof v === 'object') v = JSON.stringify(v);

        return this.success(v);
    }
}
