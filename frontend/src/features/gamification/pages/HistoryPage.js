// History Page
export const HistoryPage = {
  currentPage: 0,
  pageSize: 20,
  currentFilter: 'all',

  render() {
    return `
      <div class="history-page">
        <header style="margin-bottom: var(--space-6);">
          <h1>Histórico</h1>
          <p style="color: var(--color-text-secondary);">Suas tentativas e progresso</p>
        </header>

        <div style="margin-bottom: var(--space-6);">
          <select class="form-input" id="history-filter" style="width: auto; max-width: 300px;" aria-label="Filtrar por status">
            <option value="all">Todos</option>
            <option value="passed">Apenas resolvidos</option>
            <option value="failed">Apenas falharam</option>
          </select>
        </div>

        <div class="table-container" id="history-table">
          <div class="empty-state"><div class="empty-state-icon">⏳</div><p>Carregando histórico...</p></div>
        </div>

        <nav class="pagination" id="history-pagination" aria-label="Paginação do histórico" style="display: none;"></nav>
      </div>
    `;
  },

  async afterRender() {
    const filterEl = document.getElementById('history-filter');
    filterEl?.addEventListener('change', () => {
      this.currentFilter = filterEl.value;
      this.currentPage = 0;
      this.loadHistory();
    });

    await this.loadHistory();
  },

  async loadHistory() {
    const tableEl = document.getElementById('history-table');
    const paginationEl = document.getElementById('history-pagination');

    tableEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><p>Carregando...</p></div>';

    try {
      const params = new URLSearchParams({
        page: this.currentPage,
        size: this.pageSize
      });

      const data = await window.apiClient.get(`/api/gamification/history?${params}`);
      this.renderHistory(data.content, data.totalPages, data.totalElements);
    } catch (error) {
      tableEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <p>Erro ao carregar: ${error.message}</p>
          <button class="btn btn-primary" onclick="window.historyPage?.loadHistory()">Tentar novamente</button>
        </div>
      `;
      paginationEl.style.display = 'none';
    }
  },

  renderHistory(attempts, totalPages, totalElements) {
    const tableEl = document.getElementById('history-table');
    const paginationEl = document.getElementById('history-pagination');

    if (attempts.length === 0) {
      tableEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📜</div>
          <p>Seu histórico aparecerá aqui após resolver exercícios.</p>
        </div>
      `;
      paginationEl.style.display = 'none';
      return;
    }

    tableEl.innerHTML = `
      <table class="table" role="table">
        <thead>
          <tr>
            <th scope="col">Data/Hora</th>
            <th scope="col">Exercício</th>
            <th scope="col">Status</th>
            <th scope="col">XP</th>
          </tr>
        </thead>
        <tbody>
          ${attempts.map(a => `
            <tr>
              <td>${this.formatDate(a.createdAt)}</td>
              <td>
                <strong>${this.escapeHtml(a.exercise?.title || 'Exercício removido')}</strong>
                <br><small style="color: var(--color-text-muted);">${this.formatCategory(a.exercise?.category)}</small>
              </td>
              <td>
                <span class="badge badge-status ${a.passed ? 'passed' : 'failed'}" aria-label="${a.passed ? 'Passou' : 'Falhou'}">
                  ${a.passed ? '✓' : '✗'} ${a.passed ? 'Passou' : 'Falhou'}
                </span>
              </td>
              <td style="color: ${a.xpEarned > 0 ? 'var(--color-success)' : 'var(--color-text-muted)'};">
                ${a.xpEarned > 0 ? '+' : ''}${a.xpEarned}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    if (totalPages > 1) {
      import('../../../shared/components/Pagination.js').then(({ Pagination }) => {
        paginationEl.innerHTML = Pagination.render(this.currentPage, totalPages);
        paginationEl.style.display = 'flex';
        
        paginationEl.querySelectorAll('.page-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            if (!isNaN(page)) {
              this.currentPage = page;
              this.loadHistory();
            }
          });
        });
      });
    } else {
      paginationEl.style.display = 'none';
    }
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatCategory(category) {
    const map = {
      'ALGORITHMS': 'Algoritmos',
      'OO_PATTERNS': 'Padrões OO',
      'JAVA_CORE': 'Java Core',
      'CONCURRENCY': 'Concorrência'
    };
    return map[category] || category;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};