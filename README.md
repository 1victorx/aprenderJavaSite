# JavaStudy - Plataforma de Prática Diária de Java

Uma aplicação web completa para estudar e praticar Java diariamente com exercícios gamificados, streak, XP, níveis e conquistas.

## Características

- **Exercícios Variados**: Algoritmos, Padrões OO, Java Core, Concorrência
- **Editor de Código**: Monaco Editor (mesmo do VS Code) com syntax highlighting
- **Execução Segura**: Sandbox local com limites de tempo/memória; Docker opcional
- **Gamificação**: XP, Streak diário, Níveis, Conquistas
- **Progresso**: Dashboard com estatísticas, calendário de streak, histórico
- **Tema**: Dark/Light mode com persistência
- **Acessibilidade**: WCAG 2.1 AA
- **Stack**: Spring Boot 3.2 (Java 21) + Vanilla JS + Vite + H2

## Pré-requisitos

- Java 21+
- Maven 3.9+
- Node.js 20+
- Docker (opcional; usado apenas quando `SANDBOX_USE_DOCKER=true`)

## Instalação e Execução

### Desenvolvimento Local

#### Backend
```bash
cd backend
export JWT_SECRET="gere-uma-chave-secreta-com-pelo-menos-32-caracteres"
./mvnw spring-boot:run
```
Backend roda em `http://localhost:8080/api`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend roda em `http://localhost:5173`

### Com Docker Compose (Produção)
```bash
cd docker
docker-compose up -d --build
```
- Frontend: `http://localhost`
- Backend: `http://localhost:8080/api`
- H2 Console: `http://localhost:8080/api/h2-console`

## Estrutura do Projeto

```
java-study/
├── backend/                 # Spring Boot Application
│   ├── src/main/java/com/javastudy/
│   │   ├── auth/           # JWT Authentication
│   │   ├── exercise/       # Exercises CRUD & Execution
│   │   ├── gamification/   # XP, Streak, Achievements
│   │   ├── sandbox/        # Code Execution Sandbox
│   │   ├── user/           # User Management
│   │   └── shared/         # Security, Exceptions, Config
│   └── src/main/resources/
│       └── application.yml
├── frontend/                # Vite + Vanilla JS
│   ├── src/
│   │   ├── app/            # Main entry, router, styles
│   │   ├── features/       # Feature-based modules
│   │   │   ├── auth/
│   │   │   ├── exercises/
│   │   │   ├── gamification/
│   │   │   └── layout/
│   │   └── shared/         # Shared components, utils
│   └── public/
├── docker/                  # Docker files
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── nginx.conf
│   └── docker-compose.yml
└── docs/
    └── adr/                # Architecture Decision Records
```

##  Autenticação

- JWT com expiração de 30 dias
- Refresh token rotation (7 dias)
- Cookies HttpOnly + localStorage (dupla defesa)
- BCrypt para hash de senha (strength 12)

##  Execução de Código (Sandbox)

- Execução local por padrão usando `JavaCompiler` e `ProcessBuilder`
- Container Docker efêmero por execução quando `SANDBOX_USE_DOCKER=true`
- Imagem: `eclipse-temurin:21-jdk-alpine`
- Limites: 3s CPU, 256MB RAM, 50MB disco
- Isolamento: network=none, readonly rootfs, user namespace
- Cleanup automático após execução

##  Gamificação

### XP e Níveis
- Nível 1: 0 XP
- Nível 2: 100 XP
- Nível 3: 300 XP
- Nível 4: 600 XP
- Fórmula: XP = 100 × level × (level + 1) / 2

### Streak
- Incrementa a cada dia com exercício resolvido
- Quebra se pular um dia
- Conquistas: 3, 7, 30 dias

### Conquistas
- **Primeiro Sangue**: Primeiro exercício
- **Streak**: 3, 7, 30 dias
- **Mestres**: 10 exercícios por categoria
- **Poliglota**: 1 de cada categoria
- **Temporais**: Coruja Noturna (00-05h), Madrugador (05-08h), Guerreiro de Fim de Semana

##  Configuração

### Variáveis de Ambiente (Backend)
```yaml
JWT_SECRET: "sua-chave-secreta-de-pelo-menos-256-bits"
JWT_EXPIRATION: 2592000000  # 30 dias
SANDBOX_TIMEOUT: 3          # segundos
SANDBOX_MEMORY: 256         # MB
```

### Banco de Dados
- Desenvolvimento: H2 arquivo (`./data/javastudy.mv.db`)
- Produção: Configure PostgreSQL/MySQL no `application.yml`

##  API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Perfil atual

### Exercícios
- `GET /api/exercises` - Listar (paginado, filtro categoria)
- `GET /api/exercises/{id}` - Detalhe
- `GET /api/exercises/slug/{slug}` - Detalhe por slug
- `POST /api/exercises/{id}/run` - Executar código

### Gamificação
- `GET /api/gamification/dashboard` - Stats do usuário
- `GET /api/gamification/history` - Histórico paginado

##  Testes

```bash
# Backend (Java 21 recomendado; o projeto também compila com JDKs mais novos)
cd backend
export JWT_SECRET="gere-uma-chave-secreta-com-pelo-menos-32-caracteres"
./mvnw test

# Frontend
cd frontend
npm run build
```

##  ADRs (Decisões Arquiteturais)

Veja `docs/adr/` para decisões documentadas:
- ADR-001: Sandbox Strategy (Docker + nsjail)
- ADR-002: Database (H2 File Mode)
- ADR-003: Auth (Stateless JWT)
- ADR-004: Frontend (Vanilla JS + Vite + Monaco)

##  Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

##  Agradecimentos

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Editor de código
- [IBM Plex Fonts](https://github.com/IBM/plex) - Tipografia
- [Lucide Icons](https://lucide.dev/) - Ícones
- [Spring Boot](https://spring.io/projects/spring-boot) - Framework backend
