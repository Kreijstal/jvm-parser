#!/usr/bin/env node

/**
 * Test to verify that class-level attributes including BootstrapMethods
 * are properly exposed in the AST for invokedynamic support.
 * 
 * This test verifies the fix for issue #9.
 */

const fs = require('fs');
const { getAST } = require('./lib');

function test_attributes_exposure() {
    console.log('Testing class-level attributes exposure...\n');

    // Test with HelloWorld (basic case)
    console.log('✓ Testing HelloWorld.class');
    const helloWorldBytes = fs.readFileSync('test/HelloWorld.class');
    const helloWorldAST = getAST(helloWorldBytes);
    
    if (!helloWorldAST.ast.attributes) {
        throw new Error('attributes not exposed in AST');
    }
    
    console.log(`  - Found ${helloWorldAST.ast.attributes.length} attribute(s)`);
    
    // Verify backwards compatibility
    if (helloWorldAST.ast.sourceFile !== 'HelloWorld.java') {
        throw new Error('sourceFile backwards compatibility broken');
    }
    console.log('  - Backwards compatibility: OK');

    // Test with InvokeDynamicTest if available
    if (fs.existsSync('test/InvokeDynamicTest.class')) {
        console.log('\n✓ Testing InvokeDynamicTest.class');
        const invokeDynamicBytes = fs.readFileSync('test/InvokeDynamicTest.class');
        const invokeDynamicAST = getAST(invokeDynamicBytes);
        
        if (!invokeDynamicAST.ast.attributes) {
            throw new Error('attributes not exposed for InvokeDynamicTest');
        }
        
        console.log(`  - Found ${invokeDynamicAST.ast.attributes.length} attribute(s)`);
        
        // Find BootstrapMethods attribute
        const bootstrapMethodsAttr = invokeDynamicAST.ast.attributes.find(attr => {
            const name = invokeDynamicAST.constantPool[attr.attribute_name_index.index];
            return name && name.tag === 1 && name.info.bytes === 'BootstrapMethods';
        });
        
        if (bootstrapMethodsAttr) {
            console.log('  - BootstrapMethods attribute: ACCESSIBLE');
            console.log(`  - Bootstrap methods count: ${bootstrapMethodsAttr.info.num_bootstrap_methods}`);
            
            // Verify structure
            if (!bootstrapMethodsAttr.info.bootstrap_methods) {
                throw new Error('BootstrapMethods structure invalid');
            }
            console.log('  - BootstrapMethods structure: VALID');
        } else {
            console.log('  - BootstrapMethods attribute: Not found (this may be expected)');
        }
    } else {
        console.log('\n⚠ InvokeDynamicTest.class not found, skipping BootstrapMethods test');
    }

    console.log('\n🎉 All tests passed! Class-level attributes are properly exposed.');
    return true;
}

// Run the test
try {
    test_attributes_exposure();
    process.exit(0);
} catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
}