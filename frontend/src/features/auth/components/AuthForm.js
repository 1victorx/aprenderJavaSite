// Auth Form Component
export const AuthForm = {
  render(type) {
    const isLogin = type === 'login';
    
    return `
      <form class="auth-form" id="auth-form" novalidate>
        ${!isLogin ? `
          <div class="form-group">
            <label for="name" class="form-label">Nome</label>
            <input type="text" id="name" name="name" class="form-input" autocomplete="name" required ${isLogin ? 'disabled' : ''} aria-describedby="name-error">
            <span class="form-error" id="name-error" aria-live="polite"></span>
          </div>
        ` : ''}
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input type="email" id="email" name="email" class="form-input" autocomplete="email" required aria-describedby="email-error">
          <span class="form-error" id="email-error" aria-live="polite"></span>
        </div>
        <div class="form-group">
          <label for="password" class="form-label">Senha</label>
          <input type="password" id="password" name="password" class="form-input" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required aria-describedby="password-error">
          <span class="form-error" id="password-error" aria-live="polite"></span>
        </div>
        ${!isLogin ? `
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirmar Senha</label>
            <input type="password" id="confirmPassword" name="confirmPassword" class="form-input" autocomplete="new-password" required aria-describedby="confirm-error">
            <span class="form-error" id="confirm-error" aria-live="polite"></span>
          </div>
        ` : ''}
        <div class="form-group" style="flex-direction: row; align-items: center; justify-content: space-between;">
          <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
            <input type="checkbox" id="remember" name="remember" style="width: auto;">
            <span>Lembrar-me</span>
          </label>
          ${isLogin ? `<a href="/forgot-password" style="font-size: var(--font-size-sm);">Esqueci a senha</a>` : ''}
        </div>
        <button type="submit" class="btn btn-primary btn-full btn-lg" id="submit-btn">
          <span class="btn-text">${isLogin ? 'Entrar' : 'Cadastrar'}</span>
          <span class="btn-loading spinner" style="display: none;" aria-hidden="true"></span>
        </button>
        ${isLogin ? `
          <p style="text-align: center; margin-top: var(--space-4); font-size: var(--font-size-sm); color: var(--color-text-muted);">
            Ou continue com
          </p>
          <div style="display: flex; gap: var(--space-3);">
            <button type="button" class="btn btn-secondary btn-full" style="flex: 1;" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
            <button type="button" class="btn btn-secondary btn-full" style="flex: 1;" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/></svg>
              Google
            </button>
          </div>
        ` : ''}
      </form>
    `;
  },

  bindEvents(type) {
    const isLogin = type === 'login';
    const form = document.getElementById('auth-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoading = submitBtn?.querySelector('.btn-loading');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Clear previous errors
      form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
      form.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));

      // Validation
      let hasErrors = false;
      if (!isLogin && !data.name?.trim()) {
        this.showError(form, 'name', 'Nome é obrigatório');
        hasErrors = true;
      }
      if (!data.email?.trim()) {
        this.showError(form, 'email', 'Email é obrigatório');
        hasErrors = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        this.showError(form, 'email', 'Email inválido');
        hasErrors = true;
      }
      if (!data.password) {
        this.showError(form, 'password', 'Senha é obrigatória');
        hasErrors = true;
      } else if (data.password.length < 8) {
        this.showError(form, 'password', 'Senha deve ter pelo menos 8 caracteres');
        hasErrors = true;
      }
      if (!isLogin && data.password !== data.confirmPassword) {
        this.showError(form, 'confirmPassword', 'Senhas não coincidem');
        hasErrors = true;
      }

      if (hasErrors) return;

      // Submit
      this.setLoading(submitBtn, btnText, btnLoading, true);

      try {
        if (isLogin) {
          await window.authStore.login(data.email, data.password);
          window.toast?.success('Login realizado com sucesso!');
          window.router?.navigate('/dashboard');
        } else {
          await window.authStore.register(data.name, data.email, data.password);
          window.toast?.success('Conta criada com sucesso!');
          window.router?.navigate('/dashboard');
        }
      } catch (error) {
        if (error.details) {
          Object.entries(error.details).forEach(([field, message]) => {
            this.showError(form, field, message);
          });
        } else {
          window.toast?.error(error.message || 'Erro ao processar solicitação');
        }
      } finally {
        this.setLoading(submitBtn, btnText, btnLoading, false);
      }
    });
  },

  showError(form, field, message) {
    const input = form.querySelector(`[name="${field}"]`);
    const errorEl = form.querySelector(`#${field}-error`);
    if (input) input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  },

  setLoading(btn, btnText, btnLoading, loading) {
    if (!btn) return;
    btn.disabled = loading;
    if (btnText) btnText.style.display = loading ? 'none' : 'inline';
    if (btnLoading) btnLoading.style.display = loading ? 'inline-block' : 'none';
  }
};