// Exercise Detail Page with Monaco Editor
export const ExerciseDetailPage = {
  exercise: null,
  editor: null,
  isRunning: false,

  render() {
    return `
      <div class="exercise-page">
        <header class="exercise-header">
          <div class="exercise-title-group">
            <a href="/exercises" data-link class="btn btn-ghost btn-sm" style="padding: var(--space-1) var(--space-2);">
              ← Voltar
            </a>
            <div>
              <h1 id="exercise-title">${this.exercise?.title || 'Carregando...'}</h1>
              <div style="display: flex; gap: var(--space-2); margin-top: var(--space-2);">
                <span id="exercise-category" class="badge badge-category ${this.exercise?.category?.toLowerCase().replace('_', '-') || ''}">${this.formatCategory(this.exercise?.category) || 'Carregando...'}</span>
                <span id="exercise-difficulty" class="badge badge-difficulty ${this.exercise?.difficulty?.toLowerCase() || 'easy'}">${this.exercise?.difficulty?.toLowerCase() || 'Carregando...'}</span>
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-lg" id="run-btn" disabled>
            <span class="btn-text">Executar (Ctrl+Enter)</span>
            <span class="btn-loading spinner" style="display: none;" aria-hidden="true"></span>
          </button>
        </header>

        <div class="exercise-layout">
          <div class="exercise-description-section">
            <section class="exercise-description" aria-labelledby="problem-heading">
              <h2 id="problem-heading">Descrição</h2>
              <div id="exercise-description" class="markdown-content"></div>
            </section>
            
            <section class="exercise-description" style="margin-top: var(--space-6);" aria-labelledby="examples-heading">
              <h2 id="examples-heading">Exemplos</h2>
              <div id="exercise-examples"></div>
            </section>
          </div>

          <div class="exercise-editor-section">
            <div id="editor-container" style="height: 500px;"></div>
            
            <div id="result-section" style="margin-top: var(--space-4); display: none;">
              <div id="result-header" class="card" style="margin-bottom: var(--space-4);"></div>
              <div class="exercise-console" id="console-output" aria-label="Saída da execução" role="log" aria-live="polite"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const params = window.router?.getCurrentRoute()?.params || {};
    const slug = params.slug;
    const navigationVersion = window.router?.getNavigationVersion();
    
    if (!slug) return;

    try {
      this.exercise = await window.apiClient.get(`/api/exercises/slug/${slug}`);
      const currentRoute = window.router?.getCurrentRoute();
      if (window.router?.getNavigationVersion() !== navigationVersion ||
          currentRoute?.path !== '/exercises/:slug' || currentRoute.params?.slug !== slug) {
        return;
      }
      await this.initializePage();
    } catch (error) {
      const currentRoute = window.router?.getCurrentRoute();
      if (window.router?.getNavigationVersion() !== navigationVersion ||
          currentRoute?.path !== '/exercises/:slug' || currentRoute.params?.slug !== slug) return;
      console.error('[ExerciseDetailPage] failed to load exercise', error);
      window.toast?.error('Erro ao carregar exercício: ' + error.message);
      const main = document.getElementById('main');
      if (main) {
        main.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <p>Erro ao carregar exercício: ${this.escapeHtml(error.message)}</p>
            <a class="btn btn-primary" data-link href="/exercises">Voltar para exercícios</a>
          </div>
        `;
      }
    }
  },

  async initializePage() {
    // Update title
    document.getElementById('exercise-title').textContent = this.exercise.title;
    document.title = `${this.exercise.title} - JavaStudy`;
    const categoryEl = document.getElementById('exercise-category');
    const difficultyEl = document.getElementById('exercise-difficulty');
    if (categoryEl) {
      categoryEl.textContent = this.formatCategory(this.exercise.category);
      categoryEl.className = `badge badge-category ${this.exercise.category?.toLowerCase().replace('_', '-') || ''}`;
    }
    if (difficultyEl) {
      difficultyEl.textContent = this.exercise.difficulty?.toLowerCase() || 'Fácil';
      difficultyEl.className = `badge badge-difficulty ${this.exercise.difficulty?.toLowerCase() || 'easy'}`;
    }

    // Render description
    const descEl = document.getElementById('exercise-description');
    descEl.innerHTML = this.renderMarkdown(this.exercise.description);

    // Render examples
    const examplesEl = document.getElementById('exercise-examples');
    if (examplesEl && this.exercise.visibleTestCases?.length) {
      examplesEl.innerHTML = this.exercise.visibleTestCases.map((tc, i) => `
        <div style="margin-bottom: var(--space-4);">
          <h4 style="margin-bottom: var(--space-2);">Exemplo ${i + 1}</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div>
              <strong>Entrada:</strong>
              <pre><code>${this.escapeHtml(tc.inputData || '(vazio)')}</code></pre>
            </div>
            <div>
              <strong>Saída esperada:</strong>
              <pre><code>${this.escapeHtml(tc.expectedOutput)}</code></pre>
            </div>
          </div>
        </div>
      `).join('');
    } else if (examplesEl) {
      examplesEl.innerHTML = '<p>Os exemplos serão disponibilizados em breve.</p>';
    }

    // Initialize Monaco Editor
    await this.initEditor();

    // Bind run button
    const runBtn = document.getElementById('run-btn');
    runBtn?.addEventListener('click', () => this.runCode());
    runBtn.disabled = false;

    // Keyboard shortcut
    this.handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.runCode();
      }
    };
    document.addEventListener('keydown', this.handleKeyDown);
  },

  async initEditor() {
    // Load Monaco dynamically
    const monaco = await this.loadMonaco();
    
    this.editor = monaco.editor.create(document.getElementById('editor-container'), {
      value: this.exercise.starterCode || '',
      language: 'java',
      theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      tabSize: 2,
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all',
      accessibilitySupport: 'on'
    });

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      if (this.editor) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  },

  loadMonaco() {
    if (window.monaco) return Promise.resolve(window.monaco);
    return import('monaco-editor').then(monaco => {
      window.monaco = monaco;
      return monaco;
    });
  },

  async runCode() {
    if (this.isRunning || !this.editor) return;

    this.isRunning = true;
    this.setRunningState(true);

    const code = this.editor.getValue();
    const consoleEl = document.getElementById('console-output');
    const resultHeader = document.getElementById('result-header');
    const resultSection = document.getElementById('result-section');

    consoleEl.innerHTML = '<div class="console-line system">Executando testes...</div>';
    resultSection.style.display = 'block';
    resultHeader.innerHTML = '';

    try {
      const response = await window.apiClient.post(`/api/exercises/slug/${this.exercise.slug}/run`, { code });
      
      this.renderResult(response, consoleEl, resultHeader);
      
      if (response.passed) {
        window.toast?.success(`Parabéns! Todos os testes passaram. +${response.xpEarned} XP`);
      } else {
        window.toast?.warning('Alguns testes falharam. Revise seu código.');
      }
    } catch (error) {
      consoleEl.innerHTML = `<div class="console-line error">Erro: ${this.escapeHtml(error.message)}</div>`;
      resultHeader.innerHTML = `
        <div class="card" style="border-color: var(--color-error); background: var(--color-error-soft);">
          <div class="card-body">
            <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--color-error);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              <span>Erro na execução: ${this.escapeHtml(error.message)}</span>
            </div>
          </div>
        </div>
      `;
      window.toast?.error('Erro na execução: ' + error.message);
    } finally {
      this.isRunning = false;
      this.setRunningState(false);
    }
  },

  renderResult(response, consoleEl, resultHeader) {
    // Result header
    const passed = response.passed;
    resultHeader.innerHTML = `
      <div class="card" style="border-color: ${passed ? 'var(--color-success)' : 'var(--color-error)'}; background: ${passed ? 'var(--color-success-soft)' : 'var(--color-error-soft)'};">
        <div class="card-body">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
            <div style="display: flex; align-items: center; gap: var(--space-3); color: ${passed ? 'var(--color-success)' : 'var(--color-error)'};">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                ${passed ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'}
              </svg>
              <div>
                <strong style="font-size: var(--font-size-lg);">${passed ? 'Todos os testes passaram!' : 'Alguns testes falharam'}</strong>
                <div style="font-size: var(--font-size-sm); opacity: 0.8;">${passed ? `XP ganho: +${response.xpEarned}` : 'Revise seu código e tente novamente'}</div>
              </div>
            </div>
            ${response.testResults ? `
              <div style="display: flex; gap: var(--space-4); font-size: var(--font-size-sm);">
                <span>✓ ${response.testResults.filter(t => t.passed).length}/${response.testResults.length}</span>
                <span>⏱ ${response.executionTimeMs}ms</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Console output
    if (response.testResults) {
      consoleEl.innerHTML = response.testResults.map((test, i) => `
        <div class="console-line ${test.passed ? 'success' : 'error'}">
          <span>Teste ${test.testNumber}: ${test.passed ? '✓ PASSOU' : '✗ FALHOU'}</span>
        </div>
        ${!test.passed ? `
          <div class="console-line output">
            <span>Entrada: ${this.escapeHtml(test.input)}</span>
          </div>
          <div class="console-line output">
            <span>Esperado: ${this.escapeHtml(test.expectedOutput)}</span>
          </div>
          <div class="console-line error">
            <span>Obtido: ${this.escapeHtml(test.actualOutput || '(vazio)')}</span>
          </div>
        ` : ''}
      `).join('');
    } else {
      consoleEl.innerHTML = `<div class="console-line output">${this.escapeHtml(response.output || '')}</div>`;
    }
  },

  setRunningState(running) {
    const runBtn = document.getElementById('run-btn');
    const btnText = runBtn?.querySelector('.btn-text');
    const btnLoading = runBtn?.querySelector('.btn-loading');
    
    if (runBtn) runBtn.disabled = running;
    if (btnText) btnText.style.display = running ? 'none' : 'inline';
    if (btnLoading) btnLoading.style.display = running ? 'inline-block' : 'none';
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
  },

  renderMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/```(\w*)\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>')
      .replace(/^(<.+>)/, '<p>$1')
      .replace(/(.+>)$/, '$1</p>');
  }
};