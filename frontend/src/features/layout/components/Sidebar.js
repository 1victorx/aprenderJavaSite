// Sidebar Component
export const Sidebar = {
  render() {
    const navItems = [
      { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { href: '/exercises', icon: 'book', label: 'Exercícios' },
      { href: '/achievements', icon: 'award', label: 'Conquistas' },
      { href: '/history', icon: 'clock', label: 'Histórico' }
    ];

    const currentPath = window.router?.getCurrentRoute()?.path || '/';

    return `
      <nav class="sidebar-nav" aria-label="Navegação principal">
        ${navItems.map(item => `
          <a href="${item.href}" data-link class="nav-item ${currentPath === item.href ? 'active' : ''}" 
             aria-current="${currentPath === item.href ? 'page' : 'false'}">
            ${this.getIcon(item.icon)}
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>
    `;
  },

  bindEvents() {
    // Close sidebar on mobile when clicking a link
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.querySelectorAll('a[data-link]').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth < 768) {
            sidebar.classList.remove('open');
            const mobileBtn = document.getElementById('mobile-menu-btn');
            if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  },

  getIcon(name) {
    const icons = {
      dashboard: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
      book: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
      award: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
      clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
    };
    return icons[name] || '';
  }
};