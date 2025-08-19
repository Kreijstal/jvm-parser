#!/usr/bin/env node

/**
 * Test to verify that RuntimeVisibleAnnotations attributes are properly
 * exposed in the AST for fields and methods.
 * 
 * This test validates the fix for the annotation parsing bug.
 */

const fs = require('fs');
const { getAST, getClassFileStruct } = require('./lib');

function test_annotation_attributes_exposure() {
    console.log('Testing annotation attributes exposure in AST...\n');

    try {
        // Ensure test class is compiled
        if (!fs.existsSync('test/AnnotationReflectionTest.class')) {
            console.error('❌ test/AnnotationReflectionTest.class not found. Please compile first.');
            process.exit(1);
        }

        const classFileContent = fs.readFileSync('test/AnnotationReflectionTest.class');
        const ast = getAST(classFileContent);
        const struct = getClassFileStruct(classFileContent);

        console.log('✓ Testing field annotation exposure...');
        
        // Test field annotations
        if (!ast.ast.fields || ast.ast.fields.length === 0) {
            throw new Error('No fields found in AST');
        }

        const annotatedField = ast.ast.fields[0]; // annotatedField should be first
        if (annotatedField.name !== 'annotatedField') {
            throw new Error(`Expected field name 'annotatedField', got '${annotatedField.name}'`);
        }

        if (!annotatedField.attributes) {
            throw new Error('Field attributes array is missing from AST');
        }

        if (annotatedField.attributes.length === 0) {
            throw new Error('Field attributes array is empty in AST');
        }

        // Find RuntimeVisibleAnnotations attribute
        const fieldAnnotationAttr = annotatedField.attributes.find(attr => {
            return attr.attribute_name_index.name && 
                   attr.attribute_name_index.name.tag === 1 &&
                   attr.attribute_name_index.name.info.bytes === 'RuntimeVisibleAnnotations';
        });

        if (!fieldAnnotationAttr) {
            throw new Error('RuntimeVisibleAnnotations attribute not found in field attributes');
        }

        if (!fieldAnnotationAttr.info.annotations || fieldAnnotationAttr.info.annotations.length === 0) {
            throw new Error('Field annotation info is missing or empty');
        }

        console.log(`  - Field has ${fieldAnnotationAttr.info.num_annotations} annotation(s)`);
        console.log(`  - Field annotation type index: ${fieldAnnotationAttr.info.annotations[0].type_index}`);
        console.log(`  - Field annotation element pairs: ${fieldAnnotationAttr.info.annotations[0].num_element_value_pairs}`);

        console.log('✓ Testing method annotation exposure...');
        
        // Test method annotations  
        if (!ast.ast.methods || ast.ast.methods.length < 2) {
            throw new Error('Expected at least 2 methods in AST');
        }

        const annotatedMethod = ast.ast.methods[1]; // annotatedMethod should be second
        if (annotatedMethod.name !== 'annotatedMethod') {
            throw new Error(`Expected method name 'annotatedMethod', got '${annotatedMethod.name}'`);
        }

        if (!annotatedMethod.attributes) {
            throw new Error('Method attributes array is missing from AST');
        }

        if (annotatedMethod.attributes.length === 0) {
            throw new Error('Method attributes array is empty in AST');
        }

        // Find RuntimeVisibleAnnotations attribute
        const methodAnnotationAttr = annotatedMethod.attributes.find(attr => {
            return attr.attribute_name_index.name && 
                   attr.attribute_name_index.name.tag === 1 &&
                   attr.attribute_name_index.name.info.bytes === 'RuntimeVisibleAnnotations';
        });

        if (!methodAnnotationAttr) {
            throw new Error('RuntimeVisibleAnnotations attribute not found in method attributes');
        }

        if (!methodAnnotationAttr.info.annotations || methodAnnotationAttr.info.annotations.length === 0) {
            throw new Error('Method annotation info is missing or empty');
        }

        console.log(`  - Method has ${methodAnnotationAttr.info.num_annotations} annotation(s)`);
        console.log(`  - Method annotation type index: ${methodAnnotationAttr.info.annotations[0].type_index}`);
        console.log(`  - Method annotation element pairs: ${methodAnnotationAttr.info.annotations[0].num_element_value_pairs}`);

        console.log('✓ Testing annotation data integrity...');

        // Test annotation data can be resolved through constant pool
        const constantPool = struct.constant_pool.entries;
        
        // Verify field annotation type
        const fieldAnnotationType = constantPool[fieldAnnotationAttr.info.annotations[0].type_index];
        if (!fieldAnnotationType || fieldAnnotationType.tag !== 1 || fieldAnnotationType.info.bytes !== 'LCustomAnnotation;') {
            throw new Error('Field annotation type resolution failed');
        }

        // Verify method annotation type
        const methodAnnotationType = constantPool[methodAnnotationAttr.info.annotations[0].type_index];
        if (!methodAnnotationType || methodAnnotationType.tag !== 1 || methodAnnotationType.info.bytes !== 'LCustomAnnotation;') {
            throw new Error('Method annotation type resolution failed');
        }

        console.log('  - Annotation type references are valid');

        // Verify annotation values can be resolved
        const fieldAnnotation = fieldAnnotationAttr.info.annotations[0];
        for (const pair of fieldAnnotation.element_value_pairs) {
            const elementName = constantPool[pair.element_name_index];
            if (!elementName || elementName.tag !== 1) {
                throw new Error('Annotation element name resolution failed');
            }
            
            const elementValue = constantPool[pair.value.value.const_value_index];
            if (!elementValue) {
                throw new Error('Annotation element value resolution failed');
            }
        }

        console.log('  - Annotation element values are resolvable');

        console.log('\n🎉 All tests passed! RuntimeVisibleAnnotations are properly exposed in AST.');
        return true;

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        throw error;
    }
}

// Run the test
try {
    test_annotation_attributes_exposure();
    process.exit(0);
} catch (error) {
    process.exit(1);
}