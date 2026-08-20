# ADR-004: Frontend - Vanilla JS + Vite + Monaco Editor

## Status
Accepted

## Context
Precisamos de um frontend leve, sem framework pesado (React/Vue), para aplicação de estudos focada em código.

## Decision
Vanilla ES Modules + Vite (build/dev) + Monaco Editor (carregamento dinâmico).

## Alternatives Considered
1. **React + Vite** - Ecossistema rico, mas boilerplate e bundle maior
2. **Vue 3 + Vite** - Menor que React, mas ainda framework
3. **Svelte** - Compilado, menor bundle, mas curva de aprendizado
4. **HTMX + Go templates** - Server-side rendering, não SPA
5. **Next.js** - Overkill, SSR desnecessário para app privada

## Consequences
### Positive
- Bundle mínimo (~50KB gzipped sem Monaco)
- Controle total, zero abstrações desnecessárias
- Monaco Editor carrega sob demanda (~2MB apenas na página de exercício)
- Vite: HMR rápido, build otimizado
- ES Modules nativo, sem transpilação complexa
- Fácil de entender e modificar para estudos

### Negative
- Mais boilerplate manual (router, state, components)
- Sem ecossistema de componentes prontos
- Gerenciamento de estado manual (sem Redux/Zustand/Context)
- Reimplementar padrões comuns (forms, modals, toasts)
- Manutenção de código repetitivo

## Mitigations
- Componentes utilitários próprios (Button, Input, Card, Toast, Modal)
- Router simples baseado em `history.pushState`
- Auth store + ApiClient como singletons globais (window.*)
- CSS Variables para design system
- Feature-based folder structure

## Implementation Details
```javascript
// main.js - Bootstrap
// router.js - SPA router com regex
// apiClient.js - Fetch wrapper com JWT + refresh automático
// authStore.js - Estado de auth com localStorage sync
// theme.js - Dark/Light mode com CSS variables
// components/ - Button, Input, Card, Toast, Modal, Pagination
// features/ - auth, exercises, gamification, layout
// Dynamic import: import('monaco-editor') apenas na ExerciseDetailPage
```