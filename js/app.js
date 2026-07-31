/* ==========================================
   APEX Simracing Coach - Main Application Entry
   ========================================== */

import { storage } from './storage.js';
import { router } from './router.js';
import { ui } from './ui.js';

import { renderDashboardView } from './views/dashboard.js';
import { renderCurriculumView } from './views/curriculum.js';
import { renderSessionView } from './views/session.js';
import { renderProgressView } from './views/progress.js';

class ApexApp {
  constructor() {
    this.curriculumData = null;
    this.settingsData = null;
  }

  async init() {
    console.log('[APEX] Initializing APEX Telemetry Coach v1.5...');

    try {
      // 1. Initialize Storage Engine
      await storage.init();

      // 2. Initialize UI Helper System
      ui.init();

      // 3. Fetch Curriculum & Settings static JSON data
      await this.loadData();

      // 4. Setup SPA Router and View Handlers
      this.setupRoutes();

      // 5. Setup Bottom Navigation Click Listeners
      this.setupNavListeners();

      // 6. Start Router
      router.init();

      console.log('[APEX] System initialized successfully.');
    } catch (err) {
      console.error('[APEX Initialization Error]:', err);
      ui.showToast('Error initializing app data: ' + err.message, 'error');
    }
  }

  async loadData() {
    const [currRes, setRes] = await Promise.all([
      fetch('./data/curriculum.json'),
      fetch('./data/settings.json')
    ]);

    if (!currRes.ok || !setRes.ok) {
      throw new Error('Failed to load local JSON content files');
    }

    this.curriculumData = await currRes.json();
    this.settingsData = await setRes.json();
  }

  setupRoutes() {
    router.register('/dashboard', 'view-dashboard', () => {
      renderDashboardView(this.curriculumData, this.settingsData);
    });

    router.register('/curriculum', 'view-curriculum', () => {
      renderCurriculumView(this.curriculumData);
    });

    router.register('/session/:modId/:sessId', 'view-session', (params) => {
      renderSessionView(this.curriculumData, params.modId, params.sessId);
    });

    router.register('/progress', 'view-progress', () => {
      renderProgressView(this.curriculumData);
    });
  }

  setupNavListeners() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        if (view) {
          router.navigate(`/${view}`);
        }
      });
    });
  }
}

const app = new ApexApp();
document.addEventListener('DOMContentLoaded', () => app.init());
