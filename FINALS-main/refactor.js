const fs = require('fs');
const filepath = 'd:/Documents/FINALS SA LAHAT/FINALS/src/components/UploadRecipe.js';
let code = fs.readFileSync(filepath, 'utf-8');

function extractBlock(regexStart, regexEnd) {
    const lines = code.split('\n');
    let startIdx = -1;
    let endIdx = -1;
    let extracted = [];
    
    // Find start
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(regexStart)) {
            startIdx = i;
            break;
        }
    }
    if (startIdx === -1) return '';
    
    // Find end (count braces)
    let braces = 0;
    let started = false;
    for (let i = startIdx; i < lines.length; i++) {
        extracted.push(lines[i]);
        if (lines[i].includes('{')) { braces += (lines[i].match(/\{/g) || []).length; started = true; }
        if (lines[i].includes('}')) { braces -= (lines[i].match(/\}/g) || []).length; }
        
        if (started && braces <= 0) {
            // handle the ending semicolon if it's there
            endIdx = i;
            break;
        }
    }
    
    const block = extracted.join('\n');
    code = code.replace(block, '');
    return block;
}

const formatTimeCode = extractBlock('const formatTimeDisplay = ');
const charLimitsCode = extractBlock('const CHAR_LIMITS = {');
const timeLimitsCode = extractBlock('const TIME_LIMITS = {');
const charCounterCode = extractBlock('const CharCounter = ');
const timeInputCode = extractBlock('const TimeInput = ');
const stepComponentCode = extractBlock('const StepComponent = ');

function outdent(str) {
    return str.split('\n').map(l => l.startsWith('    ') ? l.substring(4) : l).join('\n');
}

const hoisted = [
    outdent(charLimitsCode),
    outdent(timeLimitsCode),
    outdent(formatTimeCode),
    outdent(charCounterCode),
    outdent(timeInputCode),
    outdent(stepComponentCode)
].join('\n\n') + '\n';

code = code.replace('const UploadRecipe = () => {', hoisted + 'const UploadRecipe = () => {');

fs.writeFileSync(filepath, code, 'utf-8');
console.log('Refactored successfully');
