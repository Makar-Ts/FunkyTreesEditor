import { decodeToJson, loadState } from "../main.js";

const sharedButton = document.getElementById('new_tab_selector_shared');

const sharedModal = document.getElementById('shared_modal');
const sharedModalContainer = document.getElementById('shared_modal_container');
const closeSharedModal = document.getElementById('close_shared_modal');

const sharedInput = document.getElementById('shared_input');


sharedInput.addEventListener('input', () => {
  if (!sharedInput.value) {
    return;
  }

  const ifOk = (state) => {
    if (loadState(state, 'shared_', true)) {
      sharedModal.style['display'] = 'none';
    } else {
      ifBad();
    }
  }

  const ifBad = () => {
    sharedInput.style.setProperty('--blink-color', 'red');
    sharedInput.style['animation'] = 'blink 2s ease-out 0s 1 forwards';

    setTimeout(() => sharedInput.style['animation'] = undefined, 2000);
  }

  try {
    const url = new URL(sharedInput.value);
    const b64 = url.searchParams.get('tabs');

    if (!b64) {
      sharedAdd.setAttribute('disabled', 'true');
      return;
    }

    decodeToJson(b64)
      .then(ifOk)
      .catch(() => {
        decodeToJson(sharedInput.value)
          .then(ifOk)
          .catch(ifBad);
      });
  } catch {
    decodeToJson(sharedInput.value)
      .then(ifOk)
      .catch(ifBad);
  }
});


sharedButton.addEventListener('click', () => {
  sharedInput.value = '';
  sharedModal.style['display'] = 'block';
})

closeSharedModal.addEventListener('click', () => {
  sharedModal.style['display'] = 'none';
})