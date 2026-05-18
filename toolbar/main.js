import * as monaco from "../libs/monaco-editor/main.js";
import { editor } from '../editor/main.js'

const toolbar = document.getElementById('toolbar');
const copy = document.getElementById('copy');

const info = document.getElementById('info');
const infoModal = document.getElementById('info_modal');
const closeInfoModal = document.getElementById('close_info_modal');

copy.addEventListener('click', (e) => {
  navigator.clipboard.writeText(editor.getValue())
    .then(() => {
      copy.style['--blink-color'] = 'lime';
      copy.style['animation'] = 'blink 2s ease-out 0s 1 forwards';

      setTimeout(() => copy.style['animation'] = undefined, 2000);
    })
    .catch(() => {
      copy.style['--blink-color'] = 'red';
      copy.style['animation'] = 'blink 2s ease-out 0s 1 forwards';

      setTimeout(() => copy.style['animation'] = undefined, 2000);
    })
})

info.addEventListener('click', () => {
  infoModal.style['display'] = 'block';
})

closeInfoModal.addEventListener('click', () => {
  infoModal.style['display'] = 'none';
})


const variables = [];
const variableByLine = new Map();
let decorations = [];

editor.getModel().onDidChangeContent(() => {
  const model = editor.getModel();

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

  const newDecorations = [];

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

    variables.push({ name, content });

    variableByLine.set(range.startLineNumber, content);

    newDecorations.push({
      range: new monaco.Range(range.startLineNumber, 1, range.startLineNumber, 1),
      options: {
        glyphMarginClassName: "copyVarBtn",
        glyphMarginHoverMessage: { value: "Copy variable" }
      }
    });
  }

  decorations = editor.deltaDecorations(decorations, newDecorations);
  console.log(newDecorations)
});


editor.onMouseDown((e) => {
  if (e.target.type !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) return;

  const line = e.target.position?.lineNumber;
  if (!line) return;

  const value = variableByLine.get(line);
  if (!value) return;

  navigator.clipboard.writeText(value)
    .then(() => {
      console.log("copied");
    })
    .catch(() => {
      console.log("copy failed");
    });
});