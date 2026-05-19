import { editor } from './../editor/main.js'
import { compressString, decompressUint8Array, uint8ArrayToBase64, base64ToUint8Array } from './compress.js'

let tabs = [
  {
    id: 'main',
    name: 'main',
    value: `|> SmoothFlaps\n\t; 0\n\t; Activate2 \n|= Activate1 \n\t? -Pitch \n\t: -Pitch * clamp01((1 - (IAS * 3.6 - 1200) / 600))\n\n|> Field2 |= SmoothFlaps > 0.9 ? 1 : 0`
  }
];

let activeTabId = 'main';

const tabsContainer = document.getElementById('tabs_container');
const addTabBtn = document.getElementById('add_tab');



async function saveToUrl() {
  const current = getTabById(activeTabId);
  if (current) {
    current.value = editor.getValue();
  }
  const state = { tabs, activeTabId };
  try {
    const json = JSON.stringify(state);
    const compressed = await compressString(json);
    const base64 = uint8ArrayToBase64(compressed);
    const url = new URL(window.location);
    url.searchParams.set('tabs', encodeURIComponent(base64));
    history.replaceState(null, '', url);
  } catch (e) {
    console.error('Failed to save tabs to URL', e);
  }
}

async function loadFromUrl() {
  const url = new URL(window.location);
  const encoded = url.searchParams.get('tabs');
  if (!encoded) return;
  try {
    const base64 = decodeURIComponent(encoded);
    const compressed = base64ToUint8Array(base64);
    const decompressed = await decompressUint8Array(compressed);
    const decoder = new TextDecoder();
    const json = decoder.decode(decompressed);
    const state = JSON.parse(json);
    if (state.tabs && Array.isArray(state.tabs) && state.tabs.length > 0) {
      tabs = state.tabs;
      activeTabId = state.activeTabId || tabs[0].id;
      if (!tabs.some(t => t.id === activeTabId)) {
        activeTabId = tabs[0].id;
      }
    }
  } catch (e) {
    console.error('Failed to load tabs from URL', e);
  }
}



let saveTimeout;
editor.getModel().onDidChangeContent(() => {
  const current = tabs.find(t => t.id === activeTabId);
  if (current) {
    current.value = editor.getValue();
  }
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveToUrl(), 500);
});



function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

function getTabById(id) {
  return tabs.find(t => t.id === id);
}

function switchTab(id) {
  if (activeTabId === id) return;

  const current = getTabById(activeTabId);
  if (current) {
    current.value = editor.getValue();
  }

  activeTabId = id;

  const next = getTabById(id);
  if (next) {
    editor.setValue(next.value);
  }

  renderTabs();
  saveToUrl();
}

function createTab() {
  const id = generateId();
  const name = `tab${tabs.length + 1}`;
  const newTab = {
    id,
    name,
    value: ''
  };

  tabs.push(newTab);
  switchTab(id);
}

export function createFilledTab(name, value) {
  const id = generateId();
  const newTab = {
    id,
    name,
    value
  };

  tabs.push(newTab);
  switchTab(id);
}


function deleteTab(id) {
  if (tabs.length <= 1) return;

  const index = tabs.findIndex(t => t.id === id);
  if (index === -1) return;

  tabs.splice(index, 1);

  if (activeTabId === id) {
    const newActiveIndex = Math.min(index, tabs.length - 1);
    activeTabId = tabs[newActiveIndex].id;
    const activeTab = tabs[newActiveIndex];
    editor.setValue(activeTab.value);
  }

  renderTabs();
  saveToUrl();
}

function renameTab(id, newName) {
  const tab = getTabById(id);
  if (!tab || !newName.trim()) return;
  tab.name = newName.trim();
  renderTabs();
  saveToUrl();
}

function renderTabs() {
  tabsContainer.innerHTML = '';

  tabs.forEach(tab => {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
    tabEl.dataset.tabId = tab.id;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'tab-name';
    nameSpan.textContent = tab.name;
    nameSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      switchTab(tab.id);
    });
    nameSpan.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'tab-name-input';
      input.value = tab.name;
      input.addEventListener('blur', () => {
        renameTab(tab.id, input.value);
      });
      input.addEventListener('keydown', (ev) => {
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
    closeBtn.addEventListener('click', (e) => {
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


(async () => {
  await loadFromUrl();
  renderTabs();
  const initialTab = getTabById(activeTabId);
  if (initialTab) {
    editor.setValue(initialTab.value);
  }
})();