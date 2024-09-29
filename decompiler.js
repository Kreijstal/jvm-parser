const { decompileClassFile, ClassFile, opcodeNames } = require('./your-module-path'); // Adjust the path as necessary

/**
 * Get the disassembled string of a class file.
 * @param {Buffer} cafebabe - The binary content of the class file.
 * @returns {string} - The disassembled string.
 */
function getDisassembled(cafebabe) {
    return decompileClassFile(ClassFile.parse(new Uint8Array(cafebabe)), opcodeNames);
}

/**
 * Get the AST form of a class file.
 * @param {Buffer} cafebabe - The binary content of the class file.
 * @returns {Object} - The AST representation.
 */
function getAST(cafebabe) {
    return ClassFile.parse(new Uint8Array(cafebabe));
}

module.exports = {
    getDisassembled,
    getAST
};
