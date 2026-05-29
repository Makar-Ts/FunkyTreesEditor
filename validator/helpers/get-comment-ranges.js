import * as monaco from '../../libs/monaco-editor/main.js';

export function getCommentRanges(model) {
  const fullText = model.getValue();

  const ranges = [];

  let i = 0;
  let line = 1;
  let col = 1;

  let inString = false;
  let quote = null;

  while (i < fullText.length) {
    const ch = fullText[i];
    const next = fullText[i + 1];

    if (inString) {
      if (ch === "\\" && i + 1 < fullText.length) {
        i += 2;
        col += 2;
        continue;
      }

      if (ch === quote) {
        inString = false;
        quote = null;
      }

      if (ch === "\n") {
        line++;
        col = 1;
      } else {
        col++;
      }

      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      quote = ch;
      i++;
      col++;
      continue;
    }

    // line comment
    if (ch === "/" && next === "/") {
      const startLine = line;
      const startCol = col;

      while (i < fullText.length && fullText[i] !== "\n") {
        i++;
        col++;
      }

      ranges.push(
        new monaco.Range(startLine, startCol, line, col)
      );

      continue;
    }

    // block comment
    if (ch === "/" && next === "*") {
      const startLine = line;
      const startCol = col;

      i += 2;
      col += 2;

      while (i < fullText.length) {
        if (fullText[i] === "*" && fullText[i + 1] === "/") {
          i += 2;
          col += 2;
          break;
        }

        if (fullText[i] === "\n") {
          line++;
          col = 1;
        } else {
          col++;
        }

        i++;
      }

      ranges.push(
        new monaco.Range(startLine, startCol, line, col)
      );

      continue;
    }

    if (ch === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }

    i++;
  }

  return ranges;
}