import ts from 'typescript';
import { logToFile } from './logToFile';

export async function checkFunctionReturnType({ code, functionName }: { code: string; functionName: string }): Promise<string> {
  try {
    // Create and compile program
    // Create an in-memory source file
    const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.ES2015, true);

    // Create an in-memory compiler host
    const compilerHost: ts.CompilerHost = {
      ...ts.createCompilerHost({}),
      getSourceFile: (fileName) => (fileName === 'temp.ts' ? sourceFile : undefined),
      readFile: (fileName) => (fileName === 'temp.ts' ? code : undefined),
    };

    // Create and compile program with the in-memory compiler host
    const program = ts.createProgram(['temp.ts'], {}, compilerHost);
    const checker = program.getTypeChecker();

    // Helper function to search the AST nodes for a function declaration
    function findFunctionDeclaration(node: ts.Node, functionName: string): ts.FunctionDeclaration | undefined {
      if (ts.isFunctionDeclaration(node) && node.name && node.name.text === functionName) {
        return node;
      }

      let functionDecl: ts.FunctionDeclaration | undefined;
      ts.forEachChild(node, (childNode) => {
        if (functionDecl) return;
        functionDecl = findFunctionDeclaration(childNode, functionName);
      });

      return functionDecl;
    }

    // Find function declaration
    const funcDecl = findFunctionDeclaration(sourceFile, functionName);

    if (!funcDecl?.name) {
      throw new Error(`Function '${functionName}' not found in code.`);
    }

    const funcSym = checker.getSymbolAtLocation(funcDecl?.name);

    if (!funcSym || !funcSym.valueDeclaration) {
      throw new Error(`Symbol not found for function '${functionName}'. Ensure the function exists and is correctly spelled.`);
    }

    const typeOfFuncSym = checker.getTypeOfSymbolAtLocation(funcSym, funcSym.valueDeclaration);

    const returnType = checker.getReturnTypeOfSignature(typeOfFuncSym.getCallSignatures()[0]);

    return checker.typeToString(returnType);
  } catch (error) {
    logToFile(`Error during return type check: ${error instanceof Error ? error.message : error}`);

    return 'Error during return type check';
  }
}
