const { decompileClassFile } = require('./dissasembleClass');
const { ClassFile } = require('./parsers');
const opcodeNames = require('./opcodeNames');

/**
 * Get the disassembled string of a class file.
 * @param {Uint8Array} cafebabe - The binary content of the class file.
 * @returns {string} - The disassembled string.
 */
function getDisassembled(cafebabe) {
    return decompileClassFile(ClassFile.parse(cafebabe), opcodeNames);
}

/**
 * Get the AST form of a class file.
 * @param {Uint8Array} cafebabe - The binary content of the class file.
 * @returns {Object} - The AST representation.
 */
function getAST(cafebabe) {
    return ClassFile.parse(cafebabe);
}

module.exports = {
    getDisassembled,
    getAST
};
