const fs = require('fs');

// Create sources directory if it doesn't exist
if (!fs.existsSync('sources')) {
    fs.mkdirSync('sources');
}

let javaCode = `
public class RealWide {
    public static void main(String[] args) {
`;

for (let i = 0; i <= 256; i++) {
    javaCode += `        int var${i} = ${i};\n`;
}

javaCode += `        System.out.println(var256);\n`;
javaCode += `    }\n`;
javaCode += `}\n`;

fs.writeFileSync('sources/RealWide.java', javaCode);
