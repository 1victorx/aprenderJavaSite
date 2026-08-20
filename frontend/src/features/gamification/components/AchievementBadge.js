// Achievement Badge Component
export const AchievementBadge = {
  render(achievement) {
    return `
      <article class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}" role="article" aria-label="${achievement.name}: ${achievement.unlocked ? 'Desbloqueada' : 'Bloqueada'}">
        <span class="achievement-icon" aria-hidden="true">${achievement.icon}</span>
        <div class="achievement-info">
          <h4 class="achievement-name">${this.escapeHtml(achievement.name)}</h4>
          <p class="achievement-desc">${this.escapeHtml(achievement.description)}</p>
          ${achievement.unlockedAt ? `<p class="achievement-desc" style="margin-top: var(--space-1); font-size: var(--font-size-xs); color: var(--color-success);">Desbloqueada em ${new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}</p>` : ''}
        </div>
      </article>
    `;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};