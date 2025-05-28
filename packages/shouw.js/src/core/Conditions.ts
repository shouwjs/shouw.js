import { type Operator, Precedence } from '../typings';

// TOKENIZE CONDITION
function tokenize(input: string): string[] {
    const tokens: string[] = [];
    const regex = /\s*(\d+|\w+|&&|\|\||==|!=|>=|<=|>|<|\(|\))\s*/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    while ((match = regex.exec(input)) !== null) {
        if (match.index !== lastIndex) throw new SyntaxError(`Invalid token at position ${lastIndex}`);
        tokens.push(match[1]);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex !== input.length) throw new SyntaxError(`Invalid condition token at position ${lastIndex}`);
    return tokens;
}

// EVALUATE CONDITION
function evaluate(tokens: string[]): boolean {
    const values: (number | string | boolean)[] = [];
    const ops: string[] = [];

    const apply = () => {
        const op = ops.pop() as Operator;
        const b = values.pop();
        const a = values.pop();
        if (a === undefined || b === undefined) throw new SyntaxError(`Missing value for condition operator '${op}'`);
        let result: boolean;
        switch (op) {
            case '==':
                result = a === b;
                break;
            case '!=':
                result = a !== b;
                break;
            case '>':
                result = Number(a) > Number(b);
                break;
            case '<':
                result = Number(a) < Number(b);
                break;
            case '>=':
                result = Number(a) >= Number(b);
                break;
            case '<=':
                result = Number(a) <= Number(b);
                break;
            case '&&':
                result = Boolean(a) && Boolean(b);
                break;
            case '||':
                result = Boolean(a) || Boolean(b);
                break;
            default:
                throw new SyntaxError(`Invalid condition operator: ${op}`);
        }
        values.push(result);
    };

    for (const token of tokens) {
        if (!Number.isNaN(Number(token))) {
            values.push(Number(token));
        } else if (/^\w+$/.test(token)) {
            values.push(token);
        } else if (token === '(') {
            ops.push(token);
        } else if (token === ')') {
            while (ops[ops.length - 1] !== '(') apply();
            ops.pop();
        } else if (token in Precedence) {
            while (
                ops.length &&
                ops[ops.length - 1] !== '(' &&
                Precedence[ops[ops.length - 1] as Operator] >= Precedence[token as Operator]
            )
                apply();
            ops.push(token);
        } else {
            throw new SyntaxError(`Unexpected condition token: ${token}`);
        }
    }

    while (ops.length) apply();
    return Boolean(values[0]);
}

// CHECK CONDITION
export function CheckCondition(input: string): boolean {
    try {
        const tokens = tokenize(input);
        return evaluate(tokens);
    } catch {
        return false;
    }
}
