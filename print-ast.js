#!/usr/bin/env node
const fs = require('fs');
const { getAST } = require('./lib');

if (process.argv.length < 3) {
    console.error('Usage: node print-ast.js <classfile>');
    process.exit(1);
}

const filePath = process.argv[2];

try {
    const fileBuffer = fs.readFileSync(filePath);
    const ast = getAST(new Uint8Array(fileBuffer));
    console.log(JSON.stringify(ast, null, 2));
} catch (err) {
    console.error('Error reading or parsing class file:', err.message);
    process.exit(2);
}
