import * as monaco from '../libs/monaco-editor/main.js';

import { editor } from "../editor/main.js";
import { parse } from "./parcer/parser.js";

import variables from './pipeline/m01-variables.js'
import decorations from './pipeline/m02-decorations.js'
import { validate } from './pipeline/m03-validate/v01-main.js';
import { handleParsingError } from './helpers/handle-parsing-error.js';


editor.onDidChangeModelContent(() => {
  const model = editor.getModel();
  let diagnostics = [];

  const { 
    variables: vars, 
    variableByLine,
    errors
  } = variables(model);

  for (const error of errors) {
    diagnostics.push({
      severity: monaco.MarkerSeverity.Error,
      message: `FieldError: ${error.message}`,
      ...error.range
    })
  }

  
  decorations(editor, variableByLine);

  for (const variable of vars) {
    if (variable.activator) {
      try {
        const parsedActivator = parse(variable.activator.content);

        diagnostics.push(...validate(parsedActivator, vars, variable.activator.range))
      } catch (e) {
        handleParsingError(e, variable);
      }
    }

    try {
      const parsedContent = parse(variable.content.content);

      diagnostics.push(...validate(parsedContent, vars, variable.content.range))
    } catch (e) {
      handleParsingError(e, variable);
    }
  }

  monaco.editor.setModelMarkers(model, "funky", diagnostics);
});
