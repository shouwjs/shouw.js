"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IF = IF;
const index_js_1 = require("../../index.js");
async function IF(code, ctx) {
    const lower = code.toLowerCase();
    if (!lower.includes('$if['))
        return { code, error: false };
    if (!lower.includes('$endif')) {
        await ctx.error(index_js_1.Constants.Errors.missingEndif);
        return { code, error: true };
    }
    const startIndex = lower.indexOf('$if[');
    const block = extractTopLevelBlock(code.slice(startIndex), '$if[', '$endif');
    if (!block) {
        await ctx.error(index_js_1.Constants.Errors.missingEndif);
        return { code, error: true };
    }
    const { full } = block;
    const branches = parseBranches(full);
    let output = '';
    let matched = false;
    for (const branch of branches) {
        const isConditionBranch = branch.type === 'if' || branch.type === 'elseif';
        if (isConditionBranch && !matched) {
            const result = branch.condition ? await INIT(branch.condition, ctx) : 'false';
            if (result === 'true') {
                output = branch.code;
                matched = true;
            }
        }
        else if (branch.type === 'else' && !matched) {
            output = branch.code;
            break;
        }
    }
    const finalCode = code.slice(0, startIndex) + output + code.slice(startIndex + full.length);
    return { code: finalCode, error: false };
}
function parseBranches(full) {
    const branches = [];
    const result = [];
    let i = 0;
    let depth = -1;
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
        }
        else if (lower.startsWith('$endif')) {
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
        }
        else if (lower.startsWith('$else')) {
            branches.push({ type: 'else', condition: '', index: i });
            i += 5;
        }
        else {
            i++;
        }
    }
    for (let j = 0; j < branches.length; j++) {
        const { type, condition, index } = branches[j];
        const nextIndex = branches[j + 1]?.index ?? full.length;
        let contentStart = index;
        if (type === 'if')
            contentStart += 4 + condition.length + 1;
        else if (type === 'elseif')
            contentStart += 8 + condition.length + 1;
        else if (type === 'else')
            contentStart += 5;
        else if (type === 'endif')
            contentStart += 6;
        const code = full.slice(contentStart, nextIndex).trim();
        result.push({ type, condition, code });
    }
    return result;
}
function extractTopLevelBlock(str, open, close) {
    let depth = 0;
    let start = -1;
    let i = 0;
    while (i < str.length) {
        if (str.toLowerCase().startsWith(open, i)) {
            if (depth === 0)
                start = i;
            depth++;
            i += open.length;
        }
        else if (str.toLowerCase().startsWith(close, i)) {
            depth--;
            i += close.length;
            if (depth === 0 && start !== -1) {
                return {
                    full: str.slice(0, i),
                    body: str.slice(open.length, i - close.length)
                };
            }
        }
        else {
            i++;
        }
    }
    return null;
}
function extractCondition(str) {
    let depth = 0;
    let start = -1;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '[') {
            if (depth === 0)
                start = i;
            depth++;
        }
        else if (str[i] === ']') {
            depth--;
            if (depth === 0)
                return str.slice(start + 1, i);
        }
    }
    return '';
}
async function INIT(condition, ctx) {
    return ((await index_js_1.Interpreter.run({ code: `$checkCondition[${condition}]` }, ctx, {
        sendMessage: false,
        returnResult: true,
        returnError: false,
        returnData: false,
        returnId: false
    }))?.result ?? 'false');
}
