(function registerStorageModule(global) {
  function createStorage(storage, keys) {
    function read(key, fallback) {
      const raw = storage.getItem(key);
      if (!raw) return structuredClone(fallback);
      try {
        return JSON.parse(raw);
      } catch {
        return structuredClone(fallback);
      }
    }

    function write(key, value) {
      storage.setItem(key, JSON.stringify(value));
      return value;
    }

    return Object.freeze({
      loadState: (fallback) => read(keys.state, fallback),
      saveState: (value) => write(keys.state, value),
      loadAccounts: (fallback) => read(keys.accounts, fallback),
      saveAccounts: (value) => write(keys.accounts, value),
      loadSession: () => read(keys.session, null),
      saveSession: (value) => write(keys.session, value),
      clearSession: () => storage.removeItem(keys.session),
      loadDeletionQueue: () => {
        const value = read(keys.deletionQueue, []);
        return Array.isArray(value) ? value : [];
      },
      saveDeletionQueue: (value) => write(keys.deletionQueue, value),
      clearDeletionQueue: () => storage.removeItem(keys.deletionQueue),
    });
  }

  global.TODO_PLUS_STORAGE = Object.freeze({ createStorage });
})(window);
