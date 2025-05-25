"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IF = IF;
const Interpreter_1 = require("./Interpreter");
// IF BLOCK PARSING
async function IF(code, oldCode, ctx) {
    if (ctx.isError || !code.match(/\$if/gi))
        return {
            error: false,
            code: code,
            oldCode: oldCode
        };
    if (!code.match(/\$endif/gi)) {
        await ctx.error({
            message: 'Invalid $if usage: Missing $endif',
            solution: 'Make sure to always use $endif at the end of the $if block'
        });
        return {
            error: true,
            code: code,
            oldCode: oldCode
        };
    }
    let result = code;
    let oldCodeResult = oldCode;
    const ifStatements = code.split(/\$if\[/gi).slice(1);
    for (let statement of ifStatements) {
        const conditionBlock = code
            .split(/\$if\[/gi)
            .pop()
            ?.split(/\$endif/gi)[0] || '';
        const condition = extractCondition(statement);
        const ifResult = await INIT(ctx, {
            code: `$checkCondition[${condition}`,
            name: 'if',
            type: 'parsing'
        });
        if (ctx.isError || ifResult.error) {
            return {
                error: true,
                code: result,
                oldCode: oldCodeResult
            };
        }
        const elseIfBlocks = {};
        const elseIfMatches = statement.match(/\$elseif/gi);
        if (elseIfMatches) {
            for (const elseIf of statement.split(/\$elseif\[/gi).slice(1)) {
                if (!elseIf.match(/\$endelseif/gi)) {
                    await ctx.error({
                        message: 'Invalid $elseif usage: Missing $endelseif',
                        solution: 'Make sure to always use $endelseif at the end of the $elseif block'
                    });
                    return {
                        error: true,
                        code: result,
                        oldCode: oldCodeResult
                    };
                }
                const elseifContent = elseIf.split(/\$endelseif/gi)[0];
                const elseifCondition = extractCondition(elseifContent);
                elseIfBlocks[elseifCondition] = elseifContent.slice(elseifCondition.length + 1);
                statement = statement.replace(new RegExp(`\\$elseif\\[${escapeRegExp(elseifContent)}\\$endelseif`, 'mi'), '');
            }
        }
        const elseBlockMatch = statement.match(/\$else/i);
        const ifCodeBlock = elseBlockMatch
            ? statement
                .split(`${condition}`)
                .slice(1)
                .join('\n')
                .split(/\$else/gi)[0]
            : statement
                .split(`${condition}`)
                .slice(1)
                .join('\n')
                .split(/\$endif/gi)[0];
        const elseCodeBlock = elseBlockMatch ? statement.split(/\$else/gi)[1].split(/\$endif/gi)[0] : '';
        let finalCode = '';
        let isConditionPassed = false;
        if (elseIfBlocks) {
            for (const [elseifCondition, elseifCode] of Object.entries(elseIfBlocks)) {
                if (!isConditionPassed) {
                    const elseifResult = await INIT(ctx, {
                        code: `$checkCondition[${elseifCondition}`,
                        name: 'if',
                        type: 'parsing'
                    });
                    if (ctx.isError || elseifResult.error) {
                        return {
                            error: true,
                            code: result,
                            oldCode: oldCodeResult
                        };
                    }
                    if (elseifResult.result === 'true') {
                        isConditionPassed = true;
                        finalCode = elseifCode;
                    }
                }
            }
        }
        result = code
            .replace(/\$if/gi, '$if')
            .replace(`$if[${conditionBlock}`, ifResult.result === 'true' ? ifCodeBlock : isConditionPassed ? finalCode : elseCodeBlock);
        oldCodeResult = oldCode.replace(/\$if/gi, '$if').replace(`$if[${conditionBlock}`, '');
    }
    return { error: ctx.isError, code: result, oldCode: oldCodeResult };
}
// EXTRACT CONDITION FROM CODE
function extractCondition(code) {
    let nestingLevel = 1;
    let position = 0;
    while (nestingLevel > 0 && position < code.length) {
        if (code[position] === '[')
            nestingLevel++;
        if (code[position] === ']') {
            nestingLevel--;
            if (nestingLevel === 0)
                break;
        }
        position++;
        if (position > code.length)
            break;
    }
    return code.slice(0, position + 1);
}
// ESCAPE REGEXP
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\\n]/g, '\\$&');
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
