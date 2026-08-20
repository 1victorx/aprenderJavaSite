// Toast Notification Component
export class Toast {
  constructor() {
    this.container = null;
    this.toasts = [];
  }

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-label', 'Notificações');
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 5000) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${icons[type]}</span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Fechar notificação">✕</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Auto dismiss
    setTimeout(() => this.remove(toast), duration);

    // Limit to 5 toasts
    if (this.toasts.length > 5) {
      this.remove(this.toasts[0]);
    }

    return toast;
  }

  success(message, duration) { return this.show(message, 'success', duration); }
  error(message, duration) { return this.show(message, 'error', duration); }
  warning(message, duration) { return this.show(message, 'warning', duration); }
  info(message, duration) { return this.show(message, 'info', duration); }

  remove(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.style.animation = 'slideIn 0.2s ease reverse';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      const idx = this.toasts.indexOf(toast);
      if (idx > -1) this.toasts.splice(idx, 1);
    }, 200);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}