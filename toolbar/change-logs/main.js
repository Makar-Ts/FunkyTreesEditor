import { CHANGE_LOGS, CHANGE_LOGS_HTML_TEMPLATE } from "./constants.js";

const changeLogs = document.getElementById('change_logs');
const modal = document.getElementById('change_logs_modal');
const closeModal = document.getElementById('close_change_logs_modal');

const upperContainer = document.getElementById('change_logs_modal_container');
const container = document.getElementById('change_logs_modal_logs');
for (const log of CHANGE_LOGS) {
  let out = CHANGE_LOGS_HTML_TEMPLATE
    .replace("{{name}}", log.name)
    .replace("{{date}}", `${log.date.getFullYear()}-${log.date.getDate()}-${log.date.getDay()}`)
    .replace("{{content}}", log.content)
    .replace("{{tags}}", log.tags.join(', '));
  

  container.innerHTML += out;
}

let showAmount = 1;
const show = () => {
  modal.style['display'] = 'block';

  if (showAmount === 1) {
    requestAnimationFrame(() => {
      calculateMaxHeight();
    });
  } else {
    requestAnimationFrame(() => {
      let acc = 0;
      const gap = 40;
      for (let index = 0; index < Math.min(showAmount, container.children.length); index++) {
        const element = container.children[index];
        
        acc += element.getBoundingClientRect().height + gap;
      }
      container.style['maxHeight'] = `${acc - gap}px`;
    })
  }
}

const calculateMaxHeight = () => {
  const containerRect = container.getBoundingClientRect();
  const mid = (containerRect.top + containerRect.bottom) / 2;

  let h = 0;
  let minDistance = 100_000;

  for (const el of container.children) {
    const rect = el.getBoundingClientRect();

    const dist = Math.abs(mid - ((rect.bottom + rect.top) / 2));
    console.log(dist, rect.height);
    if (dist <= minDistance) {
      minDistance = dist;
      h = rect.height;
    }
  }

  container.style.maxHeight = `${h}px`; 
  if (h < 160) {
    upperContainer.style.padding = `${(160-h) / 2 + 10}px 20px`
  } else {
    upperContainer.style.padding = `10px 20px`
  }
};

container.addEventListener('scroll', calculateMaxHeight);
changeLogs.addEventListener('click', show)

closeModal.addEventListener('click', () => {
  modal.style['display'] = 'none';
  container.style.maxHeight = '40px';
  showAmount = 1;
})


const lastVievedLog = localStorage.getItem('lastLog');
if (!lastVievedLog) {
  localStorage.setItem('lastLog', CHANGE_LOGS[0].name);
  showAmount = CHANGE_LOGS.length;
  show();
} else if (lastVievedLog != CHANGE_LOGS[0].name) {
  const index = CHANGE_LOGS.findIndex((v) => v.name == lastVievedLog);
  if (index === -1) {
    showAmount = CHANGE_LOGS.length;
  } else {
    showAmount = index;
  }

  showAmount = Math.min(showAmount, 3);

  localStorage.setItem('lastLog', CHANGE_LOGS[0].name);
  show();
}