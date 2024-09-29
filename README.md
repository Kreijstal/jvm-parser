# JVM Parser

A command-line tool to disassemble Java class files and obtain their Abstract Syntax Tree (AST) representation.

## Features

- Disassemble Java class files to human-readable format.
- Retrieve the AST form of Java class files.

## Installation

To install the tool, clone the repository and run the following command to link the package:

```bash
npm link
```

## Usage

### Disassemble a Class File

To disassemble a class file, use the following command:

```bash
disassembler path/to/your/hello.class
```

This will output the disassembled string of the specified class file.

### Get AST Form

To get the AST form of a class file, you can use the `getAST` function from the `decompiler.js` module in your Node.js application:

```javascript
const { getAST } = require('./decompiler');
const fs = require('fs');

fs.readFile('path/to/your/hello.class', (err, data) => {
    if (err) throw err;
    const ast = getAST(data);
    console.log(ast);
});
```

## License

This project is licensed under the ISC License.
