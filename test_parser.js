// Save as `test_parser.js`
const fs = require('fs');
const { getAST } = require('./lib');

const classFilePath = 'MinimalBug.class';

console.log(`Attempting to parse: ${classFilePath}`);

try {
    const classFileContent = fs.readFileSync(classFilePath);
    const rawAst = getAST(classFileContent);
    console.log("Successfully parsed class file.");
} catch (e) {
    console.error("\nFailed to parse class file. This demonstrates the bug.");
    console.error("Error:");
    console.error(e);
}