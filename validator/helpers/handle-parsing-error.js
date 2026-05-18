import * as monaco from '../../libs/monaco-editor/main.js';

import { BadToken, UnexpectedCharacter, UnexpectedToken } from '../parcer/parser-errors.js';
import { toGlobalPosition } from './to-global-position.js';

export function handleParsingError(e, variable) {
  if (e instanceof UnexpectedCharacter) {
    const { position, char } = e;
    const start = toGlobalPosition(position, variable.content.range);

    return {
      severity: monaco.MarkerSeverity.Error,
      message: `${e.constructor.name}: Unexpected character "${char}"`,

      startLineNumber: start.lineNumber,
      startColumn: start.column,

      endLineNumber: start.lineNumber,
      endColumn: start.column+1
    };
  } else if (e instanceof UnexpectedToken) {
    const { token, previousToken, position } = e;
    const start = toGlobalPosition(position, variable.content.range);

    return {
      severity: monaco.MarkerSeverity.Error,
      message: `${e.constructor.name}: Unexpected token "${previousToken ? previousToken.name ?? previousToken.type : token.name ?? token.type}"`,

      startLineNumber: start.lineNumber,
      startColumn: start.column,

      endLineNumber: variable.content.range.endLineNumber,
      endColumn: variable.content.range.endColumn
    };
  } else if (e instanceof BadToken) {
    const { token, previousToken, position, expectedToken } = e;
    const start = toGlobalPosition(position, variable.content.range);

    return {
      severity: monaco.MarkerSeverity.Error,
      message: `${e.constructor.name}: Expected ${expectedToken}, but got "${previousToken ? previousToken.name ?? previousToken.type : token.name ?? token.type}"`,

      startLineNumber: start.lineNumber,
      startColumn: start.column,

      endLineNumber: variable.content.range.endLineNumber,
      endColumn: variable.content.range.endColumn
    };
  } else {
    throw e;
  }
}