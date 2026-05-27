import { editor } from "../../editor/main.js";
import { ON_TABS_CHANGED_EVENT } from "../../tabs/constant.js";

const row = document.getElementById('cursor_position_row');
const column = document.getElementById('cursor_position_column');

const selectionContainer = document.getElementById('cursor_selection_container');
const selectionAmount = document.getElementById('cursor_selection_amount');


function updatePosition(range) {
  const {
    startLineNumber, endLineNumber,
    startColumn, endColumn,
  } = range;

  let isRangeSelection = false;


  if (startLineNumber === endLineNumber) {
    row.innerText = String(startLineNumber);
  } else {
    row.innerText = `${Math.min(startLineNumber, endLineNumber)}:${Math.max(startLineNumber, endLineNumber)}`

    isRangeSelection = true;
  }


  if (startColumn === endColumn) {
    column.innerText = String(startColumn);
  } else {
    const sameLine = startLineNumber === endLineNumber;

    const fromColumn = sameLine
      ? Math.min(startColumn, endColumn)
      : (startLineNumber < endLineNumber ? startColumn : endColumn);

    const toColumn = sameLine
      ? Math.max(startColumn, endColumn)
      : (startLineNumber < endLineNumber ? endColumn : startColumn);

    column.innerText = `${fromColumn}:${toColumn}`;

    isRangeSelection = true;
  }


  if (isRangeSelection) {
    const model = editor.getModel();
    const text = model.getValueInRange(range);

    selectionAmount.innerText = text.length;
    selectionContainer.style.display = 'inline';
  } else {
    selectionContainer.style.display = 'none';
  }
}

editor.onDidChangeCursorSelection((e) => {
  updatePosition(e.selection);
});

globalThis.addEventListener(ON_TABS_CHANGED_EVENT, () => {
  updatePosition(editor.getSelection());
})