#!/usr/bin/env node

const fs = require('fs');
const { getAST, getClassFileStruct } = require('./lib');

console.log('Testing annotation parsing...\n');

try {
    const classFileContent = fs.readFileSync('test/AnnotationReflectionTest.class');
    const ast = getAST(classFileContent);
    const struct = getClassFileStruct(classFileContent);

    console.log('=== AST ANALYSIS ===');
    console.log('Fields in AST:', ast.ast.fields.length);
    
    if (ast.ast.fields.length > 0) {
        console.log('\nField 0 details:');
        console.log(JSON.stringify(ast.ast.fields[0], null, 2));
        
        console.log('\nField 0 attributes:');
        if (ast.ast.fields[0].attributes) {
            console.log('Attributes count:', ast.ast.fields[0].attributes.length);
            ast.ast.fields[0].attributes.forEach((attr, i) => {
                console.log(`Attribute ${i}:`, JSON.stringify(attr, null, 2));
            });
        } else {
            console.log('NO ATTRIBUTES FOUND');
        }
    }

    console.log('\nMethods in AST:', ast.ast.methods.length);
    
    if (ast.ast.methods.length > 1) {
        console.log('\nMethod 1 details (annotatedMethod):');
        console.log(JSON.stringify(ast.ast.methods[1], null, 2));
        
        console.log('\nMethod 1 attributes:');
        if (ast.ast.methods[1].attributes) {
            console.log('Attributes count:', ast.ast.methods[1].attributes.length);
            ast.ast.methods[1].attributes.forEach((attr, i) => {
                console.log(`Attribute ${i}:`, JSON.stringify(attr, null, 2));
            });
        } else {
            console.log('NO ATTRIBUTES FOUND');
        }
    }

    console.log('\n=== STRUCT ANALYSIS ===');
    console.log('Fields in struct:', struct.fields.length);
    
    if (struct.fields.length > 0) {
        console.log('\nField 0 struct details:');
        console.log(JSON.stringify(struct.fields[0], null, 2));
        
        // Check constant pool references
        console.log(`\nField name_index: ${struct.fields[0].name_index}`);
        console.log(`CP[${struct.fields[0].name_index}]:`, JSON.stringify(struct.constant_pool.entries[struct.fields[0].name_index], null, 2));
        console.log(`Field descriptor_index: ${struct.fields[0].descriptor_index}`);
        console.log(`CP[${struct.fields[0].descriptor_index}]:`, JSON.stringify(struct.constant_pool.entries[struct.fields[0].descriptor_index], null, 2));
    }
    
    console.log('\nMethods in struct:', struct.methods.length);
    
    if (struct.methods.length > 1) {
        console.log('\nMethod 1 struct details:');
        console.log(JSON.stringify(struct.methods[1], null, 2));
    }

    console.log('\n=== CONSTANT POOL SAMPLE ===');
    for (let i = 1; i <= 23; i++) {
        if (struct.constant_pool.entries[i]) {
            console.log(`CP[${i}]:`, struct.constant_pool.entries[i]);
        }
    }

} catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
}