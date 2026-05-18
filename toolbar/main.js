import { editor } from '../editor/main.js'

const toolbar = document.getElementById('toolbar');
const copy = document.getElementById('copy');

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