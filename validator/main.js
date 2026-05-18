import * as monaco from '../libs/monaco-editor/main.js';

import { editor } from "../editor/main.js";
import { parse } from "./parcer/parser.js";

import variables from './pipeline/m01-variables.js'
import decorations from './pipeline/m02-decorations.js'
import { BadToken, UnexpectedCharacter, UnexpectedToken } from './parcer/parser-errors.js';
import { toGlobalPosition } from './helpers/to-global-position.js';
import { validate } from './pipeline/m03-validate/v01-main.js';


editor.onDidChangeModelContent(() => {
  const model = editor.getModel();

  const { 
    variables: vars, 
    variableByLine 
  } = variables(model);

  decorations(editor, variableByLine);

  let diagnostics = [];
  for (const variable of vars) {
    try {
      const parsed = parse(variable.content);

      diagnostics.push(...validate(parsed, vars, variable.contentRange))
    } catch (e) {
      if (e instanceof UnexpectedCharacter) {
        const { position, char } = e;
        const start = toGlobalPosition(position, variable.contentRange);

        diagnostics.push({
          severity: monaco.MarkerSeverity.Error,
          message: `Unexpected character "${char}"`,

          startLineNumber: start.lineNumber,
          startColumn: start.column,

          endLineNumber: start.lineNumber,
          endColumn: start.column+1
        });
      } else if (e instanceof UnexpectedToken) {
        const { token, previousToken, position } = e;
        const start = toGlobalPosition(position, variable.contentRange);

        diagnostics.push({
          severity: monaco.MarkerSeverity.Error,
          message: `Unexpected token "${previousToken ? previousToken.name ?? previousToken.type : token.name ?? token.type}"`,

          startLineNumber: start.lineNumber,
          startColumn: start.column,

          endLineNumber: variable.contentRange.endLineNumber,
          endColumn: variable.contentRange.endColumn
        });
      } else if (e instanceof BadToken) {
        const { token, previousToken, position, expectedToken } = e;
        const start = toGlobalPosition(position, variable.contentRange);

        diagnostics.push({
          severity: monaco.MarkerSeverity.Error,
          message: `Expected ${expectedToken}, got "${previousToken ? previousToken.name ?? previousToken.type : token.name ?? token.type}"`,

          startLineNumber: start.lineNumber,
          startColumn: start.column,

          endLineNumber: variable.contentRange.endLineNumber,
          endColumn: variable.contentRange.endColumn
        });
      } else {
        throw e;
      }
    }
  }

  monaco.editor.setModelMarkers(model, "funky", diagnostics);
});
