import * as monaco from '../libs/monaco-editor/main.js';

import { editor } from "../editor/main.js";
import { parse } from "./parcer/parser.js";

import variables from './pipeline/m01-variables.js'
import decorations from './pipeline/m02-decorations.js'
import { validate } from './pipeline/m03-validate/v01-main.js';
import { handleParsingError } from './helpers/handle-parsing-error.js';
import { ON_TABS_CHANGED_EVENT } from '../tabs/constant.js';
import { ON_VALIDATION_ENDED } from './constant.js';


function validateModel() {
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

  const parsedVariables = [];
  if (vars.length) {
    for (const variable of vars) {
      const out = {
        ...variable
      };

      if (variable.activator) {
        try {
          const parsedActivator = parse(variable.activator.content);
          out.activator.parsed = parsedActivator;

          diagnostics.push(...validate(parsedActivator, vars, variable.activator.range))
        } catch (e) {
          handleParsingError(e, variable);
        }
      }

      try {
        const parsedContent = parse(variable.content.content);
        out.content.parsed = parsedContent;

        diagnostics.push(...validate(parsedContent, vars, variable.content.range))
      } catch (e) {
        handleParsingError(e, variable);
      }

      parsedVariables.push(out);
    }
  } else {
    const out = {
      name: {
        content: '',
        range: new monaco.Range(1, 0, 1, 0),
      },
      content: {
        content: model.getValue(),
        range: new monaco.Range(
          1, 0, 
          model.getLineCount(), model.getLineMaxColumn(model.getLineCount())
        ),
      }
    }

    try {
      const parsedContent = parse(out.content.content);
      out.content.parsed = parsedContent;

      diagnostics.push(...validate(parsedContent, vars, out.content.range))
    } catch (e) {
      handleParsingError(e, out);
    }

    parsedVariables.push(out);
  }

  monaco.editor.setModelMarkers(model, "funky", diagnostics);
  window.dispatchEvent(new CustomEvent(
    ON_VALIDATION_ENDED,
    { detail: { variables: parsedVariables, variableByLine } }
  ));
}


editor.onDidChangeModelContent(validateModel);
window.addEventListener(ON_TABS_CHANGED_EVENT, validateModel);
