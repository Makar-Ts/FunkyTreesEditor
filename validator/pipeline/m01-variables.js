import * as monaco from '../../libs/monaco-editor/main.js';

const variables = [];
const variableByLine = new Map();

export default function recalculateVariables(model) {
  const fields = model.findMatches(
    /^ *\w+ *\|=/,
    false,
    true,
    false,
    null,
    false
  );

  variables.length = 0;
  variableByLine.clear();

  for (let i = 0; i < fields.length; i++) {
    const { range } = fields[i];

    const name = model
      .getValueInRange(range)
      .replace('|=', '')
      .trim();

    const next = fields[i + 1];

    let endLineNumber, endColumn;

    if (next) {
      endLineNumber = next.range.startLineNumber;
      endColumn = next.range.startColumn;
    } else {
      endLineNumber = model.getLineCount();
      endColumn = model.getLineMaxColumn(endLineNumber);
    }

    const contentRange = new monaco.Range(
      range.endLineNumber,
      range.endColumn,
      endLineNumber,
      endColumn
    );

    const content = model.getValueInRange(contentRange).trim();

    variables.push({ name, content, contentRange });

    variableByLine.set(range.startLineNumber, content);
  }

  return {
    variables, variableByLine
  }
};