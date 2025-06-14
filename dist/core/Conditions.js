"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckCondition = CheckCondition;
function CheckCondition(input) {
    try {
        let message = input.trim().unescape();
        while (message.includes('(') && message.includes(')')) {
            const innerExpr = message.match(/\(([^()]+)\)/);
            if (innerExpr) {
                const innerResult = CheckCondition(innerExpr[1].trim());
                message = message.replace(innerExpr[0], () => innerResult.toString());
            }
            else {
                break;
            }
        }
        if (message.includes('&&')) {
            return message.split('&&').every((part) => {
                return CheckCondition(part.trim());
            });
        }
        if (message.includes('||')) {
            return message.split('||').some((part) => {
                return CheckCondition(part.trim());
            });
        }
        return evaluate(message);
    }
    catch {
        return false;
    }
}
function evaluate(input) {
    if (input.toLowerCase() === 'true')
        return true;
    if (input.toLowerCase() === 'false')
        return false;
    const [left, operator, right] = input.split(/(===|==|!==|!=|>=|<=|>|<)/).map((x) => x.trim());
    switch (operator) {
        case '===':
            return left === right;
        case '==':
            return left == right;
        case '!==':
            return left !== right;
        case '!=':
            return left != right;
        case '>':
            return Number(left) > Number(right);
        case '<':
            return Number(left) < Number(right);
        case '>=':
            return Number(left) >= Number(right);
        case '<=':
            return Number(left) <= Number(right);
        default:
            return false;
    }
}
