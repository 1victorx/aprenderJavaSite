// Achievements Page
import { StatsCard } from '../components/StatsCard.js';
import { AchievementBadge } from '../components/AchievementBadge.js';

export const AchievementsPage = {
  data: null,

  render() {
    return `
      <div class="achievements-page">
        <header style="margin-bottom: var(--space-6);">
          <h1>Conquistas</h1>
          <p style="color: var(--color-text-secondary);">Suas conquistas e progresso</p>
        </header>

        <div class="stats-grid" style="margin-bottom: var(--space-8);" id="achievement-stats">
          <div class="empty-state" style="grid-column: 1 / -1;"><div class="empty-state-icon">⏳</div><p>Carregando...</p></div>
        </div>

        <div class="tabs" role="tablist" aria-label="Filtrar conquistas">
          <button class="tab active" role="tab" aria-selected="true" data-filter="all">Todas</button>
          <button class="tab" role="tab" aria-selected="false" data-filter="unlocked">Desbloqueadas</button>
          <button class="tab" role="tab" aria-selected="false" data-filter="locked">Bloqueadas</button>
        </div>

        <div class="achievements-grid" id="achievements-grid" role="tabpanel">
          <div class="empty-state" style="grid-column: 1 / -1;"><div class="empty-state-icon">⏳</div><p>Carregando conquistas...</p></div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    try {
      this.data = await window.apiClient.get('/api/gamification/dashboard');
      if (window.router?.getCurrentRoute()?.path !== '/achievements') return;
      this.renderAchievements();
      this.bindTabs();
    } catch (error) {
      if (window.router?.getCurrentRoute()?.path !== '/achievements') return;
      window.toast?.error('Erro ao carregar conquistas: ' + error.message);
    }
  },

  bindTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        this.renderAchievements(tab.dataset.filter);
      });
    });
  },

  renderAchievements(filter = 'all') {
    if (!this.data?.achievements) return;

    const achievements = this.data.achievements.filter(a => {
      if (filter === 'unlocked') return a.unlocked;
      if (filter === 'locked') return !a.unlocked;
      return true;
    });

    // Stats
    const unlocked = this.data.achievements.filter(a => a.unlocked).length;
    const total = this.data.achievements.length;
    const xpFromAchievements = unlocked * 50; // Estimativa

    document.getElementById('achievement-stats').innerHTML = `
      ${StatsCard.render({ icon: '🎖️', value: unlocked, label: 'Desbloqueadas', sublabel: `de ${total} total`, iconClass: 'achievement' })}
      ${StatsCard.render({ icon: '🔒', value: total - unlocked, label: 'Bloqueadas', sublabel: 'Continue praticando', iconClass: 'locked' })}
      ${StatsCard.render({ icon: '📊', value: `${total ? Math.round((unlocked/total)*100) : 0}%`, label: 'Progresso', sublabel: 'Conquistas completadas', iconClass: 'progress' })}
      ${StatsCard.render({ icon: '⭐', value: xpFromAchievements, label: 'XP de Conquistas', sublabel: 'Estimado', iconClass: 'xp' })}
    `;

    // Grid
    const grid = document.getElementById('achievements-grid');
    if (achievements.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>Nenhuma conquista ${filter === 'unlocked' ? 'desbloqueada' : filter === 'locked' ? 'bloqueada' : ''}.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = achievements.map(a => `
      <article class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}" role="article" aria-label="${a.name}: ${a.unlocked ? 'Desbloqueada' : 'Bloqueada'}">
        <span class="achievement-icon" aria-hidden="true">${a.icon}</span>
        <div class="achievement-info">
          <h4 class="achievement-name">${this.escapeHtml(a.name)}</h4>
          <p class="achievement-desc">${this.escapeHtml(a.description)}</p>
          ${a.unlocked && a.unlockedAt ? `<p class="achievement-desc" style="margin-top: var(--space-1); font-size: var(--font-size-xs); color: var(--color-success);">Desbloqueada em ${new Date(a.unlockedAt).toLocaleDateString('pt-BR')}</p>` : ''}
        </div>
      </article>
    `).join('');
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
