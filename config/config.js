let appData = { settings: {}, categories: [] };
let selectedCategoryId = null;
let editingCategoryId = null;
let editingSnippetId = null;

const globalToggle = document.getElementById('global-enabled-toggle');
const categoryList = document.getElementById('category-list');
const btnAddCategory = document.getElementById('btn-add-category');
const activeCategoryView = document.getElementById('active-category-view');
const noCategorySelected = document.getElementById('no-category-selected');
const currentCategoryName = document.getElementById('current-category-name');
const currentCategoryUrls = document.getElementById('current-category-urls');
const snippetsContainer = document.getElementById('snippets-container');
const snippetSearch = document.getElementById('snippet-search');
const modalCategory = document.getElementById('modal-category');
const modalSnippet = document.getElementById('modal-snippet');

document.addEventListener('DOMContentLoaded', async () => {
  applyTranslations();
  await loadData();
  setupEventListeners();
  renderCategories();
});

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(key);
    if (message) el.textContent = message;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const message = chrome.i18n.getMessage(key);
    if (message) el.placeholder = message;
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const message = chrome.i18n.getMessage(key);
    if (message) el.title = message;
  });
}

async function loadData() {
  appData = await StorageManager.getAll();
  globalToggle.checked = appData.settings.enabled;
}

async function saveData() {
  await StorageManager.saveAll(appData);
}

function renderCategories() {
  categoryList.innerHTML = '';
  appData.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `category-item ${selectedCategoryId === cat.id ? 'active' : ''}`;
    btn.innerHTML = `<span>${cat.name}</span>`;
    btn.onclick = () => selectCategory(cat.id);
    categoryList.appendChild(btn);
  });
}

function selectCategory(id) {
  selectedCategoryId = id;
  renderCategories();
  renderActiveCategory();
}

function renderActiveCategory() {
  const category = appData.categories.find(c => c.id === selectedCategoryId);
  if (!category) {
    activeCategoryView.classList.add('hidden');
    noCategorySelected.classList.remove('hidden');
    return;
  }

  noCategorySelected.classList.add('hidden');
  activeCategoryView.classList.remove('hidden');
  
  currentCategoryName.textContent = category.name;
  
  currentCategoryUrls.innerHTML = '';
  category.urlPatterns.forEach(url => {
    const badge = document.createElement('span');
    badge.className = 'url-badge';
    badge.textContent = url;
    currentCategoryUrls.appendChild(badge);
  });

  renderSnippets();
}

function renderSnippets() {
  const category = appData.categories.find(c => c.id === selectedCategoryId);
  const searchTerm = snippetSearch.value.toLowerCase();
  
  snippetsContainer.innerHTML = '';
  
  const filtered = category.snippets.filter(s => 
    s.command.toLowerCase().includes(searchTerm) || 
    s.content.toLowerCase().includes(searchTerm)
  );

  filtered.forEach(snip => {
    const card = document.createElement('div');
    card.className = 'snippet-card';
    card.innerHTML = `
      <header>
        <span class="snippet-command">/${snip.command}</span>
        <div class="card-actions">
          <button class="btn-icon edit-snip" title="${chrome.i18n.getMessage('btn_edit_tooltip')}">✏️</button>
          <button class="btn-icon btn-danger delete-snip" title="${chrome.i18n.getMessage('btn_delete_tooltip')}">🗑️</button>
        </div>
      </header>
      <div class="snippet-content"></div>
    `;

    card.querySelector('.snippet-content').textContent = snip.content;
    card.querySelector('.edit-snip').onclick = () => openSnippetModal(snip);
    card.querySelector('.delete-snip').onclick = () => deleteSnippet(snip.id);

    snippetsContainer.appendChild(card);
  });
}

function openCategoryModal(cat = null) {
  editingCategoryId = cat ? cat.id : null;
  
  const titleKey = cat ? 'modal_cat_edit' : 'modal_cat_new';
  document.getElementById('modal-category-title').textContent = chrome.i18n.getMessage(titleKey);
  
  document.getElementById('input-cat-name').value = cat ? cat.name : '';
  document.getElementById('input-cat-urls').value = cat ? cat.urlPatterns.join('\n') : '*://*/*';
  modalCategory.classList.remove('hidden');
}

async function saveCategory() {
  const name = document.getElementById('input-cat-name').value.trim();
  const urlsRaw = document.getElementById('input-cat-urls').value;
  const urlPatterns = urlsRaw.split('\n').map(u => u.trim()).filter(u => u !== '');

  if (!name) return;

  if (editingCategoryId) {
    const cat = appData.categories.find(c => c.id === editingCategoryId);
    cat.name = name;
    cat.urlPatterns = urlPatterns;
  } else {
    const newCat = {
      id: 'cat_' + Date.now(),
      name,
      urlPatterns,
      enabled: true,
      snippets: []
    };
    appData.categories.push(newCat);
    selectedCategoryId = newCat.id;
  }

  await saveData();
  modalCategory.classList.add('hidden');
  renderCategories();
  renderActiveCategory();
}

async function deleteCategory() {
  const confirmMsg = chrome.i18n.getMessage('confirm_delete_category');
  if (!confirm(confirmMsg)) return;

  appData.categories = appData.categories.filter(c => c.id !== selectedCategoryId);
  selectedCategoryId = null;
  await saveData();
  renderCategories();
  renderActiveCategory();
}

function openSnippetModal(snip = null) {
  editingSnippetId = snip ? snip.id : null;
  
  const titleKey = snip ? 'modal_snip_edit' : 'modal_snip_new';
  document.getElementById('modal-snippet-title').textContent = chrome.i18n.getMessage(titleKey);
  
  document.getElementById('input-snip-command').value = snip ? snip.command : '';
  document.getElementById('input-snip-content').value = snip ? snip.content : '';
  modalSnippet.classList.remove('hidden');
}

async function saveSnippet() {
  const command = document.getElementById('input-snip-command').value.trim().replace(/^\//, '');
  const content = document.getElementById('input-snip-content').value;

  if (!command || !content) return;

  const category = appData.categories.find(c => c.id === selectedCategoryId);
  
  if (editingSnippetId) {
    const snip = category.snippets.find(s => s.id === editingSnippetId);
    snip.command = command;
    snip.content = content;
  } else {
    category.snippets.push({
      id: 'snip_' + Date.now(),
      command,
      content,
      enabled: true
    });
  }

  await saveData();
  modalSnippet.classList.add('hidden');
  renderSnippets();
}

async function deleteSnippet(id) {
  const category = appData.categories.find(c => c.id === selectedCategoryId);
  category.snippets = category.snippets.filter(s => s.id !== id);
  await saveData();
  renderSnippets();
}

function setupEventListeners() {
  globalToggle.onchange = async () => {
    appData.settings.enabled = globalToggle.checked;
    await saveData();
  };

  btnAddCategory.onclick = () => openCategoryModal();
  document.getElementById('btn-save-category').onclick = saveCategory;
  document.getElementById('btn-cancel-category').onclick = () => modalCategory.classList.add('hidden');
  document.getElementById('btn-edit-category').onclick = () => {
    const cat = appData.categories.find(c => c.id === selectedCategoryId);
    openCategoryModal(cat);
  };
  document.getElementById('btn-delete-category').onclick = deleteCategory;

  document.getElementById('btn-add-snippet').onclick = () => openSnippetModal();
  document.getElementById('btn-save-snippet').onclick = saveSnippet;
  document.getElementById('btn-cancel-snippet').onclick = () => modalSnippet.classList.add('hidden');
  snippetSearch.oninput = renderSnippets;

  document.getElementById('btn-export-json').onclick = exportBackup;
  document.getElementById('btn-import-json').onclick = () => document.getElementById('import-file-input').click();
  document.getElementById('import-file-input').onchange = importBackup;
}

function exportBackup() {
  const dataStr = JSON.stringify(appData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `quickslash-backup-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
}

function importBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (importedData.categories) {
        appData = importedData;
        await saveData();
        location.reload();
      }
    } catch (err) {
      alert(chrome.i18n.getMessage('error_import'));
    }
  };
  reader.readAsText(file);
}