#!/usr/bin/env node

const fs = require('fs');
const { getClassFileStruct, getAST } = require('./lib');

// Test with the InvokeDynamicTest class
const className = 'test/InvokeDynamicTest.class';

if (!fs.existsSync(className)) {
    console.error(`Class file ${className} not found. Please compile InvokeDynamicTest.java first.`);
    process.exit(1);
}

const classBytes = fs.readFileSync(className);

console.log('=== Testing BootstrapMethods Attribute Exposure ===\n');

// Get the raw class file structure
const rawStruct = getClassFileStruct(classBytes);

console.log('1. Raw class file structure:');
console.log('  - attributes_count:', rawStruct.attributes_count);
console.log('  - attributes array length:', rawStruct.attributes?.length || 'undefined');

if (rawStruct.attributes) {
    console.log('  - Top-level attributes found:');
    rawStruct.attributes.forEach((attr, index) => {
        const nameIndex = attr.attribute_name_index.index;
        const name = rawStruct.constant_pool.entries[nameIndex];
        const attributeName = (name && name.tag === 1) ? name.info.bytes : 'unknown';
        console.log(`    [${index}] ${attributeName} (length: ${attr.attribute_length})`);
        
        if (attributeName === 'BootstrapMethods') {
            console.log('    *** FOUND BootstrapMethods attribute! ***');
            console.log('    Bootstrap methods count:', attr.info.num_bootstrap_methods);
            if (attr.info.bootstrap_methods) {
                attr.info.bootstrap_methods.forEach((bm, i) => {
                    console.log(`      Bootstrap method ${i}: ref=${bm.bootstrap_method_ref}, args=${bm.num_bootstrap_arguments}`);
                });
            }
        }
    });
} else {
    console.log('  *** ISSUE: attributes array is undefined! ***');
}

// Get the AST
console.log('\n2. AST structure:');
const ast = getAST(classBytes);
console.log('  - AST object keys:', Object.keys(ast));
console.log('  - AST.ast keys:', Object.keys(ast.ast || {}));

console.log('\n3. Checking for invokedynamic instructions:');
if (ast.ast && ast.ast.methods) {
    let foundInvokeDynamic = false;
    ast.ast.methods.forEach(method => {
        if (method.code && method.code.instructions) {
            method.code.instructions.forEach(instr => {
                if (instr.opcodeName === 'invokedynamic') {
                    foundInvokeDynamic = true;
                    console.log(`  Found invokedynamic in method ${method.name}:`);
                    console.log(`    PC: ${instr.pc}, operands:`, instr.operands);
                }
            });
        }
    });
    if (!foundInvokeDynamic) {
        console.log('  No invokedynamic instructions found (this may be expected with this test class)');
    }
} else {
    console.log('  Could not analyze methods');
}

console.log('\n=== Test Complete ===');