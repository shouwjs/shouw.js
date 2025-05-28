"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IF = IF;
const Interpreter_1 = require("./Interpreter");
// IF BLOCK PARSING
async function IF(code, oldCode, ctx) {
    if (ctx.isError || !code.includes('$if['))
        return { error: false, code, oldCode };
    if (!code.includes('$endif')) {
        await ctx.error({
            message: 'Invalid $if usage: Missing $endif',
            solution: 'Make sure to always use $endif at the end of the $if block'
        });
        return { error: true, code, oldCode };
    }
    let result = code;
    let oldResult = oldCode;
    const regex = /\$if\[/gi;
    let match;
    while ((match = regex.exec(result)) !== null) {
        const startIndex = match.index;
        const blockContent = extractBlock(result.slice(startIndex), '$if[', '$endif');
        if (!blockContent) {
            await ctx.error({
                message: 'Invalid $if block: Missing $endif',
                solution: 'Ensure each $if block is properly closed with $endif'
            });
            return { error: true, code: result, oldCode: oldResult };
        }
        const fullBlock = blockContent.full;
        const body = blockContent.body;
        const conditionEndIndex = body.indexOf(']');
        const condition = body.slice(0, conditionEndIndex);
        const content = body.slice(conditionEndIndex + 1);
        let ifBlock = '';
        const elseIfBlocks = [];
        let elseBlock = '';
        let remaining = content;
        const elseifRegex = /\$elseif\[/gi;
        let elseifMatch;
        while ((elseifMatch = elseifRegex.exec(remaining)) !== null) {
            const elseifStart = elseifMatch.index;
            const elseifContent = extractBlock(remaining.slice(elseifStart), '$elseif[', '$endelseif');
            if (!elseifContent) {
                await ctx.error({
                    message: 'Invalid $elseif usage: Missing $endelseif',
                    solution: 'Make sure to always use $endelseif at the end of the $elseif block'
                });
                return { error: true, code: result, oldCode: oldResult };
            }
            const elseifConditionEnd = elseifContent.body.indexOf(']');
            const elseifCondition = elseifContent.body.slice(0, elseifConditionEnd);
            const elseifBody = elseifContent.body.slice(elseifConditionEnd + 1);
            elseIfBlocks.push({ condition: elseifCondition, content: elseifBody });
            remaining = remaining.replace(elseifContent.full, '');
        }
        const elseIndex = remaining.indexOf('$else');
        if (elseIndex !== -1) {
            ifBlock = remaining.slice(0, elseIndex);
            elseBlock = remaining.slice(elseIndex + 5);
        }
        else {
            ifBlock = remaining;
        }
        const ifResult = await INIT(ctx, {
            code: `$checkCondition[${condition}]`,
            name: 'if',
            type: 'parsing'
        });
        if (ctx.isError || ifResult.error)
            return { error: true, code: result, oldCode: oldResult };
        let finalCode = '';
        if (ifResult.result === 'true') {
            finalCode = ifBlock;
        }
        else {
            let passed = false;
            for (const elseif of elseIfBlocks) {
                const elseifResult = await INIT(ctx, {
                    code: `$checkCondition[${elseif.condition}]`,
                    name: 'if',
                    type: 'parsing'
                });
                if (ctx.isError || elseifResult.error)
                    return { error: true, code: result, oldCode: oldResult };
                if (elseifResult.result === 'true') {
                    finalCode = elseif.content;
                    passed = true;
                    break;
                }
            }
            if (!passed) {
                finalCode = elseBlock;
            }
        }
        result = result.slice(0, startIndex) + finalCode + result.slice(startIndex + fullBlock.length);
        oldResult = oldResult.replace(fullBlock, '');
        regex.lastIndex = startIndex + finalCode.length;
    }
    return { error: ctx.isError, code: result, oldCode: oldResult };
}
// EXTRACT BLOCK
function extractBlock(str, open, close) {
    let depth = 0;
    let i = 0;
    while (i < str.length) {
        if (str.startsWith(open, i)) {
            depth++;
            i += open.length;
        }
        else if (str.startsWith(close, i)) {
            depth--;
            i += close.length;
            if (depth === 0)
                break;
        }
        else {
            i++;
        }
    }
    if (depth !== 0)
        return null;
    return {
        full: str.slice(0, i),
        body: str.slice(open.length, i - close.length)
    };
}
// INITIALIZE INTERPRETER
async function INIT(ctx, data) {
    return await new Interpreter_1.Interpreter(data, ctx, {
        sendMessage: false,
        returnId: false,
        returnResult: true,
        returnError: true,
        returnData: false
    }).initialize();
}
