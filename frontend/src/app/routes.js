// Routes Configuration
import { LoginPage } from '../features/auth/pages/LoginPage.js';
import { RegisterPage } from '../features/auth/pages/RegisterPage.js';
import { ExercisesPage } from '../features/exercises/pages/ExercisesPage.js';
import { ExerciseDetailPage } from '../features/exercises/pages/ExerciseDetailPage.js';
import { DashboardPage } from '../features/gamification/pages/DashboardPage.js';
import { HistoryPage } from '../features/gamification/pages/HistoryPage.js';
import { AchievementsPage } from '../features/gamification/pages/AchievementsPage.js';
import { LayoutPage } from '../features/layout/pages/LayoutPage.js';

export function setupRoutes(router) {
  // Page map for afterRender callbacks
  const pageMap = {
    '/login': LoginPage,
    '/register': RegisterPage,
    '/dashboard': DashboardPage,
    '/exercises': ExercisesPage,
    '/exercises/:slug': ExerciseDetailPage,
    '/history': HistoryPage,
    '/achievements': AchievementsPage,
    '/': LayoutPage
  };

  // Expose pageMap globally so main.js can call afterRender
  window.__pageMap = pageMap;

  // Public routes
  router
    .add('/login', () => LoginPage.render(), { public: true })
    .add('/register', () => RegisterPage.render(), { public: true })
    .add('/forgot-password', () => '<div class="auth-page"><div class="auth-card"><h1>Em breve</h1><p>Recuperação de senha será implementada.</p><a href="/login" data-link>Voltar</a></div></div>', { public: true });

  // Protected routes (require authentication)
  router
    .add('/', () => LayoutPage.render(), { public: false })
    .add('/dashboard', () => DashboardPage.render(), { public: false })
    .add('/exercises', () => ExercisesPage.render(), { public: false })
    .add('/exercises/:slug', () => ExerciseDetailPage.render(), { public: false })
    .add('/history', () => HistoryPage.render(), { public: false })
    .add('/achievements', () => AchievementsPage.render(), { public: false });

  // 404
  router.notFound(() => `
    <div class="auth-page">
      <div class="auth-card" style="text-align: center;">
        <h1>404</h1>
        <p style="margin: var(--space-4) 0; color: var(--color-text-secondary);">Página não encontrada</p>
        <a href="/" data-link class="btn btn-primary">Ir para o início</a>
      </div>
    </div>
  `);

  return router;
}
