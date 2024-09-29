
function decompileClassFile(x, opcodeNames) {
  const constantPool = x.constant_pool.entries;
  const cp = {}; // Map for easy constant pool access

  // Build a map for the constant pool
  for (let i = 1; i < constantPool.length; i++) {
    if (constantPool[i]) {
      cp[i] = constantPool[i];
    }
  }

  // Helper function to get UTF8 strings from the constant pool
  function getUtf8(index) {
    const entry = cp[index];
    if (entry && entry.tag === 1) {
      return entry.info.bytes;
    }
    return null;
  }

  // Helper function to get class names from the constant pool
  function getClassName(index) {
    const entry = cp[index];
    if (entry && entry.tag === 7) {
      const nameIndex = entry.info.name_index;
      return getUtf8(nameIndex).replace(/\//g, ".");
    }
    return null;
  }

  // Helper function to get name and type from the constant pool
  function getNameAndType(index) {
    const entry = cp[index];
    if (entry && entry.tag === 12) {
      const name = getUtf8(entry.info.name_index);
      const descriptor = getUtf8(entry.info.descriptor_index);
      return { name, descriptor };
    }
    return null;
  }

  // Helper function to resolve method references
  function getMethodRef(index) {
    const entry = cp[index];
    if (entry && (entry.tag === 10 || entry.tag === 9)) {
      const className = getClassName(entry.info.class_index);
      const nameAndType = getNameAndType(entry.info.name_and_type_index);
      return {
        className,
        name: nameAndType.name,
        descriptor: nameAndType.descriptor
      };
    }
    return null;
  }

  // Helper function to resolve field references
  function getFieldRef(index) {
    return getMethodRef(index);
  }

  // Helper function to format access flags
  function formatAccessFlags(flags) {
    const access = [];
    if (flags & 0x0001) access.push("public");
    if (flags & 0x0002) access.push("private");
    if (flags & 0x0004) access.push("protected");
    if (flags & 0x0008) access.push("static");
    if (flags & 0x0010) access.push("final");
    if (flags & 0x0020) access.push("synchronized");
    if (flags & 0x0100) access.push("native");
    if (flags & 0x0400) access.push("abstract");
    if (flags & 0x0800) access.push("strictfp");
    return access.join(" ");
  }

  // Start building the output
  let output = "";

  // Get the source file name
  const sourceFileAttr = x.attributes.find(
    (attr) => getUtf8(attr.attribute_name_index.index) === "SourceFile"
  );
  let sourceFileName = "";
  if (sourceFileAttr) {
    sourceFileName = getUtf8(sourceFileAttr.info.sourcefile_index);
  }

  output += `Compiled from "${sourceFileName}"\n`;

  // Get the class name
  const className = getClassName(x.this_class);
  const superClassName = getClassName(x.super_class);

  // Format class declaration
  const classAccessFlags = formatAccessFlags(x.access_flags);
  output += `${classAccessFlags} class ${className}`;
  if (superClassName && superClassName !== "java.lang.Object") {
    output += ` extends ${superClassName}`;
  }
  output += " {\n";

  // Process fields
  for (const field of x.fields) {
    const fieldAccessFlags = formatAccessFlags(field.access_flags);
    const fieldName = getUtf8(field.name_index);
    const fieldDescriptor = getUtf8(field.descriptor_index);
    output += `  ${fieldAccessFlags} ${fieldDescriptor} ${fieldName};\n`;
  }

  // Process methods
  for (const method of x.methods) {
    const methodAccessFlags = formatAccessFlags(method.access_flags);
    const methodName = getUtf8(method.name_index);
    const methodDescriptor = getUtf8(method.descriptor_index);

    output += `\n  ${methodAccessFlags} ${methodDescriptor} ${methodName}();\n`;

    // Find the Code attribute
    const codeAttr = method.attributes.find(
      (attr) => getUtf8(attr.attribute_name_index.index) === "Code"
    );
    if (codeAttr) {
      output += "    Code:\n";
      const code = codeAttr.info.code.instructions;
      let pc = 0;
      for (const inst of code) {
        const opcode = inst.instruction.opcode;
        const opcodeName = opcodeNames[opcode];
        let line = `       ${pc}: ${opcodeName}`;
        // Handle operands
        if ("index" in inst.instruction.info) {
          const index = inst.instruction.info.index;
          // Resolve constant pool references
          if (
            opcode === 178 ||
            opcode === 182 ||
            opcode === 183 ||
            opcode === 184
          ) {
            const methodRef = getMethodRef(index);
            if (methodRef) {
              line += ` #${index}                  // Method ${methodRef.className}.${methodRef.name}:${methodRef.descriptor}`;
            }
          } else if (opcode === 18) {
            // ldc
            const cpEntry = cp[index];
            if (cpEntry) {
              if (cpEntry.tag === 8) {
                const stringIndex = cpEntry.info.string_index;
                const stringValue = getUtf8(stringIndex);
                line += ` #${index}                  // String "${stringValue}"`;
              }
            }
          } else {
            line += ` #${index}`;
          }
        }
        output += `${line}\n`;
        pc += 1; // In real scenario, increment by instruction length
      }
    }
  }

  output += "}\n";

  return output;
}
