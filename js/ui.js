/* ==========================================
   APEX Simracing Coach - UI Helper & Drawer System
   Toast notifications, Settings Drawer, Modals
   ========================================== */

import { storage } from './storage.js';

class UIManager {
  constructor() {
    this.toastTimer = null;
  }

  /**
   * Initialize UI Event Listeners
   */
  init() {
    this.setupDrawerListeners();
    this.setupDataBackupListeners();
  }

  /**
   * Setup Slide-out Settings Drawer
   */
  setupDrawerListeners() {
    const settingsBtn = document.getElementById('settings-toggle-btn');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    const drawer = document.getElementById('settings-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openDrawer());
    }

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', () => this.closeDrawer());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeDrawer());
    }
  }

  openDrawer() {
    const drawer = document.getElementById('settings-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
  }

  closeDrawer() {
    const drawer = document.getElementById('settings-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
  }

  /**
   * Setup Export, Import, Reset Data listeners in Settings
   */
  setupDataBackupListeners() {
    const exportBtn = document.getElementById('export-json-btn');
    const importInput = document.getElementById('import-json-input');
    const resetBtn = document.getElementById('reset-progress-btn');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const success = storage.exportJSON();
        if (success) {
          this.showToast('Backup JSON exported successfully!', 'success');
        } else {
          this.showToast('Export failed', 'error');
        }
      });
    }

    if (importInput) {
      importInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          await storage.importJSON(file);
          this.showToast('Data imported successfully! Reloading view...', 'success');
          this.closeDrawer();
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } catch (err) {
          this.showToast('Import Error: ' + err.message, 'error');
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all APEX progress? This action cannot be undone.')) {
          storage.resetState();
          this.showToast('Progress reset to factory defaults.', 'info');
          this.closeDrawer();
          setTimeout(() => {
            window.location.hash = '#/dashboard';
            window.location.reload();
          }, 500);
        }
      });
    }
  }

  /**
   * Display top alert toast notification banner
   * @param {string} message 
   * @param {string} type - 'success' | 'error' | 'info'
   * @param {number} duration - ms to auto-dismiss
   */
  showToast(message, type = 'info', duration = 3000) {
    const banner = document.getElementById('toast-banner');
    const msgEl = document.getElementById('toast-message');
    if (!banner || !msgEl) return;

    msgEl.textContent = message;

    // Reset types
    banner.classList.remove('toast-success', 'toast-error', 'toast-info');
    banner.classList.add(`toast-${type}`);
    banner.classList.add('active');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      banner.classList.remove('active');
    }, duration);
  }
}

export const ui = new UIManager();
