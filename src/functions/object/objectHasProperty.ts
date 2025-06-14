import { ParamType, Functions, type Interpreter, Constants } from '../../index.js';

export default class ObjectHasProperty extends Functions {
    constructor() {
        super({
            name: '$objectHasProperty',
            description: 'Checks if an object has a property',
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
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name, property]: [string, string]) {
        if (!ctx.hasObject(name)) return await ctx.error(Constants.Errors.objectNotFound(name), this.name);

        const object = ctx.getObject(name);
        return this.success(Object.hasOwn(object ?? {}, property));
    }
}
