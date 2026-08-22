export const ApiStatus = {
  render(compact = false) {
    return `
      <div class="api-status ${compact ? 'api-status-compact' : ''}" id="api-status" data-state="checking" role="status" aria-live="polite">
        <span class="api-status-dot" aria-hidden="true"></span>
        <span class="api-status-label">Verificando conexão</span>
        <button type="button" class="api-status-retry" data-api-retry>Atualizar</button>
      </div>
    `;
  },

  bind() {
    const retry = document.querySelector('[data-api-retry]');
    retry?.addEventListener('click', () => this.check());
    this.check();
  },

  async check() {
    const status = document.getElementById('api-status');
    if (!status || !window.apiClient) return;
    const label = status.querySelector('.api-status-label');
    status.dataset.state = 'checking';
    if (label) label.textContent = 'Verificando conexão';
    try {
      await window.apiClient.get('/api/exercises?page=0&size=1');
      status.dataset.state = 'online';
      if (label) label.textContent = 'API conectada';
    } catch {
      status.dataset.state = 'offline';
      if (label) label.textContent = 'API indisponível';
    }
  }
};
