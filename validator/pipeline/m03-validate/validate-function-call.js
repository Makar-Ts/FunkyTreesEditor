import * as monaco from '../../../libs/monaco-editor/main.js';

import { funkyDocs } from "../../../editor/lang/docs.js";
import { Token } from "../../parcer/parser.js";

/**
 * @param {Token} node 
 * @param {(add: any) => void} addDiagnostics 
 */
export function validateFunctionCall(node, addDiagnostics) {
  const docs = funkyDocs.functions[node.name];

  if (!docs) {
    addDiagnostics({
      severity: monaco.MarkerSeverity.Error,
      message: `Function "${node.name}" is not exists`,

      startLineNumber: node.line,
      startColumn: node.column,

      endLineNumber: node.line,
      endColumn: node.column + node.name.length
    });

    return;
  }

  if (docs.params.length !== node.args.length) {
    addDiagnostics({
      severity: monaco.MarkerSeverity.Error,
      message: `Expected ${docs.params.length} argument${docs.params.length === 1 ? '' : 's'}, recieved ${node.args.length}`,

      startLineNumber: node.line,
      startColumn: node.column,

      endLineNumber: node.line,
      endColumn: node.column + node.name.length
    });

    return;
  }
}