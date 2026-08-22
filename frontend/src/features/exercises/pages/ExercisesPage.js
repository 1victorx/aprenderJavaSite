// Exercises List Page
import { ExerciseCard } from '../components/ExerciseCard.js';
import { Pagination } from '../../../shared/components/Pagination.js';

export const ExercisesPage = {
  render() {
    return `
      <div class="exercises-page">
        <div class="exercises-header">
          <div>
            <h1>Exercícios</h1>
            <p style="color: var(--color-text-secondary); margin-top: var(--space-1);">
              Pratique e evolua suas habilidades em Java
            </p>
          </div>
          <div class="exercises-filters" aria-label="Filtros de exercícios">
            <select class="form-input" id="category-filter" aria-label="Filtrar por categoria">
              <option value="">Todas as categorias</option>
              <option value="ALGORITHMS">Algoritmos</option>
              <option value="OO_PATTERNS">Padrões OO</option>
              <option value="JAVA_CORE">Java Core</option>
              <option value="CONCURRENCY">Concorrência</option>
            </select>
            <select class="form-input" id="difficulty-filter" aria-label="Filtrar por dificuldade">
              <option value="">Todas as dificuldades</option>
              <option value="EASY">Fácil</option>
              <option value="MEDIUM">Médio</option>
              <option value="HARD">Difícil</option>
            </select>
            <select class="form-input" id="status-filter" aria-label="Filtrar por status">
              <option value="all">Todos os exercícios</option>
              <option value="unsolved">Ainda não resolvidos</option>
              <option value="solved">Resolvidos</option>
            </select>
            <input type="search" class="form-input" id="search-input" placeholder="Buscar no catálogo..." aria-label="Buscar exercícios">
          </div>
        </div>
        
        <div class="exercise-list" id="exercise-list" role="list" aria-label="Lista de exercícios">
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">⏳</div>
            <p>Carregando exercícios...</p>
          </div>
        </div>
        
        <nav class="pagination" id="pagination" aria-label="Paginação" style="display: none;"></nav>
      </div>
    `;
  },

  async afterRender() {
    const navigationVersion = window.router?.getNavigationVersion();
    this.loadGeneration = (this.loadGeneration || 0) + 1;
    this.currentPage = 0;
    this.pageSize = 20;
    this.currentCategory = '';
    this.currentDifficulty = '';
    this.currentStatus = 'all';
    this.searchQuery = '';
    
    const listEl = document.getElementById('exercise-list');
    const paginationEl = document.getElementById('pagination');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const statusFilter = document.getElementById('status-filter');
    document.getElementById('exercise-list')?.addEventListener('click', (event) => {
      if (!event.target.closest('[data-clear-exercise-filters]')) return;
      categoryFilter.value = '';
      difficultyFilter.value = '';
      statusFilter.value = 'all';
      searchInput.value = '';
      this.currentCategory = '';
      this.currentDifficulty = '';
      this.currentStatus = 'all';
      this.searchQuery = '';
      this.currentPage = 0;
      this.loadExercises();
    });

    categoryFilter?.addEventListener('change', () => {
      this.currentCategory = categoryFilter.value;
      this.currentPage = 0;
      this.loadExercises();
    });

    difficultyFilter?.addEventListener('change', () => {
      this.currentDifficulty = difficultyFilter.value;
      this.currentPage = 0;
      this.loadExercises();
    });

    statusFilter?.addEventListener('change', () => {
      this.currentStatus = statusFilter.value;
      this.currentPage = 0;
      this.loadExercises();
    });

    let searchTimeout;
    searchInput?.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchQuery = searchInput.value.trim();
        this.currentPage = 0;
        this.loadExercises();
      }, 300);
    });

    await this.loadExercises(navigationVersion, this.loadGeneration);
  },

  async loadExercises(navigationVersion = window.router?.getNavigationVersion(), generation = ++this.loadGeneration) {
    const listEl = document.getElementById('exercise-list');
    const paginationEl = document.getElementById('pagination');

    listEl.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">⏳</div>
        <p>Carregando exercícios...</p>
      </div>
    `;

    try {
      const params = new URLSearchParams({
        page: this.currentPage,
        size: this.pageSize
      });
      if (this.currentCategory) params.append('category', this.currentCategory);
      if (this.currentDifficulty) params.append('difficulty', this.currentDifficulty);
      if (this.currentStatus !== 'all') params.append('status', this.currentStatus);
      if (this.searchQuery) params.append('q', this.searchQuery);

      const data = await window.apiClient.get(`/api/exercises?${params}`);
      if (generation !== this.loadGeneration ||
          window.router?.getNavigationVersion() !== navigationVersion ||
          window.router?.getCurrentRoute()?.path !== '/exercises') return;
      this.renderExercises(data.content, data.totalPages, data.totalElements);
    } catch (error) {
      if (generation !== this.loadGeneration ||
          window.router?.getNavigationVersion() !== navigationVersion ||
          window.router?.getCurrentRoute()?.path !== '/exercises') return;
      listEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">⚠️</div>
          <p>Erro ao carregar exercícios: ${this.escapeHtml(error.message)}</p>
          <button class="btn btn-primary" onclick="window.exercisesPage?.loadExercises()">Tentar novamente</button>
        </div>
      `;
      paginationEl.style.display = 'none';
    }
  },

  renderExercises(exercises, totalPages, totalElements) {
    const listEl = document.getElementById('exercise-list');
    const paginationEl = document.getElementById('pagination');

    if (exercises.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <p>Nenhum exercício encontrado com estes filtros.</p>
          <button type="button" class="btn btn-secondary" data-clear-exercise-filters>Limpar filtros</button>
        </div>
      `;
      paginationEl.style.display = 'none';
      return;
    }

    listEl.innerHTML = exercises.map((exercise, index) => 
      ExerciseCard.render(exercise, this.currentPage * this.pageSize + index + 1)
    ).join('');

    // Pagination
    if (totalPages > 1) {
      paginationEl.innerHTML = Pagination.render(this.currentPage, totalPages);
      paginationEl.style.display = 'flex';
      
      paginationEl.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const page = parseInt(btn.dataset.page);
          if (!isNaN(page)) {
            this.currentPage = page;
            this.loadExercises();
          }
        });
      });
    } else {
      paginationEl.style.display = 'none';
    }

  }
};

// Make accessible globally for retry button
window.exercisesPage = ExercisesPage;
