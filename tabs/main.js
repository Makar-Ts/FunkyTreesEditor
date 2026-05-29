import { editor } from './../editor/main.js';
import {
  compressString,
  decompressUint8Array,
  uint8ArrayToBase64,
  base64ToUint8Array
} from './compress.js';

import * as monaco from '../libs/monaco-editor/main.js';
import { DEFAULT_PAGE, ON_TABS_CHANGED_EVENT } from './constant.js';

import './shared/main.js';

let tabs = [];
let activeTabId = null;

const tabsContainer = document.getElementById('tabs_container');
const addTabBtn = document.getElementById('add_tab');

function createModel(value = '') {
  return monaco.editor.createModel(value, 'funky');
}

function createTabObject({
  id,
  name,
  value = '',
  model = null
}) {
  return {
    id,
    name,
    model: model ?? createModel(value)
  };
}

// default tab
tabs = [
  createTabObject({
    id: 'main',
    name: 'main',
    value: DEFAULT_PAGE
  })
];

activeTabId = 'main';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

function getTabById(id) {
  return tabs.find(t => t.id === id);
}

function serializeTabs() {
  return {
    activeTabId,
    tabs: tabs.map(tab => ({
      id: tab.id,
      name: tab.name,
      value: tab.model.getValue()
    }))
  };
}

const SAVE_TO_URL = false;
async function save() {
  try {
    const state = serializeTabs();

    const json = JSON.stringify(state);
    const compressed = await compressString(json);
    const base64 = uint8ArrayToBase64(compressed);

    if (SAVE_TO_URL) {
      const url = new URL(window.location);
      url.searchParams.set('tabs', encodeURIComponent(base64));

      history.replaceState(null, '', url);
    } else {
      localStorage.setItem('tabs', base64);
    }
  } catch (e) {
    console.error('Failed to save tabs to URL', e);
  }
}

export async function exportCurrentTab() {
  const tab = tabs.find(v => v.id === activeTabId);
  if (!tab) console.error('Failed to export tab');

  const data = {
    activeTabId,
    tabs: [{
      id: tab.id,
      name: tab.name,
      value: tab.model.getValue()
    }]
  }

  const json = JSON.stringify(data);
  const compressed = await compressString(json);
  const base64 = uint8ArrayToBase64(compressed);

  return base64;
}


export async function decodeToJson(b64) {
  const base64 = decodeURIComponent(b64);
  const compressed = base64ToUint8Array(base64);

  const decompressed = await decompressUint8Array(compressed);

  const decoder = new TextDecoder();
  const json = decoder.decode(decompressed);

  return JSON.parse(json);
}

export function loadState(state, prefix="", r=false) {
  if (
    state.tabs &&
    Array.isArray(state.tabs) &&
    state.tabs.length > 0
  ) {
    tabs.push(...state.tabs.map(tab =>
      createTabObject({
        id: prefix+tab.id,
        name: tab.name,
        value: tab.value
      })
    ));

    activeTabId = state.activeTabId ? prefix+state.activeTabId : tabs[0].id;

    if (!tabs.some(t => t.id === activeTabId)) {
      activeTabId = tabs[0].id;
    }

    r && reload();

    return true;
  }
}

async function load() {
  const url = new URL(globalThis.location);
  const encoded = url.searchParams.get('tabs');
  const local = localStorage.getItem('tabs');

  if (!encoded && !local) return;

  // dispose old models
  tabs.forEach(tab => tab.model?.dispose());
  tabs.length = 0;

  if (local) {
    loadState(await decodeToJson(local));
  }

  if (encoded) {
    try {
      loadState(await decodeToJson(encoded), 'url_');

      const url = new URL(window.location);
      url.searchParams.delete('tabs');
      history.replaceState(null, '', url);

      await save();
    } catch (e) {
      console.error('Failed to load tabs from URL', e);
    }
  }
}

let saveTimeout;

editor.onDidChangeModelContent(() => {
  clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    save();
  }, 500);
});

function triggerTabChangeEvent() {
  window.dispatchEvent(new Event(ON_TABS_CHANGED_EVENT));
}


function switchTab(id) {
  if (activeTabId === id) return;

  activeTabId = id;

  const next = getTabById(id);

  if (next) {
    editor.setModel(next.model);
  }

  renderTabs();
  save();
  triggerTabChangeEvent();
}

function createTab() {
  const id = generateId();

  const newTab = createTabObject({
    id,
    name: `tab${tabs.length + 1}`,
    value: ''
  });

  tabs.push(newTab);

  switchTab(id);
}

export function createFilledTab(name, value) {
  const id = generateId();

  const newTab = createTabObject({
    id,
    name,
    value
  });

  tabs.push(newTab);

  switchTab(id);
}


function deleteTab(id) {
  if (tabs.length <= 1) return;

  const index = tabs.findIndex(t => t.id === id);

  if (index === -1) return;

  const tab = tabs[index];

  tab.model.dispose();

  tabs.splice(index, 1);

  if (activeTabId === id) {
    const newActiveIndex = Math.min(index, tabs.length - 1);

    activeTabId = tabs[newActiveIndex].id;

    editor.setModel(tabs[newActiveIndex].model);
  }

  renderTabs();
  save();
  triggerTabChangeEvent();
}

function renameTab(id, newName) {
  const tab = getTabById(id);

  if (!tab || !newName.trim()) return;

  tab.name = newName.trim();

  renderTabs();
  save();
}

function renderTabs() {
  tabsContainer.innerHTML = '';

  tabs.forEach(tab => {
    const tabEl = document.createElement('div');

    tabEl.className =
      'tab' + (tab.id === activeTabId ? ' active' : '');

    tabEl.dataset.tabId = tab.id;

    const nameSpan = document.createElement('span');

    nameSpan.className = 'tab-name';
    nameSpan.textContent = tab.name;

    nameSpan.addEventListener('click', e => {
      e.stopPropagation();
      switchTab(tab.id);
    });

    nameSpan.addEventListener('dblclick', e => {
      e.stopPropagation();

      const input = document.createElement('input');

      input.type = 'text';
      input.className = 'tab-name-input';
      input.value = tab.name;

      input.addEventListener('blur', () => {
        renameTab(tab.id, input.value);
      });

      input.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') {
          renameTab(tab.id, input.value);
        } else if (ev.key === 'Escape') {
          renderTabs();
        }
      });

      nameSpan.replaceWith(input);

      input.focus();
      input.select();
    });

    const closeBtn = document.createElement('button');

    closeBtn.className = 'tab-close';
    closeBtn.textContent = '×';
    closeBtn.title = 'Close tab';

    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      deleteTab(tab.id);
    });

    tabEl.appendChild(nameSpan);

    if (tabs.length > 1) {
      tabEl.appendChild(closeBtn);
    }

    tabsContainer.appendChild(tabEl);
  });
}

addTabBtn.addEventListener('click', createTab);


function reload() {
  renderTabs();

  const initialTab = getTabById(activeTabId);

  if (initialTab) {
    editor.setModel(initialTab.model);
  }

  triggerTabChangeEvent();
}

(async () => {
  await load();

  reload();
})();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    save();
  }
});



const newTabSelector = document.getElementById('new_tab_selector');

const addButton = document.getElementById('new_tab_selector_add');
const defaultButton = document.getElementById('new_tab_selector_default');

function updateSelectorPosition() {
  newTabSelector.style.setProperty('--move', `0px`);

  const rect = newTabSelector.getBoundingClientRect();

  let offsetX = 0;
  const padding = 8;

  if (rect.left < 0) {
    offsetX = Math.abs(rect.left) + padding;
  }

  if (rect.right > window.innerWidth) {
    offsetX = -(rect.right - window.innerWidth + padding);
  }

  newTabSelector.style.setProperty('--move', `${offsetX}px`);
}

document.getElementById('add_tab_button_container').addEventListener('mouseenter', () => {
  requestAnimationFrame(updateSelectorPosition);
});


addButton.addEventListener('click', createTab);
defaultButton.addEventListener('click', () => createFilledTab('default', DEFAULT_PAGE));


