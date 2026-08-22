// Exercise Card Component
export const ExerciseCard = {
  render(exercise, number) {
    const difficultyClass = exercise.difficulty?.toLowerCase() || 'easy';
    const categoryClass = exercise.category?.toLowerCase().replace('_', '-') || 'algorithms';
    
    const stars = '★'.repeat(exercise.attempts?.passed || 0) + '☆'.repeat(5 - (exercise.attempts?.passed || 0));
    
    return `
      <article class="exercise-item" role="listitem">
        <span class="exercise-number">${number}</span>
        <div class="exercise-info">
          <h3 class="exercise-item-title">${this.escapeHtml(exercise.title)}</h3>
          <p class="exercise-item-desc">${this.escapeHtml(exercise.description?.substring(0, 120) || '')}...</p>
          <div class="exercise-item-meta">
            <span class="badge badge-category ${categoryClass}">${this.formatCategory(exercise.category)}</span>
            <span class="badge badge-difficulty ${difficultyClass}">${difficultyClass}</span>
            <span class="badge badge-status ${exercise.solved ? 'passed' : 'pending'}" aria-label="${exercise.solved ? 'Resolvido' : 'Não resolvido'}">
              ${exercise.solved ? '✓' : '○'} ${exercise.solved ? 'Resolvido' : 'Pendente'}
            </span>
            <span style="color: var(--color-text-muted); font-size: var(--font-size-xs);">XP: ${exercise.xpReward || 10}</span>
          </div>
        </div>
        <div class="exercise-item-actions">
          <a class="btn btn-primary" data-link href="/exercises/${encodeURIComponent(exercise.slug)}">
            ${exercise.solved ? 'Refazer' : 'Fazer'}
          </a>
        </div>
      </article>
    `;
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