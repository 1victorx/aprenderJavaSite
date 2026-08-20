// Register Page
import { AuthForm } from '../components/AuthForm.js';

export const RegisterPage = {
  render() {
    return `
      <div class="auth-page">
        <div class="auth-card" role="main">
          <div class="auth-header">
            <div class="auth-logo">JavaStudy</div>
            <h1 class="auth-title">Comece sua jornada</h1>
            <p class="auth-subtitle">Pratique Java todo dia, evolua constante</p>
          </div>
          ${AuthForm.render('register')}
          <div class="auth-footer">
            Já tem conta? <a href="/login" data-link>Entrar</a>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    AuthForm.bindEvents('register');
  }
};