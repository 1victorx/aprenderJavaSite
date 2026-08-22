// Register Page
import { AuthForm } from '../components/AuthForm.js';
import { ApiStatus } from '../../../shared/components/ApiStatus.js';

export const RegisterPage = {
  render() {
    return `
      <div class="auth-page">
        <div class="auth-shell">
          <aside class="auth-showcase auth-showcase-register" aria-label="Como funciona o JavaStudy">
            <div class="showcase-brand"><span class="brand-mark">{ }</span><span>JavaStudy</span></div>
            <div class="showcase-copy">
              <span class="eyebrow">Um passo de cada vez</span>
              <h1>Seu código começa aqui.</h1>
              <p>Monte uma rotina leve de prática e transforme dúvida em repertório.</p>
            </div>
            <div class="showcase-progress" aria-hidden="true">
              <div class="progress-heading"><span>Trilha Java</span><strong>01 / 04</strong></div>
              <div class="progress-track"><span></span></div>
              <div class="progress-steps"><i class="is-done">✓</i><i class="is-current">2</i><i>3</i><i>4</i></div>
            </div>
            <div class="showcase-points">
              <span><strong>+1</strong> ideia nova por sessão</span>
              <span><strong>100%</strong> foco no seu progresso</span>
            </div>
          </aside>
          <div class="auth-card">
            <div class="auth-header">
              <h2 class="auth-logo">Comece sua jornada</h2>
              <p class="auth-subtitle">Crie sua conta e escolha o primeiro exercício.</p>
            </div>
            ${AuthForm.render('register')}
            ${ApiStatus.render()}
            <div class="auth-footer">
              Já tem uma conta? <a href="/login" data-link>Entrar</a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    AuthForm.bindEvents('register');
    ApiStatus.bind();
  }
};
