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
          <div class="exercises-filters">
            <select class="form-input" id="category-filter" style="width: auto; min-width: 200px;" aria-label="Filtrar por categoria">
              <option value="">Todas as categorias</option>
              <option value="ALGORITHMS">Algoritmos</option>
              <option value="OO_PATTERNS">Padrões OO</option>
              <option value="JAVA_CORE">Java Core</option>
              <option value="CONCURRENCY">Concorrência</option>
            </select>
            <input type="search" class="form-input" id="search-input" placeholder="Buscar exercícios..." style="width: auto; min-width: 250px;" aria-label="Buscar exercícios">
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
    this.currentPage = 0;
    this.pageSize = 20;
    this.currentCategory = '';
    this.searchQuery = '';
    
    const listEl = document.getElementById('exercise-list');
    const paginationEl = document.getElementById('pagination');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');

    categoryFilter?.addEventListener('change', () => {
      this.currentCategory = categoryFilter.value;
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

    await this.loadExercises();
  },

  async loadExercises() {
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

      const data = await window.apiClient.get(`/api/exercises?${params}`);
      
      this.renderExercises(data.content, data.totalPages, data.totalElements);
    } catch (error) {
      listEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">⚠️</div>
          <p>Erro ao carregar exercícios: ${error.message}</p>
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
          <p>Nenhum exercício encontrado. Tente outro filtro.</p>
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

    // Bind exercise card buttons
    listEl.querySelectorAll('[data-exercise-slug]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.router?.navigate(`/exercises/${btn.dataset.exerciseSlug}`);
      });
    });
  }
};

// Make accessible globally for retry button
window.exercisesPage = ExercisesPage;