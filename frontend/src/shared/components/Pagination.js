// Pagination Component
export const Pagination = {
  render(currentPage, totalPages) {
    const pages = this.getPageNumbers(currentPage, totalPages);
    
    return `
      ${pages.map(page => `
        ${page === '...' 
          ? '<span class="page-ellipsis" aria-hidden="true">…</span>'
          : `<button class="page-btn ${page === currentPage ? 'active' : ''}" 
                  data-page="${page}" 
                  aria-label="Página ${page + 1}" 
                  ${page === currentPage ? 'aria-current="page"' : ''}>
              ${page + 1}
            </button>`
        }
      `).join('')}
    `;
  },

  getPageNumbers(currentPage, totalPages) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages = [0];
    
    if (currentPage > 2) {
      pages.push('...');
    }

    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push('...');
    }

    pages.push(totalPages - 1);
    
    return pages;
  }
};