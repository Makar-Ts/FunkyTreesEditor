import { Position } from "../../../libs/monaco-editor/main.js";
import { toGlobalPosition } from "../../helpers/to-global-position.js";
import { validateFunctionCall } from "./validate-function-call.js";
import { validateVariable } from "./validate-variable.js";

export function validate(ast, variables, contentRange) {
  const diagnostics = [];
  function addDiagnostics(r) {
    const start = toGlobalPosition(
      new Position(r.startLineNumber, r.startColumn), contentRange
    )
    const end = toGlobalPosition(
      new Position(r.endLineNumber, r.endColumn), contentRange
    )

    diagnostics.push({
      ...r,
      
      startLineNumber: start.lineNumber,
      startColumn: start.column,

      endLineNumber: end.lineNumber,
      endColumn: end.column
    });
  }

  walk(ast);

  return diagnostics;


  function walk(node) {
    if (!node) return;

    switch (node.type) {
      case "CallExpression":
        validateFunctionCall(node, addDiagnostics);

        for (const arg of node.args) walk(arg);

        break;

      case "BinaryExpression":
        walk(node.left);
        walk(node.right);

        break;

      case "UnaryExpression":
        walk(node.argument);

        break;
      
      case "ConditionalExpression":
        walk(node.test);
        walk(node.consequent);
        walk(node.alternate);

        break;
      
      case "Variable":
        validateVariable(node, addDiagnostics, variables)

        break;
    }
  }
}
