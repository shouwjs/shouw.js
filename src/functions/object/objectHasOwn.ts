import { ParamType, Functions, type Interpreter, type Objects } from '../../index.js';

export default class ObjectHasOwn extends Functions {
    constructor() {
        super({
            name: '$objectHasOwn',
            description: 'Check if an object has a property',
            brackets: true,
            params: [
                {
                    name: 'object',
                    description: 'The object to check',
                    required: true,
                    type: ParamType.Object
                },
                {
                    name: 'property',
                    description: 'The property to check',
                    required: true,
                    type: ParamType.String
                }
            ]
        });
    }

    async code(_ctx: Interpreter, [object, property]: [Objects, string]) {
        return this.success(Object.hasOwn(object, property));
    }
}
