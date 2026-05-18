import * as monaco from '../libs/monaco-editor/main.js';
import './lang/register.js';

export const editor = monaco.editor.create(
  document.getElementById('editor'),
  {
    language: 'funky',
    theme: 'funky-dark',

    value: ``
  }
);

editor.updateOptions({
  glyphMargin: true
});