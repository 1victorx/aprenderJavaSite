// Auth form focused on the real email/password flow.
export const AuthForm = {
  render(type) {
    const isLogin = type === 'login';
    return `
      <form class="auth-form" id="auth-form" novalidate>
        ${!isLogin ? `
          <div class="form-group">
            <label for="name" class="form-label">Nome</label>
            <input type="text" id="name" name="name" class="form-input" autocomplete="name" required aria-describedby="name-error">
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
            <label for="confirmPassword" class="form-label">Confirmar senha</label>
            <input type="password" id="confirmPassword" name="confirmPassword" class="form-input" autocomplete="new-password" required aria-describedby="confirmPassword-error">
            <span class="form-error" id="confirmPassword-error" aria-live="polite"></span>
          </div>
        ` : ''}
        <button type="submit" class="btn btn-primary btn-full btn-lg" id="submit-btn">
          <span class="btn-text">${isLogin ? 'Entrar' : 'Cadastrar'}</span>
          <span class="btn-loading spinner" style="display: none;" aria-hidden="true"></span>
        </button>
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

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      form.querySelectorAll('.form-error').forEach((el) => { el.textContent = ''; });
      form.querySelectorAll('.form-input').forEach((el) => el.classList.remove('error'));

      let hasErrors = false;
      if (!isLogin && !data.name?.trim()) { this.showError(form, 'name', 'Nome é obrigatório'); hasErrors = true; }
      if (!data.email?.trim()) { this.showError(form, 'email', 'Email é obrigatório'); hasErrors = true; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { this.showError(form, 'email', 'Email inválido'); hasErrors = true; }
      if (!data.password) { this.showError(form, 'password', 'Senha é obrigatória'); hasErrors = true; }
      else if (data.password.length < 8) { this.showError(form, 'password', 'Senha deve ter pelo menos 8 caracteres'); hasErrors = true; }
      if (!isLogin && data.password !== data.confirmPassword) { this.showError(form, 'confirmPassword', 'As senhas não coincidem'); hasErrors = true; }
      if (hasErrors) return;

      this.setLoading(submitBtn, btnText, btnLoading, true);
      try {
        if (isLogin) {
          await window.authStore.login(data.email, data.password);
          window.toast?.success('Login realizado com sucesso!');
        } else {
          await window.authStore.register(data.name, data.email, data.password);
          window.toast?.success('Conta criada com sucesso!');
        }
        window.router?.navigate('/dashboard');
      } catch (error) {
        if (error.details) Object.entries(error.details).forEach(([field, message]) => this.showError(form, field, message));
        else window.toast?.error(error.message || 'Não foi possível concluir. Tente novamente.');
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
