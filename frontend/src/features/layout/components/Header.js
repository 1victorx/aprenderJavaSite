// Header Component
import { ApiStatus } from '../../../shared/components/ApiStatus.js';
export const Header = {
  render() {
    const user = window.authStore?.currentUser;
    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    
    return `
      <div class="header-left">
        <button class="mobile-menu-btn" aria-label="Abrir menu" id="mobile-menu-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <a href="/" data-link class="app-brand" aria-label="JavaStudy - Início">
          <span class="brand-mark" aria-hidden="true">{ }</span>
          <span>JavaStudy</span>
        </a>
      </div>
      <div class="header-right" style="display: flex; align-items: center; gap: var(--space-4);">
        ${ApiStatus.render(true)}
        <button class="theme-toggle" id="theme-toggle" aria-label="Alternar tema">
          <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="display: none;">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
        ${user ? `
          <div class="header-user">
            <div class="user-menu" id="user-menu">
              <button class="user-menu-btn" aria-expanded="false" aria-haspopup="true" id="user-menu-btn">
                <span class="avatar">${initials}</span>
                <span style="display: none;" class="user-name">${this.escapeHtml(user.name)}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="user-menu-dropdown" role="menu" id="user-menu-dropdown">
                <div style="padding: var(--space-3); border-bottom: 1px solid var(--color-border);">
                  <div style="font-weight: var(--font-weight-semibold);">${this.escapeHtml(user.name)}</div>
                  <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">${this.escapeHtml(user.email)}</div>
                </div>
                <button class="user-menu-item" data-link href="/dashboard" role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Dashboard
                </button>
                <button class="user-menu-item" data-link href="/exercises" role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Exercícios
                </button>
                <button class="user-menu-item" data-link href="/achievements" role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                  Conquistas
                </button>
                <button class="user-menu-item" data-link href="/history" role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Histórico
                </button>
                <div class="user-menu-divider"></div>
                <button class="user-menu-item" id="logout-btn" role="menuitem" style="color: var(--color-error);">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sair
                </button>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  bindEvents() {
    // Theme toggle
    ApiStatus.bind();
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => window.theme?.toggle());
      this.updateThemeIcon();
    }

    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        mobileMenuBtn.setAttribute('aria-expanded', sidebar.classList.contains('open'));
      });
    }

    // User menu
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userMenu = document.getElementById('user-menu');
    const userMenuDropdown = document.getElementById('user-menu-dropdown');
    
    if (userMenuBtn && userMenu) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('open');
        userMenuBtn.setAttribute('aria-expanded', userMenu.classList.contains('open'));
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
          userMenu.classList.remove('open');
          userMenuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.authStore?.logout();
        window.router?.navigate('/login');
      });
    }

    // Listen for theme changes
    const observer = new MutationObserver(() => this.updateThemeIcon());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  },

  updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDark ? 'block' : 'none';
      moonIcon.style.display = isDark ? 'none' : 'block';
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
