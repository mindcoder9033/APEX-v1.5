/* ==========================================
   APEX Simracing Coach - Storage & State Engine
   LocalStorage + IndexedDB Fallback & Backup
   ========================================== */

const STORAGE_KEY = 'apex_simracing_app_state_v1.5';
const DB_NAME = 'APEX_Simracing_DB';
const DB_STORE_NAME = 'app_state';

// Initial Default AppState Structure
const DEFAULT_APP_STATE = {
  version: '1.5.0',
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  progress: {
    currentModuleId: 1,
    currentSessionId: 'session_1_1',
    completedSessions: [], // Array of session IDs e.g. ["session_1_1"]
    completedModules: []
  },
  sessionData: {
    /* Format:
       "session_1_1": {
          completedAt: "ISO String",
          assessmentScores: { q1: 0, q2: 1, q3: 0 },
          assessmentPassed: true,
          psychRatings: { p1: 4, p2: 5, p3: 4 },
          reflections: ["Answer 1", "Answer 2", "Answer 3"],
          feedbackRating: 5
       }
    */
  },
  settings: {
    theme: 'dark',
    soundEffects: true,
    haptics: true,
    autoSave: true,
    telemetryUnits: 'metric'
  }
};

class StorageEngine {
  constructor() {
    this.state = null;
    this.saveDebounceTimer = null;
    this.indexedDB = null;
    this.listeners = [];
  }

  /**
   * Initialize Storage System - Loads state from LocalStorage or IndexedDB
   */
  async init() {
    try {
      // 1. Try LocalStorage
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        this.state = JSON.parse(localData);
        // Ensure structure schema completeness
        this.normalizeState();
        return this.state;
      }
    } catch (e) {
      console.warn('[APEX Storage] LocalStorage read error, attempting IndexedDB fallback:', e);
    }

    // 2. Try IndexedDB Fallback
    try {
      const dbData = await this.readIndexedDB();
      if (dbData) {
        this.state = dbData;
        this.normalizeState();
        return this.state;
      }
    } catch (e) {
      console.warn('[APEX Storage] IndexedDB read error:', e);
    }

    // 3. Fallback to default initial state
    this.state = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
    this.saveStateImmediately();
    return this.state;
  }

  /**
   * Ensures all expected state properties exist
   */
  normalizeState() {
    if (!this.state) this.state = {};
    if (!this.state.progress) this.state.progress = DEFAULT_APP_STATE.progress;
    if (!this.state.sessionData) this.state.sessionData = {};
    if (!this.state.settings) this.state.settings = DEFAULT_APP_STATE.settings;
  }

  /**
   * Return current AppState
   */
  getState() {
    return this.state || DEFAULT_APP_STATE;
  }

  /**
   * Update State with partial or full object & trigger debounced save
   */
  updateState(updaterFn) {
    if (typeof updaterFn === 'function') {
      updaterFn(this.state);
    } else if (typeof updaterFn === 'object') {
      this.state = { ...this.state, ...updaterFn };
    }

    this.state.lastUpdated = new Date().toISOString();
    this.debouncedSave();
    this.notifyListeners();
  }

  /**
   * Debounced save to prevent excessive disk/storage IO
   */
  debouncedSave() {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this.saveDebounceTimer = setTimeout(() => {
      this.saveStateImmediately();
    }, 300);
  }

  /**
   * Save State to LocalStorage & IndexedDB immediately
   */
  saveStateImmediately() {
    if (!this.state) return;
    const serialized = JSON.stringify(this.state);

    // Save to LocalStorage
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.warn('[APEX Storage] LocalStorage quota exceeded, saving to IndexedDB only:', e);
    }

    // Save to IndexedDB
    this.writeIndexedDB(this.state).catch(err => {
      console.error('[APEX Storage] IndexedDB write failed:', err);
    });
  }

  /**
   * IndexedDB Helper Methods
   */
  openIndexedDB() {
    return new Promise((resolve, reject) => {
      if (this.indexedDB) return resolve(this.indexedDB);

      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (evt) => {
        const db = evt.target.result;
        if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
          db.createObjectStore(DB_STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (evt) => {
        this.indexedDB = evt.target.result;
        resolve(this.indexedDB);
      };

      request.onerror = (evt) => reject(evt.target.error);
    });
  }

  async readIndexedDB() {
    const db = await this.openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE_NAME, 'readonly');
      const store = tx.objectStore(DB_STORE_NAME);
      const req = store.get('current_state');
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => reject(req.error);
    });
  }

  async writeIndexedDB(data) {
    const db = await this.openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(DB_STORE_NAME);
      const req = store.put({ id: 'current_state', data: data, updatedAt: new Date().toISOString() });
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Export App Data as JSON File Download
   */
  exportJSON() {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `apex_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch (e) {
      console.error('[APEX Storage] Export failed:', e);
      return false;
    }
  }

  /**
   * Import App Data from JSON File
   */
  importJSON(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('No file selected'));

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          
          // Basic Schema Validation
          if (!parsed.progress || !parsed.sessionData) {
            return reject(new Error('Invalid APEX backup JSON format'));
          }

          this.state = parsed;
          this.normalizeState();
          this.saveStateImmediately();
          this.notifyListeners();
          resolve(this.state);
        } catch (err) {
          reject(new Error('Failed to parse JSON file: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Error reading backup file'));
      reader.readAsText(file);
    });
  }

  /**
   * Reset App State to Factory Defaults
   */
  resetState() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
    this.saveStateImmediately();
    this.notifyListeners();
    return this.state;
  }

  /**
   * State change subscription listener mechanism
   */
  subscribe(listenerFn) {
    if (typeof listenerFn === 'function') {
      this.listeners.push(listenerFn);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listenerFn);
    };
  }

  notifyListeners() {
    this.listeners.forEach(fn => {
      try { fn(this.state); } catch (e) { console.error('[APEX Storage] Listener error:', e); }
    });
  }
}

export const storage = new StorageEngine();
