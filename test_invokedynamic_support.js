#!/usr/bin/env node

const fs = require('fs');
const { getAST } = require('./lib');

/**
 * Test to demonstrate that BootstrapMethods attribute is now accessible
 * and can be used to implement invokedynamic support
 */
function testBootstrapMethodsAccess() {
    const className = 'test/InvokeDynamicTest.class';
    
    if (!fs.existsSync(className)) {
        console.error(`Class file ${className} not found. Please compile InvokeDynamicTest.java first.`);
        return false;
    }

    const classBytes = fs.readFileSync(className);
    const parsed = getAST(classBytes);

    console.log('=== BootstrapMethods Attribute Access Test ===\n');

    // Check that attributes are now exposed
    if (!parsed.ast.attributes) {
        console.error('FAIL: attributes not exposed in AST');
        return false;
    }

    console.log('✓ Class-level attributes are exposed in AST');

    // Find the BootstrapMethods attribute
    const bootstrapMethodsAttr = parsed.ast.attributes.find(attr => {
        const nameIndex = attr.attribute_name_index.index;
        const name = parsed.constantPool[nameIndex];
        return (name && name.tag === 1 && name.info.bytes === 'BootstrapMethods');
    });

    if (!bootstrapMethodsAttr) {
        console.error('FAIL: BootstrapMethods attribute not found');
        return false;
    }

    console.log('✓ BootstrapMethods attribute found');

    // Verify structure
    if (!bootstrapMethodsAttr.info || !bootstrapMethodsAttr.info.bootstrap_methods) {
        console.error('FAIL: BootstrapMethods structure invalid');
        return false;
    }

    console.log('✓ BootstrapMethods structure is valid');
    console.log(`  - Number of bootstrap methods: ${bootstrapMethodsAttr.info.num_bootstrap_methods}`);

    // Find invokedynamic instructions
    let invokeDynamicFound = false;
    let invokeDynamicCount = 0;

    parsed.ast.methods.forEach(method => {
        if (method.code && method.code.instructions) {
            method.code.instructions.forEach(instr => {
                if (instr.opcodeName === 'invokedynamic') {
                    invokeDynamicFound = true;
                    invokeDynamicCount++;
                    
                    console.log(`  - Found invokedynamic in ${method.name}: PC=${instr.pc}, operands=`, instr.operands);
                    
                    // Simulate accessing bootstrap method info (as would be needed for invokedynamic implementation)
                    if (instr.operands && 'index' in instr.operands) {
                        // The index refers to a CONSTANT_InvokeDynamic entry
                        const invokeDynamicEntry = parsed.constantPool[instr.operands.index];
                        if (invokeDynamicEntry && invokeDynamicEntry.tag === 18) { // CONSTANT_InvokeDynamic
                            const bootstrapMethodAttrIndex = invokeDynamicEntry.info.bootstrap_method_attr_index;
                            console.log(`    - Bootstrap method attr index: ${bootstrapMethodAttrIndex}`);
                            
                            if (bootstrapMethodAttrIndex < bootstrapMethodsAttr.info.bootstrap_methods.length) {
                                const bootstrapMethod = bootstrapMethodsAttr.info.bootstrap_methods[bootstrapMethodAttrIndex];
                                console.log(`    - Bootstrap method ref: ${bootstrapMethod.bootstrap_method_ref}`);
                                console.log(`    - Bootstrap arguments count: ${bootstrapMethod.num_bootstrap_arguments}`);
                                console.log(`    ✓ Bootstrap method data successfully accessed!`);
                            }
                        }
                    }
                }
            });
        }
    });

    if (!invokeDynamicFound) {
        console.warn('WARNING: No invokedynamic instructions found in test class');
    } else {
        console.log(`✓ Found ${invokeDynamicCount} invokedynamic instruction(s)`);
    }

    console.log('\n=== Test PASSED ===');
    console.log('BootstrapMethods attribute is now properly exposed and accessible for invokedynamic implementation.');
    
    return true;
}

// Run the test
const success = testBootstrapMethodsAccess();
process.exit(success ? 0 : 1);