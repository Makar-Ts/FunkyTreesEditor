import * as monaco from '../../libs/monaco-editor/main.js';


let decorations = [];
let lastVarByLine = new Map();

export default function generateDecorations(editor, variableByLine) {
  lastVarByLine = variableByLine;

  let newDecorations = [];
  for (const [line, content] of variableByLine.entries()) {
    newDecorations.push({
      range: new monaco.Range(line, 1, line, 1),
      options: {
        glyphMarginClassName: "copyVarBtn",
        glyphMarginHoverMessage: { value: "Copy variable" }
      }
    });
  }

  decorations = editor.deltaDecorations(decorations, newDecorations);

  return newDecorations;
}



import { editor } from "../../editor/main.js";

editor.onMouseDown((e) => {
  if (e.target.type !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) return;

  const line = e.target.position?.lineNumber;
  if (!line) return;

  const value = lastVarByLine.get(line);
  if (!value) return;

  navigator.clipboard.writeText(value)
    .then(() => {
      console.log("copied");
    })
    .catch(() => {
      console.log("copy failed");
    });
});