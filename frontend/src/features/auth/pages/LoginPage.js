// Login Page
import { AuthForm } from '../components/AuthForm.js';

export const LoginPage = {
  render() {
    return `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">JavaStudy</div>
            <h1 class="auth-title">Bem-vindo de volta</h1>
            <p class="auth-subtitle">Continue sua jornada Java</p>
          </div>
          ${AuthForm.render('login')}
          <div class="auth-footer">
            Não tem conta? <a href="/register" data-link>Cadastrar</a>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    AuthForm.bindEvents('login');
  }
};
