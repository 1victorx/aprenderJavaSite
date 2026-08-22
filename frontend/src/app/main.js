import './styles/global.css';
import { Router } from './router.js';
import { AuthStore } from '../features/auth/services/authStore.js';
import { ApiClient } from '../shared/utils/apiClient.js';
import { Toast } from '../shared/components/Toast.js';
import { Header } from '../features/layout/components/Header.js';
import { Sidebar } from '../features/layout/components/Sidebar.js';
import { Theme } from '../shared/utils/theme.js';
import { setupRoutes } from './routes.js';
import { ErrorState } from '../shared/components/ErrorState.js';

// Initialize core services in dependency order so AuthStore can hydrate ApiClient.
const apiClient = new ApiClient();
window.apiClient = apiClient;

const authStore = new AuthStore();
const toast = new Toast();
const theme = new Theme();

window.authStore = authStore;
window.toast = toast;
window.theme = theme;

theme.init();

const router = new Router();
setupRoutes(router);

const app = document.getElementById('app');
if (!app) {
  throw new Error('FATAL: #app container not found in DOM');
}

function getCurrentPath() {
  const hash = window.location.hash;
  // The router owns hashes beginning with `#/`. Plain hashes are in-page
  // anchors such as the accessible skip link and must not become routes.
  if (hash.startsWith('#/')) {
    return hash.slice(1) || '/';
  }
  return window.location.pathname + window.location.search || '/';
}

let renderGeneration = 0;

function renderLayout() {
  const route = router.currentRoute;
  if (!route) {
    console.warn('renderLayout: no current route');
    return;
  }

  const generation = ++renderGeneration;
  const isAuthPage = route.meta?.public === true;

  if (isAuthPage) {
    app.innerHTML = `<main id="main">${route.component()}</main>`;
  } else {
    app.innerHTML = `
      <div class="app-layout">
        <header class="app-header" role="banner">
          ${Header.render()}
        </header>
        <aside class="app-sidebar" role="navigation" aria-label="Navegação principal" id="sidebar">
          ${Sidebar.render()}
        </aside>
        <main class="app-main" id="main" role="main">
          ${route.component ? route.component() : ''}
        </main>
      </div>
    `;

    Header.bindEvents();
    Sidebar.bindEvents();
  }

  const page = window.__pageMap?.[route.path];
  if (page?.afterRender) {
    setTimeout(async () => {
      // Do not let an old async page render into a newer route.
      if (generation !== renderGeneration || router.currentRoute !== route) return;
      try {
        await page.afterRender();
      } catch (error) {
        console.error(`afterRender failed for ${route.path}`, error);
        const main = document.getElementById('main');
        if (main && generation === renderGeneration) {
          main.innerHTML = ErrorState.render({
            title: 'Não foi possível carregar esta tela',
            message: 'A conexão pode ter sido interrompida. Tente novamente.'
          });
        }
      }
    }, 0);
  }
}

function handleNavigation(path) {
  router.resolve(path);
  renderLayout();
}

authStore.subscribe(() => {
  renderLayout();
});

window.addEventListener('hashchange', () => {
  handleNavigation(getCurrentPath());
});

window.addEventListener('popstate', () => {
  handleNavigation(getCurrentPath());
});

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-global-retry]')) {
    event.preventDefault();
    handleNavigation(getCurrentPath());
    return;
  }
  const link = event.target.closest('[data-link][href]');
  if (!link) return;

  event.preventDefault();
  const href = link.getAttribute('href');
  if (href) router.navigate(href);
});

async function bootstrap() {
  if (authStore.isAuthenticated) {
    try {
      await authStore.fetchMe();
    } catch {
      authStore.logout();
    }
  }
  handleNavigation(getCurrentPath());
}

window.router = router;
window.app = { apiClient, authStore, toast, theme, router };

bootstrap();
