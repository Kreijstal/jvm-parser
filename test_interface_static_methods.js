#!/usr/bin/env node

/**
 * Test to verify that interface static method calls are parsed correctly.
 * This addresses the bug where jvm_parser fails with TypeError when parsing
 * class files containing calls to interface static methods.
 */

const fs = require('fs');
const { getAST, getDisassembled } = require('./lib');

function test_interface_static_methods() {
    console.log('Testing interface static method parsing...\n');

    try {
        // Test with MinimalBug.class (contains interface static method call)
        console.log('✓ Testing MinimalBug.class (interface static method call)...');
        const minimalBugBytes = fs.readFileSync('MinimalBug.class');
        const minimalBugAST = getAST(minimalBugBytes);
        
        if (!minimalBugAST.ast) {
            throw new Error('AST is missing');
        }
        
        if (!minimalBugAST.ast.methods || minimalBugAST.ast.methods.length === 0) {
            throw new Error('Methods are missing from MinimalBug AST');
        }
        
        console.log(`  - Found ${minimalBugAST.ast.methods.length} method(s)`);
        
        // Find the main method and check that it has bytecode
        const mainMethod = minimalBugAST.ast.methods.find(m => m.name === 'main');
        if (!mainMethod) {
            throw new Error('main method not found');
        }
        
        console.log('  - Found main method');
        
        // Check that main method has code with instructions
        if (!mainMethod.code || !mainMethod.code.instructions) {
            throw new Error('main method missing code or instructions');
        }
        
        console.log(`  - main method has ${mainMethod.code.instructions.length} instruction(s)`);
        
        // Look for the invokestatic instruction that calls the interface method
        const invokeStaticInstr = mainMethod.code.instructions.find(instr => 
            instr.opcode === 184 && instr.comment && instr.comment.includes('doSomething')
        );
        
        if (!invokeStaticInstr) {
            throw new Error('Expected invokestatic instruction calling doSomething not found');
        }
        
        console.log('  - Found invokestatic instruction with interface method call');
        console.log(`  - Instruction comment: ${invokeStaticInstr.comment}`);
        
        // Test that we can also generate disassembled output
        console.log('✓ Testing disassembly of interface static method call...');
        const disassembled = getDisassembled(minimalBugBytes);
        
        if (!disassembled.includes('doSomething')) {
            throw new Error('Disassembled output does not contain interface method name');
        }
        
        console.log('  - Disassembly successful');
        
        console.log('\n🎉 Interface static method parsing test passed!');
        return true;

    } catch (error) {
        console.error('\n❌ Interface static method parsing test failed:', error.message);
        throw error;
    }
}

// Run the test
try {
    test_interface_static_methods();
    process.exit(0);
} catch (error) {
    process.exit(1);
}