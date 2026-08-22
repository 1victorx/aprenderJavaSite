// Login Page
import { AuthForm } from '../components/AuthForm.js';
import { ApiStatus } from '../../../shared/components/ApiStatus.js';

export const LoginPage = {
  render() {
    return `
      <div class="auth-page">
        <div class="auth-shell">
          <aside class="auth-showcase" aria-label="Sobre o JavaStudy">
            <div class="showcase-brand"><span class="brand-mark">{ }</span><span>JavaStudy</span></div>
            <div class="showcase-copy">
              <span class="eyebrow">Seu laboratório de prática</span>
              <h1>Aprenda Java fazendo.</h1>
              <p>Exercícios curtos, feedback claro e um caminho que mostra o próximo passo.</p>
            </div>
            <div class="showcase-board" aria-hidden="true">
              <span class="board-line board-line-long"></span>
              <span class="board-line board-line-short"></span>
              <span class="board-chip">public static void main</span>
              <span class="board-cursor">▌</span>
            </div>
            <div class="showcase-points">
              <span><strong>01</strong> pratique no seu ritmo</span>
              <span><strong>02</strong> acompanhe cada conquista</span>
            </div>
          </aside>
          <div class="auth-card">
            <div class="auth-header">
              <h2 class="auth-logo">Bem-vindo de volta</h2>
              <p class="auth-subtitle">Entre para continuar seu próximo exercício.</p>
            </div>
            ${AuthForm.render('login')}
            ${ApiStatus.render()}
            <div class="auth-footer">
              Ainda não tem uma conta? <a href="/register" data-link>Crie gratuitamente</a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    AuthForm.bindEvents('login');
    ApiStatus.bind();
  }
};
