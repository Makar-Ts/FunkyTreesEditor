import { funkyDocs } from '../../../editor/lang/docs.js';
import * as monaco from '../../../libs/monaco-editor/main.js';

import { Token } from "../../parcer/parser.js";

/**
 * @param {Token} node 
 * @param {(add: any) => void} addDiagnostics
 * @param {Array<any>} contextVariables 
 */
export function validateVariable(node, addDiagnostics, contextVariables) {
  if (!contextVariables.some(r => r.name.content === node.name)) {
    const docs = funkyDocs.variables[node.name];

    if (!docs) {
      addDiagnostics({
        severity: monaco.MarkerSeverity.Error,
        message: `VariableError: Variable "${node.name}" is not defined or is not exists`,

        ...node.range
      });

      return;
    }
  }
}