import { Router } from './router.js';
import { AuthStore } from '../features/auth/services/authStore.js';
import { ApiClient } from '../shared/utils/apiClient.js';
import { Toast } from '../shared/components/Toast.js';
import { Header } from '../features/layout/components/Header.js';
import { Sidebar } from '../features/layout/components/Sidebar.js';
import { Theme } from '../shared/utils/theme.js';
import { setupRoutes } from './routes.js';

// Initialize core services
const apiClient = new ApiClient();
const authStore = new AuthStore();
const toast = new Toast();
const theme = new Theme();

// Make globally accessible
window.apiClient = apiClient;
window.authStore = authStore;
window.toast = toast;
window.theme = theme;

// Initialize theme
theme.init();

// Initialize router with routes
const router = new Router();
setupRoutes(router);

// App container
const app = document.getElementById('app');
if (!app) {
  console.error('FATAL: #app container not found in DOM');
}

// Get current path from hash or pathname
function getCurrentPath() {
  const hash = window.location.hash;
  if (hash.startsWith('#')) {
    return hash.slice(1) || '/';
  }
  return window.location.pathname + window.location.search || '/';
}

// Render layout based on current route
function renderLayout() {
  if (!app || !router.currentRoute) {
    console.warn('renderLayout: no app or currentRoute', { app, currentRoute: router.currentRoute });
    return;
  }

  const isAuthPage = router.currentRoute.meta?.public === true;
  
  if (isAuthPage) {
    // Auth pages: simple layout, no sidebar
    app.innerHTML = `<main id="main">${router.currentRoute.component()}</main>`;
  } else {
    // Protected pages: full layout with sidebar
    app.innerHTML = `
      <div class="app-layout">
        <header class="app-header" role="banner">
          ${Header.render()}
        </header>
        <aside class="app-sidebar" role="navigation" aria-label="Navegação principal" id="sidebar">
          ${Sidebar.render()}
        </aside>
        <main class="app-main" id="main" role="main">
          ${router.currentRoute.component ? router.currentRoute.component() : ''}
        </main>
      </div>
      <div class="toast-container" id="toast-container" aria-live="polite" aria-label="Notificações"></div>
    `;
    
    Header.bindEvents();
    Sidebar.bindEvents();
  }

  // Call afterRender for the matched page
  const routePath = router.currentRoute.path;
  const pageMap = window.__pageMap;
  if (pageMap && pageMap[routePath]?.afterRender) {
    setTimeout(() => {
      try {
        pageMap[routePath].afterRender();
      } catch (e) {
        console.error('afterRender error for', routePath, e);
      }
    }, 0);
  }
}

// Navigation: resolve route + re-render
function handleNavigation(path) {
  router.resolve(path);
  renderLayout();
}

// Auth state listener - re-render on auth change
authStore.subscribe(() => {
  renderLayout();
});

// Handle hash changes (main navigation mechanism)
window.addEventListener('hashchange', () => {
  handleNavigation(getCurrentPath());
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
  handleNavigation(getCurrentPath());
});

// Global click handler for navigation links [data-link]
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-link]');
  if (link) {
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href) {
      router.navigate(href);
    }
  }
});

// Initial route resolve + render
handleNavigation(getCurrentPath());

// Export for debugging
window.router = router;
window.app = { apiClient, authStore, toast, theme, router };
