export const ErrorState = {
  render({ title = 'Algo não saiu como esperado', message = 'Tente novamente em instantes.', action = 'Tentar novamente' } = {}) {
    return `
      <div class="error-state" role="alert">
        <div class="error-state-icon" aria-hidden="true">!</div>
        <p class="eyebrow">JavaStudy</p>
        <h1>${this.escapeHtml(title)}</h1>
        <p>${this.escapeHtml(message)}</p>
        <button type="button" class="btn btn-primary" data-global-retry>${this.escapeHtml(action)}</button>
      </div>
    `;
  },
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
