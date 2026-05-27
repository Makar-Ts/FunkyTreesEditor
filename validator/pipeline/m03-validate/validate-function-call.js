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
      message: `FunctionError: Function "${node.name}" does not exists`,

      ...node.range
    });

    return;
  }

  if (docs.params.length !== node.args.length) {
    addDiagnostics({
      severity: monaco.MarkerSeverity.Error,
      message: `FunctionError: Expected ${docs.params.length} argument${docs.params.length === 1 ? '' : 's'}, but received ${node.args.length}`,

      ...node.range
    });

    return;
  }
}