// Dashboard Page
import { StatsCard } from '../components/StatsCard.js';
import { StreakCalendar } from '../components/StreakCalendar.js';
import { AchievementBadge } from '../components/AchievementBadge.js';

export const DashboardPage = {
  data: null,

  render() {
    return `
      <div class="dashboard-page">
        <section class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <span class="eyebrow">Seu espaço de prática</span>
            <h1>Olá, <span class="hero-name">${this.escapeHtml(window.authStore?.currentUser?.name?.split(' ')[0] || 'estudante')}</span>.</h1>
            <p>Escolha um exercício, escreva código e veja seu progresso ganhar forma.</p>
            <div class="hero-actions">
              <a href="/exercises" data-link class="btn btn-primary btn-lg">Começar a praticar <span aria-hidden="true">→</span></a>
              <span class="hero-tip"><span class="tip-dot"></span> uma sessão curta já conta</span>
            </div>
          </div>
          <div class="dashboard-hero-art" aria-hidden="true">
            <div class="hero-orbit hero-orbit-one"></div>
            <div class="hero-orbit hero-orbit-two"></div>
            <div class="hero-code-card">
              <span class="code-kicker">/ hoje</span>
              <strong>public class</strong>
              <span>JavaStudy {</span>
              <span class="code-indent">practice();</span>
              <span>}</span>
              <i>✦</i>
            </div>
          </div>
        </section>

        <header class="dashboard-section-heading">
          <div>
            <span class="eyebrow">Visão geral</span>
            <h2>Seu ritmo até aqui</h2>
          </div>
          <a href="/history" data-link class="text-link">Ver histórico <span aria-hidden="true">↗</span></a>
        </header>

        <div class="stats-grid" id="stats-grid">
          <div class="empty-state" style="grid-column: 1 / -1;"><div class="empty-state-icon">⏳</div><p>Carregando...</p></div>
        </div>

        <section id="next-exercise" class="card dashboard-next-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">Próxima parada</span>
              <h2 class="card-title">Exercício recomendado</h2>
            </div>
            <span class="section-number">01</span>
          </div>
          <div class="card-body" id="next-exercise-content">
            <div class="empty-state"><div class="empty-state-icon">⏳</div><p>Carregando...</p></div>
          </div>
        </section>

        <section id="streak-section" class="card dashboard-streak-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">Consistência</span>
              <h2 class="card-title">Seu calendário de prática</h2>
            </div>
            <span class="streak-mark" aria-hidden="true">✦</span>
          </div>
          <div class="card-body">
            <div id="streak-calendar"></div>
            <div class="streak-legend">
              <div class="streak-legend-item"><span class="streak-legend-color" style="background: var(--color-success);"></span> Completado</div>
              <div class="streak-legend-item"><span class="streak-legend-color" style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border);"></span> Pendente</div>
              <div class="streak-legend-item"><span class="streak-legend-color" style="background: var(--color-bg-tertiary); border: 2px solid var(--color-primary);"></span> Hoje</div>
            </div>
          </div>
        </section>

        <section id="achievements-section" class="card dashboard-achievements-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">Pequenas vitórias</span>
              <h2 class="card-title">Conquistas recentes</h2>
            </div>
            <a href="/achievements" data-link class="text-link">Ver todas <span aria-hidden="true">↗</span></a>
          </div>
          <div class="card-body">
            <div class="achievements-grid" id="achievements-grid"></div>
          </div>
        </section>
      </div>
    `;
  },

  async afterRender() {
    try {
      this.data = await window.apiClient.get('/api/gamification/dashboard');
      if (window.router?.getCurrentRoute()?.path !== '/dashboard') {
        return;
      }
      this.renderDashboard();
    } catch (error) {
      if (window.router?.getCurrentRoute()?.path !== '/dashboard') return;
      window.toast?.error('Erro ao carregar dashboard: ' + error.message);
    }
  },

  renderDashboard() {
    const d = this.data;
    if (!d) return;

    // Stats Grid
    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = `
      ${StatsCard.render({ 
        icon: '🔥', 
        value: d.currentStreak, 
        label: 'Streak Atual', 
        sublabel: `Melhor: ${d.longestStreak} dias`,
        iconClass: 'fire'
      })}
      ${StatsCard.render({ 
        icon: '⚡', 
        value: this.formatNumber(d.totalXp), 
        label: 'XP Total', 
        sublabel: `${d.xpInCurrentLevel}/${d.xpInCurrentLevel + d.xpToNextLevel} para nível ${d.currentLevel + 1}`,
        iconClass: 'xp'
      })}
      ${StatsCard.render({ 
        icon: '🏆', 
        value: d.currentLevel, 
        label: 'Nível Atual', 
        sublabel: `Progresso: ${this.getProgressPercent(d.xpInCurrentLevel, d.xpInCurrentLevel + d.xpToNextLevel)}%`,
        iconClass: 'level'
      })}
      ${StatsCard.render({ 
        icon: '🎖️', 
        value: d.achievements?.filter(a => a.unlocked).length || 0, 
        label: 'Conquistas', 
        sublabel: `de ${d.achievements?.length ?? 0} total`,
        iconClass: 'achievement'
      })}
    `;

    // Next Exercise
    if (d.nextExercise) {
      document.getElementById('next-exercise-content').innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap;">
          <div>
            <h3 style="margin-bottom: var(--space-1);">${this.escapeHtml(d.nextExercise.title)}</h3>
            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
              <span class="badge badge-category ${d.nextExercise.category?.toLowerCase().replace('_', '-') || ''}">${this.formatCategory(d.nextExercise.category)}</span>
              <span class="badge badge-difficulty ${d.nextExercise.difficulty?.toLowerCase() || 'easy'}">${d.nextExercise.difficulty?.toLowerCase() || 'Fácil'}</span>
            </div>
          </div>
          <a href="/exercises/${d.nextExercise.slug}" data-link class="btn btn-primary">Continuar →</a>
        </div>
      `;
    } else {
      document.getElementById('next-exercise-content').innerHTML = `
        <div class="empty-state" style="padding: var(--space-4);">
          <div class="empty-state-icon">🎉</div>
          <p>Você concluiu o catálogo atual. Continue revisando seu histórico ou volte aos exercícios para praticar.</p>
          <a href="/exercises" data-link class="btn btn-secondary">Revisar exercícios</a>
        </div>
      `;
    }

    // Streak Calendar
    document.getElementById('streak-calendar').innerHTML = StreakCalendar.render(d.streakCalendar);

    // Achievements
    const achievementsGrid = document.getElementById('achievements-grid');
    const unlockedAchievements = d.achievements?.filter(a => a.unlocked).slice(0, 4) || [];
    
    if (unlockedAchievements.length > 0) {
      achievementsGrid.innerHTML = unlockedAchievements.map(a => 
        AchievementBadge.render(a)
      ).join('');
    } else {
      achievementsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: var(--space-4);">
          <p>Resolva exercícios para desbloquear conquistas.</p>
          <a href="/exercises" data-link class="btn btn-secondary">Ver exercícios</a>
        </div>
      `;
    }
  },

  formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
  },

  getProgressPercent(current, total) {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  },

  formatCategory(category) {
    const map = {
      'ALGORITHMS': 'Algoritmos',
      'OO_PATTERNS': 'Padrões OO',
      'JAVA_CORE': 'Java Core',
      'CONCURRENCY': 'Concorrência'
    };
    return map[category] || category;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
