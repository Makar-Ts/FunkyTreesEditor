import { createFilledTab } from "../../tabs/main.js";
import { fromXMLtoCraftInfo } from "../../parser/xml-to-specs.js";
import { fromXMLtoVariablesText } from "../../parser/xml-to-vars-text.js";

const importXml = document.getElementById('import_xml');
const modal = document.getElementById('import_modal');
const closeModal = document.getElementById('close_import_modal');
const container = document.getElementById('import_modal_container');


const label = document.querySelector('label[for="imported_file"]')
const input = document.getElementById('imported_file');
const format = document.getElementById('format_import');

const errors = document.getElementById('import_errors');
function showError(error) {
  errors.innerText = error;
}

const stats = document.getElementById('imported_craft_specs');

const importButton = document.getElementById('import_craft');
importButton.setAttribute('disabled', true);


let planeXML, planeStats;
input.addEventListener('change', async () => {
  showError('');
  planeXML = undefined;
  planeStats = undefined;
  importButton.setAttribute('disabled', true);

  const file = input.files?.[0]

  if (!file) return;

  label.innerText = 'File: '+file.name;
  const isXml =
    file.type === 'text/xml' ||
    file.type === 'application/xml' ||
    file.name.endsWith('.xml')

  if (!isXml) {
    showError('File is not XML');
    return;
  }

  try {
    const text = await file.text()

    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'application/xml')

    const error = xml.querySelector('parsererror')

    if (error) {
      showError('XML parcing error: '+error.textContent)
      return
    }

    planeXML = xml;

    try {
      planeStats = fromXMLtoCraftInfo(xml);
    } catch (e) {
      showError(e.message);
      planeXML = undefined;
      planeStats = undefined;

      return;
    }


    const trimPoint = (v) => Math.round(v * 100) / 100

    console.log(planeStats)
    stats.innerHTML = `
<h2>${planeStats.name}</h2>
<div class="tags">${planeStats.tags.map(v => `<span>${v}</span>`)}</div>
<p class="size">size: ${trimPoint(planeStats.size.x)}m / ${trimPoint(planeStats.size.y)}m / ${trimPoint(planeStats.size.z)}m</p>
<p class="parts">parts: ${planeStats.parts}</p>
<p class="variables">variables: ${planeStats.variables}</p>
    `
    importButton.removeAttribute('disabled');
  } catch (err) {
    showError('XML parcing error: '+err)
  }
});


importButton.addEventListener('click', () => {
  if (!planeXML || !planeStats) {
    importButton.setAttribute('disabled', true);
    return;
  }

  createFilledTab(planeStats.name, fromXMLtoVariablesText(planeXML, format.checked));

  modal.style['display'] = 'none';
  input.value = "";
  label.innerText = 'Click to choose the file';
  stats.innerHTML = '';
})



importXml.addEventListener('click', () => {
  modal.style['display'] = 'block';
});

closeModal.addEventListener('click', () => {
  modal.style['display'] = 'none';
});


const importTabsButton = document.getElementById('new_tab_selector_import');
importTabsButton.addEventListener('click', () => {
  modal.style['display'] = 'block';
});