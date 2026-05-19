import * as monaco from "../libs/monaco-editor/main.js";
import { editor } from '../editor/main.js';

import './change-logs/main.js';
import './import/main.js';

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