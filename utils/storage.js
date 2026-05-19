const STORAGE_KEY = 'quickslash_data';
const BLANK_STATE = {
  settings: {
    enabled: true,
    openConfigHotkey: "Alt+Q"
  },
  categories: []
};

const StorageManager = {
  /**
   * @returns {Promise<Object>}
   */
  async getAll() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY] || JSON.parse(JSON.stringify(BLANK_STATE)));
      });
    });
  },

  /**
   * @param {Object} data 
   * @returns {Promise<boolean>}
   */
  async saveAll(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
        resolve(true);
      });
    });
  },

  /**
   * @param {string} currentUrl 
   * @returns {Promise<Array>}
   */
  async getActiveSnippetsForUrl(currentUrl) {
    const data = await this.getAll();
    if (!data.settings?.enabled) return [];
    const activeSnippets = [];

    data.categories.forEach(category => {
      if (!category.enabled) return;

      const isUrlMatch = category.urlPatterns.some(pattern => {
        const regexStr = pattern
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexStr}$`, 'i');
        return regex.test(currentUrl);
      });

      if (isUrlMatch) {
        category.snippets.forEach(snippet => {
          if (snippet.enabled) activeSnippets.push(snippet);
        });
      }
    });

    return activeSnippets;
  },

  async clear() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(STORAGE_KEY, () => {
        resolve(true);
      });
    });
  }
};

if (typeof module !== 'undefined') module.exports = StorageManager;