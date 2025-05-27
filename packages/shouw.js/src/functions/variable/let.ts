import { Functions, type Interpreter } from '../../core';
import { ParamType } from '../../typings';

export default class Let extends Functions {
    constructor() {
        super({
            name: '$let',
            description: 'Will store temporary variables which can be retrieved by $let',
            brackets: true,
            params: [
                {
                    name: 'varname',
                    description: 'Name of the temporary variable',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'value',
                    description: 'Value of the temporary variable you want to save',
                    required: true,
                    type: ParamType.String
                }
            ]
        });
    }

    code(_ctx: Interpreter, [varname, value]: [string, string], data: Interpreter['Temporarily']) {
        data.variables[varname] = value;
        return this.success();
    }
}
