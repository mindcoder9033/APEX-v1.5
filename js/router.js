/* ==========================================
   APEX Simracing Coach - Lightweight Hash Router
   Single Page Application Navigation Engine
   ========================================== */

class HashRouter {
  constructor() {
    this.routes = [];
    this.currentPath = '';
    this.defaultPath = '/dashboard';
    
    // Bind hashchange listener
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  /**
   * Register a route mapping path pattern to view handler
   * Example: router.register('/session/:modId/:sessId', renderSessionView)
   */
  register(pattern, viewId, renderHandler) {
    // Convert pattern like '/session/:modId/:sessId' to regex
    const paramNames = [];
    const regexPath = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
      paramNames.push(key);
      return '([a-zA-Z0-9_]+)';
    });

    const regex = new RegExp(`^${regexPath}$`);

    this.routes.push({
      pattern,
      regex,
      paramNames,
      viewId,
      renderHandler
    });
  }

  /**
   * Initialize router & parse current URL hash
   */
  init() {
    this.handleHashChange();
  }

  /**
   * Navigate programmatically to a new path
   */
  navigate(path) {
    window.location.hash = `#${path}`;
  }

  /**
   * Handle hash change event
   */
  handleHashChange() {
    let hash = window.location.hash.slice(1); // remove '#'
    if (!hash || hash === '/') {
      hash = this.defaultPath;
      window.location.hash = `#${this.defaultPath}`;
      return;
    }

    this.currentPath = hash;
    let matched = false;

    for (const route of this.routes) {
      const match = hash.match(route.regex);
      if (match) {
        matched = true;
        
        // Extract params
        const params = {};
        route.paramNames.forEach((name, idx) => {
          params[name] = match[idx + 1];
        });

        // 1. Activate DOM View
        this.activateView(route.viewId);

        // 2. Update Bottom Nav active state
        this.updateNavState(route.viewId, hash);

        // 3. Call view render handler
        if (typeof route.renderHandler === 'function') {
          try {
            route.renderHandler(params);
          } catch (err) {
            console.error(`[APEX Router] Error rendering view ${route.viewId}:`, err);
          }
        }
        break;
      }
    }

    if (!matched) {
      console.warn(`[APEX Router] Unmatched hash route: ${hash}, redirecting to default`);
      this.navigate(this.defaultPath);
    }
  }

  /**
   * Switch active .view section in DOM
   */
  activateView(viewId) {
    const views = document.querySelectorAll('.view');
    views.forEach(v => {
      if (v.id === viewId) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    });

    // Reset scroll position on view switch
    const mainContent = document.querySelector('.app-content');
    if (mainContent) mainContent.scrollTop = 0;
  }

  /**
   * Sync active tab in bottom navigation bar
   */
  updateNavState(viewId, hash) {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
      const targetView = item.getAttribute('data-view');
      // If we are in session wizard view or module detail view, highlight curriculum tab
      if ((viewId === 'view-session' || viewId === 'view-module') && targetView === 'curriculum') {
        item.classList.add('active');
      } else if (`view-${targetView}` === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
}

export const router = new HashRouter();
