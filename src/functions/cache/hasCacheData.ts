import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class HasCacheData extends Functions {
    constructor() {
        super({
            name: '$hasCacheData',
            description: 'Check if a cache data exists',
            brackets: true,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'key',
                    description: 'The key of the cache',
                    required: true,
                    type: ParamType.String
                }
            ]
        });
    }

    code(ctx: Interpreter, [name, key]: [string, string]) {
        return this.success(ctx.hasCacheData(name.unescape(), key.unescape()));
    }
}
