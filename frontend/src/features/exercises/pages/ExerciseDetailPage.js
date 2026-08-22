// Exercise workspace: guided instructions, resilient execution and local drafts.
export const ExerciseDetailPage = {
  exercise: null,
  editor: null,
  isRunning: false,
  isDirty: false,
  draftTimer: null,
  handleKeyDown: null,
  editorChangeDisposable: null,

  render() {
    return `
      <div class="exercise-page">
        <header class="exercise-header">
          <div class="exercise-title-group">
            <a href="/exercises" data-link class="btn btn-ghost btn-sm">← Voltar</a>
            <div>
              <p class="eyebrow">Prática diária</p>
              <h1 id="exercise-title">${this.escapeHtml(this.exercise?.title || 'Carregando...')}</h1>
              <div class="exercise-meta" aria-label="Metadados do exercício">
                <span id="exercise-category" class="badge badge-category">${this.formatCategory(this.exercise?.category) || 'Carregando...'}</span>
                <span id="exercise-difficulty" class="badge badge-difficulty">${this.formatDifficulty(this.exercise?.difficulty)}</span>
                <span class="draft-status" id="draft-status" role="status">Rascunho salvo automaticamente</span>
              </div>
            </div>
          </div>
          <div class="exercise-actions">
            <button class="btn btn-secondary" id="guide-toggle" type="button" aria-expanded="true">Modo guiado</button>
            <button class="btn btn-primary btn-lg" id="run-btn" type="button" disabled>
              <span class="btn-text">Executar <kbd>Ctrl</kbd><span aria-hidden="true">+</span><kbd>Enter</kbd></span>
              <span class="btn-loading spinner" style="display: none;" aria-hidden="true"></span>
            </button>
          </div>
        </header>

        <div class="exercise-layout">
          <div class="exercise-description-section">
            <aside class="guided-panel card" id="guided-panel" aria-labelledby="guide-heading">
              <div class="card-header"><p class="eyebrow">Primeiros passos</p><h2 class="card-title" id="guide-heading">Resolva em três movimentos</h2></div>
              <div class="card-body guided-steps">
                <div><span>01</span><p><strong>Entenda</strong><br>Leia o objetivo e confira os exemplos.</p></div>
                <div><span>02</span><p><strong>Implemente</strong><br>Complete o código inicial no editor.</p></div>
                <div><span>03</span><p><strong>Execute</strong><br>Rode os testes e use o resultado para iterar.</p></div>
              </div>
            </aside>
            <section class="exercise-description card" aria-labelledby="problem-heading">
              <div class="card-header"><p class="eyebrow">O desafio</p><h2 class="card-title" id="problem-heading">Descrição</h2></div>
              <div id="exercise-description" class="card-body markdown-content"></div>
            </section>
            <section class="exercise-description card" aria-labelledby="examples-heading">
              <div class="card-header"><p class="eyebrow">Referência</p><h2 class="card-title" id="examples-heading">Exemplos</h2></div>
              <div id="exercise-examples" class="card-body"></div>
            </section>
          </div>

          <div class="exercise-editor-section">
            <div class="editor-toolbar"><span class="editor-title">Seu código</span><span class="editor-hint">O rascunho fica salvo neste navegador</span></div>
            <div id="editor-container" class="editor-container"></div>
            <div id="result-section" class="result-section" style="display: none;">
              <div id="result-header"></div>
              <div class="exercise-console" id="console-output" aria-label="Saída da execução" role="log" aria-live="polite"></div>
            </div>
            <section class="execution-history card" aria-labelledby="execution-history-heading">
              <div class="card-header"><div><p class="eyebrow">Contexto</p><h2 class="card-title" id="execution-history-heading">Últimas execuções</h2></div><span class="badge badge-status pending" id="history-count">0 registros</span></div>
              <div class="card-body" id="execution-history-list"><p class="muted">Carregando seu histórico neste exercício...</p></div>
            </section>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    this.dispose();
    this.exercise = null;
    this.isDirty = false;
    const slug = window.router?.getCurrentRoute()?.params?.slug;
    const navigationVersion = window.router?.getNavigationVersion();
    if (!slug) return;
    try {
      this.exercise = await window.apiClient.get(`/api/exercises/slug/${encodeURIComponent(slug)}`);
      const currentRoute = window.router?.getCurrentRoute();
      if (window.router?.getNavigationVersion() !== navigationVersion || currentRoute?.params?.slug !== slug) return;
      await this.initializePage();
      this.loadExecutionHistory();
    } catch (error) {
      const main = document.getElementById('main');
      if (main) main.innerHTML = `<div class="empty-state"><div class="empty-state-icon">!</div><h1>Não foi possível carregar o exercício</h1><p>${this.escapeHtml(error.message)}</p><button class="btn btn-primary" data-global-retry>Tentar novamente</button></div>`;
    }
  },

  async initializePage() {
    document.title = `${this.exercise.title} - JavaStudy`;
    const categoryEl = document.getElementById('exercise-category');
    const difficultyEl = document.getElementById('exercise-difficulty');
    categoryEl.textContent = this.formatCategory(this.exercise.category);
    categoryEl.className = `badge badge-category ${this.exercise.category?.toLowerCase().replace('_', '-') || ''}`;
    difficultyEl.textContent = this.formatDifficulty(this.exercise.difficulty);
    difficultyEl.className = `badge badge-difficulty ${this.exercise.difficulty?.toLowerCase() || 'easy'}`;
    document.getElementById('exercise-description').innerHTML = this.renderMarkdown(this.exercise.description);

    const examplesEl = document.getElementById('exercise-examples');
    examplesEl.innerHTML = this.exercise.visibleTestCases?.length
      ? this.exercise.visibleTestCases.map((testCase, index) => `
        <div class="example-block"><h3>Exemplo ${index + 1}</h3><div class="example-grid"><div><strong>Entrada</strong><pre><code>${this.escapeHtml(testCase.inputData || '(vazio)')}</code></pre></div><div><strong>Saída esperada</strong><pre><code>${this.escapeHtml(testCase.expectedOutput)}</code></pre></div></div></div>`).join('')
      : '<p class="muted">Este exercício não possui exemplos públicos.</p>';

    const guideToggle = document.getElementById('guide-toggle');
    guideToggle?.addEventListener('click', () => {
      const panel = document.getElementById('guided-panel');
      const expanded = guideToggle.getAttribute('aria-expanded') === 'true';
      guideToggle.setAttribute('aria-expanded', String(!expanded));
      guideToggle.textContent = expanded ? 'Mostrar orientação' : 'Modo guiado';
      panel?.classList.toggle('is-collapsed', expanded);
    });

    await this.initEditor();
    const runBtn = document.getElementById('run-btn');
    runBtn.disabled = false;
    runBtn.addEventListener('click', () => this.runCode());
    this.handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        this.runCode();
      }
    };
    document.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    window.exerciseDraftGuard = this.draftGuard;
  },

  async initEditor() {
    const monaco = await this.loadMonaco();
    const draftKey = `javastudy_draft:${this.exercise.slug}`;
    let draft = null;
    try { draft = localStorage.getItem(draftKey); } catch { /* storage can be unavailable */ }
    this.editor = monaco.editor.create(document.getElementById('editor-container'), {
      value: draft ?? this.exercise.starterCode ?? '', language: 'java',
      theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs',
      automaticLayout: true, minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', tabSize: 2,
      wordWrap: 'on', scrollBeyondLastLine: false, renderLineHighlight: 'all', accessibilitySupport: 'on'
    });
    this.editorChangeDisposable = this.editor.onDidChangeModelContent(() => {
      this.isDirty = true;
      const status = document.getElementById('draft-status');
      if (status) status.textContent = 'Salvando rascunho...';
      clearTimeout(this.draftTimer);
      this.draftTimer = setTimeout(() => {
        try { localStorage.setItem(draftKey, this.editor.getValue()); } catch { /* ignore storage failures */ }
        this.isDirty = false;
        if (status) status.textContent = 'Rascunho salvo automaticamente';
      }, 500);
    });
    this.themeObserver = new MutationObserver(() => monaco.editor.setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs'));
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  },

  loadMonaco() {
    if (window.monaco) return Promise.resolve(window.monaco);
    return import('monaco-editor').then((monaco) => { window.monaco = monaco; return monaco; });
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
    try {
      const response = await window.apiClient.post(`/api/exercises/slug/${this.exercise.slug}/run`, { code });
      this.renderResult(response, consoleEl, resultHeader);
      window.toast?.[response.passed ? 'success' : 'warning'](response.passed ? `Todos os testes passaram. +${response.xpEarned} XP` : 'Alguns testes falharam. Revise seu código.');
      this.isDirty = false;
      this.loadExecutionHistory();
    } catch (error) {
      consoleEl.innerHTML = `<div class="console-line error">Erro: ${this.escapeHtml(error.message)}</div>`;
      resultHeader.innerHTML = `<div class="result-card failed"><strong>Não foi possível executar</strong><span>${this.escapeHtml(error.message)}</span></div>`;
      window.toast?.error(error.message);
    } finally {
      this.isRunning = false;
      this.setRunningState(false);
    }
  },

  async loadExecutionHistory() {
    if (!this.exercise?.id) return;
    const list = document.getElementById('execution-history-list');
    try {
      const attempts = await window.apiClient.get(`/api/gamification/history/exercise/${this.exercise.id}`);
      const count = document.getElementById('history-count');
      if (count) count.textContent = `${attempts.length} ${attempts.length === 1 ? 'registro' : 'registros'}`;
      if (!attempts.length) { list.innerHTML = '<p class="muted">Ainda não há execuções. Seu primeiro teste aparecerá aqui.</p>'; return; }
      list.innerHTML = attempts.map((attempt) => `<div class="history-row"><span class="badge badge-status ${attempt.passed ? 'passed' : 'failed'}">${attempt.passed ? '✓ Passou' : '✗ Falhou'}</span><span>${this.formatDate(attempt.createdAt)}</span><span>${attempt.xpEarned > 0 ? `+${attempt.xpEarned} XP` : 'Sem XP'}</span></div>`).join('');
    } catch {
      list.innerHTML = '<p class="muted">O histórico deste exercício está temporariamente indisponível.</p>';
    }
  },

  renderResult(response, consoleEl, resultHeader) {
    const passed = response.passed;
    const results = response.testResults || [];
    resultHeader.innerHTML = `<div class="result-card ${passed ? 'passed' : 'failed'}"><div><strong>${passed ? 'Todos os testes passaram!' : 'Alguns testes falharam'}</strong><span>${passed ? `+${response.xpEarned} XP conquistado` : 'Revise o código e tente novamente'}</span></div><div class="result-metrics"><span>${results.filter((test) => test.passed).length}/${results.length} testes</span><span>${response.executionTimeMs ?? 0}ms</span></div></div>`;
    consoleEl.innerHTML = results.length ? results.map((test) => `<div class="console-line ${test.passed ? 'success' : 'error'}">Teste ${test.testNumber}: ${test.passed ? '✓ PASSOU' : '✗ FALHOU'}</div>${!test.passed ? `<div class="console-line output">Entrada: ${this.escapeHtml(test.input)}</div><div class="console-line output">Esperado: ${this.escapeHtml(test.expectedOutput)}</div><div class="console-line error">Obtido: ${this.escapeHtml(test.actualOutput || '(vazio)')}</div>` : ''}`).join('') : `<div class="console-line output">${this.escapeHtml(response.output || response.error || '')}</div>`;
  },

  setRunningState(running) {
    const button = document.getElementById('run-btn');
    if (button) button.disabled = running;
    const text = button?.querySelector('.btn-text');
    const loading = button?.querySelector('.btn-loading');
    if (text) text.style.display = running ? 'none' : 'inline';
    if (loading) loading.style.display = running ? 'inline-block' : 'none';
  },

  draftGuard: {
    shouldBlock(path) { return Boolean(ExerciseDetailPage.isDirty && !path.startsWith(`/exercises/${ExerciseDetailPage.exercise?.slug || ''}`)); }
  },

  beforeUnloadHandler(event) { if (ExerciseDetailPage.isDirty) { event.preventDefault(); event.returnValue = ''; } },

  dispose() {
    clearTimeout(this.draftTimer);
    this.editorChangeDisposable?.dispose();
    this.themeObserver?.disconnect();
    this.editor?.dispose();
    this.editor = null;
    if (this.handleKeyDown) document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    if (window.exerciseDraftGuard === this.draftGuard) delete window.exerciseDraftGuard;
  },

  formatDate(value) { return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); },
  formatCategory(value) { return ({ ALGORITHMS: 'Algoritmos', OO_PATTERNS: 'Padrões OO', JAVA_CORE: 'Java Core', CONCURRENCY: 'Concorrência' })[value] || value || ''; },
  formatDifficulty(value) { return ({ EASY: 'Fácil', MEDIUM: 'Médio', HARD: 'Difícil' })[value] || 'Dificuldade'; },
  escapeHtml(text) { const div = document.createElement('div'); div.textContent = text ?? ''; return div.innerHTML; },
  renderMarkdown(text) { if (!text) return '<p>Descrição indisponível.</p>'; return `<p>${this.escapeHtml(text).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>')}</p>`; }
};
