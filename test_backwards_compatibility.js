#!/usr/bin/env node

/**
 * Test to verify backwards compatibility - that fields and methods
 * without attributes still work correctly and that basic classes
 * are not negatively affected by the attribute changes.
 */

const fs = require('fs');
const { getAST } = require('./lib');

function test_backwards_compatibility() {
    console.log('Testing backwards compatibility...\n');

    try {
        // Test with HelloWorld.class (no annotations)
        console.log('✓ Testing HelloWorld.class (basic case)...');
        const helloWorldBytes = fs.readFileSync('test/HelloWorld.class');
        const helloWorldAST = getAST(helloWorldBytes);
        
        if (!helloWorldAST.ast) {
            throw new Error('AST is missing');
        }
        
        if (!helloWorldAST.ast.methods || helloWorldAST.ast.methods.length === 0) {
            throw new Error('Methods are missing from HelloWorld AST');
        }
        
        console.log(`  - Found ${helloWorldAST.ast.methods.length} method(s)`);
        
        // Check that all methods have attributes array (even if empty)
        for (let i = 0; i < helloWorldAST.ast.methods.length; i++) {
            const method = helloWorldAST.ast.methods[i];
            if (!method.attributes) {
                throw new Error(`Method ${i} (${method.name}) is missing attributes array`);
            }
            console.log(`  - Method '${method.name}' has ${method.attributes.length} attribute(s)`);
        }
        
        // Check fields if any
        if (helloWorldAST.ast.fields && helloWorldAST.ast.fields.length > 0) {
            console.log(`  - Found ${helloWorldAST.ast.fields.length} field(s)`);
            for (let i = 0; i < helloWorldAST.ast.fields.length; i++) {
                const field = helloWorldAST.ast.fields[i];
                if (!field.attributes) {
                    throw new Error(`Field ${i} (${field.name}) is missing attributes array`);
                }
                console.log(`  - Field '${field.name}' has ${field.attributes.length} attribute(s)`);
            }
        } else {
            console.log('  - No fields found (expected for HelloWorld)');
        }
        
        // Verify class-level attributes still work
        if (!helloWorldAST.ast.attributes) {
            throw new Error('Class-level attributes are missing');
        }
        
        console.log(`  - Class has ${helloWorldAST.ast.attributes.length} attribute(s)`);
        
        // Test that sourceFile backwards compatibility still works
        if (helloWorldAST.ast.sourceFile !== 'HelloWorld.java') {
            throw new Error('sourceFile backwards compatibility broken');
        }
        console.log('  - sourceFile backwards compatibility: OK');
        
        console.log('\n🎉 Backwards compatibility test passed!');
        return true;

    } catch (error) {
        console.error('\n❌ Backwards compatibility test failed:', error.message);
        throw error;
    }
}

// Run the test
try {
    test_backwards_compatibility();
    process.exit(0);
} catch (error) {
    process.exit(1);
}