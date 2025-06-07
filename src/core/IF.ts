import { Interpreter } from './Interpreter.js';

/**
 * Handling the $if block during the parsing process of the interpreter to check if a condition is true or false
 *
 * @param {string} code - The code to handle
 * @param {string} oldCode - The old code to handle
 * @param {Interpreter} ctx - The context of the interpreter
 * @return {Promise<{ error: boolean; code: string; oldCode: string }>} - The result of the $if block
 */
export async function IF(
    code: string,
    oldCode: string,
    ctx: Interpreter
): Promise<{ error: boolean; code: string; oldCode: string }> {
    if (ctx.isError || !code.toLowerCase().includes('$if[')) return { error: false, code, oldCode };
    if (!code.toLowerCase().includes('$endif')) {
        await ctx.error({
            message: 'Invalid $if usage: Missing $endif',
            solution: 'Make sure to always use $endif at the end of the $if block'
        });
        return { error: true, code, oldCode };
    }

    let result = code;
    let oldResult = oldCode;
    const regex = /\$if\[/gi;
    const matches: RegExpExecArray[] = [...result.matchAll(regex)];

    for (const match of matches) {
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
        const condition = extractCondition(fullBlock);
        const content = body.slice(condition.length + 1);

        let ifBlock = '';
        const elseIfBlocks: { condition: string; content: string }[] = [];
        let elseBlock = '';
        let remaining = content;

        const elseifRegex = /\$elseif\[/gi;
        const elseifMatches: RegExpExecArray[] = [...remaining.matchAll(elseifRegex)];
        for (const elseifMatch of elseifMatches) {
            const elseifStart = elseifMatch.index;
            const elseifContent = extractBlock(remaining.slice(elseifStart), '$elseif[', '$endelseif');
            if (!elseifContent) {
                await ctx.error({
                    message: 'Invalid $elseif usage: Missing $endelseif',
                    solution: 'Make sure to always use $endelseif at the end of the $elseif block'
                });

                return { error: true, code: result, oldCode: oldResult };
            }

            const elseifCondition = extractCondition(elseifContent.full);
            const elseifBody = elseifContent.body.slice(elseifCondition.length + 1);
            elseIfBlocks.push({ condition: elseifCondition, content: elseifBody });
            remaining = remaining.replace(elseifContent.full, '');
        }

        const elseIndex = remaining.toLowerCase().indexOf('$else');
        if (elseIndex !== -1) {
            ifBlock = remaining.slice(0, elseIndex);
            elseBlock = remaining.slice(elseIndex + 5);
        } else {
            ifBlock = remaining;
        }

        const ifResult = await INIT(ctx, {
            code: `$checkCondition[${condition}]`,
            name: 'if',
            type: 'parsing'
        });

        if (ctx.isError || ifResult.error) return { error: true, code: result, oldCode: oldResult };
        let finalCode = '';

        if (ifResult.result === 'true') {
            finalCode = ifBlock;
        } else {
            let passed = false;
            for (const elseif of elseIfBlocks) {
                const elseifResult = await INIT(ctx, {
                    code: `$checkCondition[${elseif.condition}]`,
                    name: 'if',
                    type: 'parsing'
                });

                if (ctx.isError || elseifResult.error) return { error: true, code: result, oldCode: oldResult };
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

/**
 * Extract a block of code
 *
 * @param {string} str - The string to extract from
 * @param {string} open - The opening string
 * @param {string} close - The closing string
 * @return {{ full: string; body: string } | null} - The extracted block
 */
function extractBlock(str: string, open: string, close: string) {
    let depth = 0;
    let i = 0;

    while (i < str.length) {
        if (str.toLowerCase().startsWith(open, i)) {
            depth++;
            i += open.length;
        } else if (str.toLowerCase().startsWith(close, i)) {
            depth--;
            i += close.length;
            if (depth === 0) break;
        } else {
            i++;
        }
    }

    if (depth !== 0) return null;

    return {
        full: str.slice(0, i),
        body: str.slice(open.length, i - close.length)
    };
}

/**
 * Extract a condition from a string
 *
 * @param {string} str - The string to extract from
 * @return {string} - The extracted condition
 */
function extractCondition(str: string): string {
    let start = -1;
    let end = -1;
    let depth = 0;

    for (let i = 0; i < str.length; i++) {
        if (str[i] === '[') {
            if (depth === 0) start = i;
            depth++;
        } else if (str[i] === ']') {
            depth--;
            if (depth === 0) {
                end = i + 1;
                break;
            }
        }
    }

    if (start === -1 || end === -1) return '';
    return str.substring(start + 1, end - 1);
}

/**
 * Initialize a new interpreter
 *
 * @param {Interpreter} ctx - The context of the interpreter
 * @param {{ code: string; name: string; type: string }} data - The data to initialize with
 * @return {Promise<{ result: string; error: boolean }>} - The result of the interpreter
 */
async function INIT(ctx: Interpreter, data: { code: string; name: string; type: string }) {
    return await new Interpreter(data, ctx, {
        sendMessage: false,
        returnId: false,
        returnResult: true,
        returnError: true,
        returnData: false
    }).initialize();
}
