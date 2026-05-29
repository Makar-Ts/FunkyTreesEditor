import * as monaco from '../../libs/monaco-editor/main.js';
import { isInsideAnyRange } from '../../utils/is-inside-any-range.js';
import { stripComments } from '../../utils/strip-comments.js';
import { getCommentRanges } from '../helpers/get-comment-ranges.js';

export const VARIABLE_REGEX = /^( *\|>? *\w+)/;

const OPEN_RE = /(^ *\|>)/g;
const CLOSE_RE = /\|=/g;

const variables = [];
const variableByLine = new Map();
const errors = [];

function findNextMatchInRange(model, pattern, fromPos, blockRange) {
  const match = model.findNextMatch(pattern, fromPos, false, false, null, true);
  if (!match) return null;
  if (!blockRange.containsRange(match.range)) return null;
  return match;
}

function parseBlock(model, open, close) {
  const blockRange = new monaco.Range(
    open.range.startLineNumber,
    1,
    close.range.endLineNumber,
    close.range.endColumn
  );

  const raw = model.getValueInRange(blockRange);

  const firstSemicolon = findNextMatchInRange(
    model,
    ';',
    new monaco.Position(open.range.endLineNumber, open.range.endColumn),
    blockRange
  );

  let name, priority, activator;

  if (!firstSemicolon) {
    const nameRange = new monaco.Range(
      open.range.endLineNumber,
      open.range.endColumn,
      close.range.startLineNumber,
      close.range.startColumn
    );

    name = {
      content: stripComments(model.getValueInRange(nameRange)).trim(),
      range: nameRange,
    };
  } else {
    const nameRange = new monaco.Range(
      open.range.endLineNumber,
      open.range.endColumn,
      firstSemicolon.range.startLineNumber,
      firstSemicolon.range.startColumn
    );

    name = {
      content: stripComments(model.getValueInRange(nameRange)).trim(),
      range: nameRange,
    };

    const secondSemicolon = findNextMatchInRange(
      model,
      ';',
      new monaco.Position(firstSemicolon.range.endLineNumber, firstSemicolon.range.endColumn),
      blockRange
    );

    if (!secondSemicolon) {
      const priorityRange = new monaco.Range(
        firstSemicolon.range.endLineNumber,
        firstSemicolon.range.endColumn,
        close.range.startLineNumber,
        close.range.startColumn
      );

      priority = {
        content: model.getValueInRange(priorityRange).trim(),
        range: priorityRange,
      };
    } else {
      const priorityRange = new monaco.Range(
        firstSemicolon.range.endLineNumber,
        firstSemicolon.range.endColumn,
        secondSemicolon.range.startLineNumber,
        secondSemicolon.range.startColumn
      );

      priority = {
        content: model.getValueInRange(priorityRange).trim(),
        range: priorityRange,
      };

      const activatorRange = new monaco.Range(
        secondSemicolon.range.endLineNumber,
        secondSemicolon.range.endColumn,
        close.range.startLineNumber,
        close.range.startColumn
      );

      activator = {
        content: model.getValueInRange(activatorRange).trim(),
        range: activatorRange,
      };
    }
  }

  return { blockRange, name, priority, activator, raw };
}

export default function recalculateVariables(model) {
  variables.length = 0;
  variableByLine.clear();
  errors.length = 0;

  const commentRanges = getCommentRanges(model);

  const opens = model.findMatches(OPEN_RE, false, true, false, null, true)
    .filter(m => !isInsideAnyRange(m.range, commentRanges));

  const closes = model.findMatches(CLOSE_RE, false, true, false, null, true)
    .filter(m => !isInsideAnyRange(m.range, commentRanges));

  const usedCloses = new Set();
  const pairs = [];

  for (const open of opens) {
    const close = closes.find(c =>
      !usedCloses.has(c) &&
      c.range.startLineNumber >= open.range.startLineNumber
    );

    if (!close) {
      errors.push({
        type: 'MISSING_CLOSE',
        message: 'Expected closing "|=" for "|>"',
        range: open.range,
      });
      continue;
    }

    usedCloses.add(close);
    pairs.push({ open, close });
  }

  for (const close of closes) {
    if (!usedCloses.has(close)) {
      errors.push({
        type: 'UNEXPECTED_CLOSE',
        message: 'Closing "|=" without opening "|>"',
        range: close.range,
      });
    }
  }

  for (let i = 0; i < pairs.length; i++) {
    const { open, close } = pairs[i];
    const { blockRange, name, priority, activator } = parseBlock(model, open, close);

    if (!name?.content) {
      errors.push({
        type: 'EMPTY_NAME',
        message: 'Empty field name',
        range: blockRange,
      });
    }

    if (variables.some(v => v.name?.content === name?.content)) {
      errors.push({
        type: 'DUPLICATE_NAME',
        message: 'Duplicate field name',
        range: blockRange,
      });
    }

    const next = pairs[i + 1];
    let endLineNumber, endColumn;

    if (next) {
      endLineNumber = next.open.range.startLineNumber;
      endColumn = 0;
    } else {
      endLineNumber = model.getLineCount();
      endColumn = model.getLineMaxColumn(endLineNumber);
    }

    const contentRange = new monaco.Range(
      close.range.endLineNumber,
      close.range.endColumn,
      endLineNumber,
      endColumn
    );

    const content = {
      content: model.getValueInRange(contentRange).trim(),
      range: contentRange,
    };

    const variable = { name, priority, activator, content };

    variables.push(variable);
    variableByLine.set(open.range.startLineNumber, variable);
  }

  return { variables, variableByLine, errors };
}