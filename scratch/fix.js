const fs = require('fs');
let content = fs.readFileSync('c:/Users/pgonz/Documents/GitHub/si_mant2/app/empleado-panel.tsx', 'utf8');

// find where generarPDFBorradorExpress starts
const startIdx = content.indexOf('const generarPDFBorradorExpress = async () => {');
if (startIdx === -1) throw new Error("not found");

const searchStr = '    } finally {\n      setGenerandoPDFBorrador(false);\n    }\n  };';
const searchIdx = content.indexOf('setGenerandoPDFBorrador(false)', startIdx);
const endIdx = content.indexOf('};\n', searchIdx) + 3;

const substring = content.substring(startIdx, endIdx);

// fix escaping inside substring ONLY
const fixedSubstring = substring.replace(/\\\$/g, '$').replace(/\\\`/g, '`');

content = content.substring(0, startIdx) + fixedSubstring + content.substring(endIdx);

fs.writeFileSync('c:/Users/pgonz/Documents/GitHub/si_mant2/app/empleado-panel.tsx', content);

console.log("Fixed!");
