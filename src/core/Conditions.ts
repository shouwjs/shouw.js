/**
 * Check if a given condition is true or false
 *
 * @param {string} input - The condition to check
 * @returns {boolean} - Whether the condition is true or false
 * @example CheckCondition('uwu === uwu') // true
 * CheckCondition('uwu === owo') // false
 */
export function CheckCondition(input: string): boolean {
    try {
        let message = input.trim().unescape();
        while (message.includes('(') && message.includes(')')) {
            const innerExpr = message.match(/\(([^()]+)\)/);
            if (innerExpr && innerExpr.index !== undefined) {
                const innerResult = CheckCondition(innerExpr[1].trim());
                message =
                    message.slice(0, innerExpr.index) +
                    innerResult +
                    message.slice(innerExpr.index + innerExpr[0].length);
            } else if (innerExpr && innerExpr.index === undefined) {
                const innerResult = CheckCondition(innerExpr[1].trim());
                message = message.replace(innerExpr[0], () => innerResult.toString());
            } else {
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
    } catch {
        return false;
    }
}

/**
 * Evaluate a single condition
 *
 * @param {string} input - The condition to evaluate
 * @returns {boolean} - Whether the condition is true or false
 */
function evaluate(input: string): boolean {
    if (input.toLowerCase() === 'true') return true;
    if (input.toLowerCase() === 'false') return false;
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
