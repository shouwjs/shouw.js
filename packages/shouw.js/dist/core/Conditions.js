"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckCondition = CheckCondition;
const typings_1 = require("../typings");
// TOKENIZE CONDITION
function tokenize(input) {
    const tokens = [];
    const regex = /\s*(\d+|\w+|&&|\|\||==|!=|>=|<=|>|<|\(|\))\s*/g;
    let match;
    let lastIndex = 0;
    while ((match = regex.exec(input)) !== null) {
        if (match.index !== lastIndex)
            throw new SyntaxError(`Invalid token at position ${lastIndex}`);
        tokens.push(match[1]);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex !== input.length)
        throw new SyntaxError(`Invalid condition token at position ${lastIndex}`);
    return tokens;
}
// EVALUATE CONDITION
function evaluate(tokens) {
    const values = [];
    const ops = [];
    const apply = () => {
        const op = ops.pop();
        const b = values.pop();
        const a = values.pop();
        if (a === undefined || b === undefined)
            throw new SyntaxError(`Missing value for condition operator '${op}'`);
        let result;
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
        }
        else if (/^\w+$/.test(token)) {
            values.push(token);
        }
        else if (token === '(') {
            ops.push(token);
        }
        else if (token === ')') {
            while (ops[ops.length - 1] !== '(')
                apply();
            ops.pop();
        }
        else if (token in typings_1.Precedence) {
            while (ops.length &&
                ops[ops.length - 1] !== '(' &&
                typings_1.Precedence[ops[ops.length - 1]] >= typings_1.Precedence[token])
                apply();
            ops.push(token);
        }
        else {
            throw new SyntaxError(`Unexpected condition token: ${token}`);
        }
    }
    while (ops.length)
        apply();
    return Boolean(values[0]);
}
// CHECK CONDITION
function CheckCondition(input) {
    try {
        const tokens = tokenize(input);
        return evaluate(tokens);
    }
    catch {
        return false;
    }
}
