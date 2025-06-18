import { type Interpreter, Constants } from '../../index.js';

/**
 * Handles the $if block in the code and returns the modified code.
 *
 * @param {string} code - The code to be processed.
 * @param {Interpreter} ctx - The interpreter context.
 * @return {Promise<{ code: string; error: boolean }>} The modified code and whether there was an error.
 */
export async function IF(
    code: string,
    ctx: Interpreter,
    index: number
): Promise<{ code: string; error: boolean; index: number; length: number }> {
    const lower = code.toLowerCase();
    if (!lower.includes('$if[')) return { code, error: false, index: 0, length: 0 };

    /**
     * Check if the $if block is properly closed with $endif.
     */
    if (!lower.includes('$endif')) {
        await ctx.error(Constants.Errors.missingEndif);
        return { code, error: true, index: 0, length: 0 };
    }

    /**
     * Extract the top-level $if block from the code.
     */
    const startIndex = lower.indexOf('$if[', index);
    const block = extractTopLevelBlock(code.slice(startIndex), '$if[', '$endif');

    if (!block) {
        await ctx.error(Constants.Errors.missingEndif);
        return { code, error: true, index: 0, length: 0 };
    }

    const { full } = block;
    const branches = parseBranches(full);
    let output = '';
    let matched = false;

    /**
     * Iterate through each branch and evaluate the condition.
     */
    for (const branch of branches) {
        const isConditionBranch = branch.type === 'if' || branch.type === 'elseif';

        if (isConditionBranch && !matched) {
            const result = branch.condition
                ? // @ts-ignore
                  await ctx.processFunction(`$checkCondition[${branch.condition}]`)
                : 'false';
            if (result === 'true') {
                output = branch.code;
                matched = true;
            }
        } else if (branch.type === 'else' && !matched) {
            output = branch.code;
            break;
        }
    }

    const result = code.slice(0, startIndex) + output + code.slice(startIndex + full.length);
    return { code: result, error: false, index: startIndex, length: output.length };
}

/**
 * Parses the branches of an $if block.
 *
 * @param {string} full - The full code of the $if block.
 * @return {Array<{ type: string; condition: string; code: string }>} The parsed branches.
 */
function parseBranches(full: string): Array<{ type: string; condition: string; code: string }> {
    const branches: Array<{ type: string; condition: string; index: number }> = [];
    const result: Array<{ type: string; condition: string; code: string }> = [];

    let i = 0;
    let depth = -1;

    /**
     * Iterate through the code and extract the branches.
     */
    while (i < full.length) {
        const lower = full.slice(i).toLowerCase();

        if (lower.startsWith('$if[')) {
            depth++;
            if (depth === 0) {
                const condition = extractCondition(full.slice(i));
                branches.push({ type: 'if', condition, index: i });
                i += 4 + condition.length + 1;
                continue;
            }
        } else if (lower.startsWith('$endif')) {
            depth--;
            if (depth === -1) {
                branches.push({ type: 'endif', condition: '', index: i });
                i += 6;
                break;
            }
        }

        if (depth !== 0) {
            i++;
            continue;
        }

        if (lower.startsWith('$elseif[')) {
            const condition = extractCondition(full.slice(i));
            branches.push({ type: 'elseif', condition, index: i });
            i += 8 + condition.length + 1;
        } else if (lower.startsWith('$else')) {
            branches.push({ type: 'else', condition: '', index: i });
            i += 5;
        } else {
            i++;
        }
    }

    /**
     * Iterate through the branches and extract the code.
     */
    for (let j = 0; j < branches.length; j++) {
        const { type, condition, index } = branches[j];
        const nextIndex = branches[j + 1]?.index ?? full.length;

        let contentStart = index;
        if (type === 'if') contentStart += 4 + condition.length + 1;
        else if (type === 'elseif') contentStart += 8 + condition.length + 1;
        else if (type === 'else') contentStart += 5;
        else if (type === 'endif') contentStart += 6;

        const code = full.slice(contentStart, nextIndex).trim();
        result.push({ type, condition, code });
    }

    return result;
}

/**
 * Extracts the top-level block from the code.
 *
 * @param {string} str - The code to be processed.
 * @param {string} open - The opening tag of the block.
 * @param {string} close - The closing tag of the block.
 * @return {{ full: string, body: string } | null} The extracted block.
 */
export function extractTopLevelBlock(
    str: string,
    open: string,
    close: string
): {
    full: string;
    body: string;
} | null {
    let depth = 0;
    let start = -1;
    let i = 0;

    /**
     * Extract the top-level block from the code.
     */
    while (i < str.length) {
        if (str.toLowerCase().startsWith(open, i)) {
            if (depth === 0) start = i;
            depth++;
            i += open.length;
        } else if (str.toLowerCase().startsWith(close, i)) {
            depth--;
            i += close.length;

            if (depth === 0 && start !== -1) {
                return {
                    full: str.slice(0, i),
                    body: str.slice(open.length, i - close.length)
                };
            }
        } else {
            i++;
        }
    }
    return null;
}

/**
 * Extracts the condition from the code.
 *
 * @param {string} str - The code to be processed.
 * @return {string} The extracted condition.
 */
function extractCondition(str: string): string {
    let depth = 0;
    let start = -1;

    /**
     * Extract the condition from the code.
     */
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '[') {
            if (depth === 0) start = i;
            depth++;
        } else if (str[i] === ']') {
            depth--;
            if (depth === 0) return str.slice(start + 1, i);
        }
    }
    return '';
}
