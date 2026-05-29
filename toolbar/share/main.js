import { exportCurrentTab } from "../../tabs/main.js";

const _open = document.getElementById('share');

const shareModal = document.getElementById('share_modal');
const shareModalContainer = document.getElementById('share_modal_container');
const closeShareModal = document.getElementById('close_share_modal');

const copyUrl = document.getElementById('share_copy_url');
const copyData = document.getElementById('share_copy_data');


_open.addEventListener('click', () => {
  shareModal.style['display'] = 'block';
})

closeShareModal.addEventListener('click', () => {
  shareModal.style['display'] = 'none';
})



async function share(asLink = false) {
  let out = await exportCurrentTab();

  if (asLink) {
    const url = new URL(window.location);
    url.searchParams.set('tabs', encodeURIComponent(out));

    out = url.toString();
  }
  return await navigator.clipboard.writeText(out);
}


copyUrl.addEventListener('click', (e) => {
  share(true)
    .then(() => {
      copyUrl.style.setProperty('--blink-color', 'lime');
      copyUrl.style['animation'] = 'blink 2s ease-out 0s 1 forwards';

      setTimeout(() => copyUrl.style['animation'] = undefined, 2000);
    })
    .catch(() => {
      copyUrl.style.setProperty('--blink-color', 'red');
      copyUrl.style['animation'] = 'blink 2s ease-out 0s 1 forwards';

      setTimeout(() => copyUrl.style['animation'] = undefined, 2000);
    })
})

copyData.addEventListener('click', (e) => {
  share()
    .then(() => {
      copyData.style.setProperty('--blink-color', 'lime');
      copyData.style['animation'] = 'blink 2s ease-out 0s 1 forwards';

      setTimeout(() => copyData.style['animation'] = undefined, 2000);
    })
    .catch(() => {
      copyData.style.setProperty('--blink-color', 'red');
      copyData.style['animation'] = 'blink 2s ease-out 0s 1 forwards';

      setTimeout(() => copyData.style['animation'] = undefined, 2000);
    })
})