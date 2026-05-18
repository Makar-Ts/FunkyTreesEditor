import { CHANGE_LOGS, CHANGE_LOGS_HTML_TEMPLATE } from "./constants.js";

const changeLogs = document.getElementById('change_logs');
const modal = document.getElementById('change_logs_modal');
const closeModal = document.getElementById('close_change_logs_modal');

const container = document.getElementById('change_logs_modal_logs');
for (const log of CHANGE_LOGS) {
  let out = CHANGE_LOGS_HTML_TEMPLATE
    .replace("{{name}}", log.name)
    .replace("{{date}}", `${log.date.getFullYear()}-${log.date.getDate()}-${log.date.getDay()}`)
    .replace("{{content}}", log.content)
    .replace("{{tags}}", log.tags.join(', '));
  

  container.innerHTML += out;
}

const show = () => {
  modal.style['display'] = 'block';

  const rect = container.children[0].getBoundingClientRect();
  container.style['maxHeight'] = `${rect.height}px`;
}

changeLogs.addEventListener('click', show)

closeModal.addEventListener('click', () => {
  modal.style['display'] = 'none';
})


const lastVievedLog = localStorage.getItem('lastLog');
if (!lastVievedLog || lastVievedLog != CHANGE_LOGS[0].name) {
  localStorage.setItem('lastLog', CHANGE_LOGS[0].name);
  show();
}