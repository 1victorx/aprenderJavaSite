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
mvn spring-boot:run
```
Backend roda em `http://localhost:8080/api`

No PowerShell do Windows, use:

```powershell
cd backend
$env:JWT_SECRET = "gere-uma-chave-secreta-com-pelo-menos-32-caracteres"
mvn spring-boot:run
```

Em desenvolvimento local, o projeto possui um perfil `local` com uma chave temporária automática para evitar que o backend fique indisponível por configuração ausente. Sempre forneça `JWT_SECRET` em ambientes compartilhados, Docker e produção.

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend roda em `http://localhost:5173`

Se o cadastro mostrar “Não foi possível conectar”, confirme primeiro que o backend está em execução na porta `8080`. O frontend encaminha `/api` para esse backend durante o desenvolvimento.

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
- Cookies HttpOnly para a sessão; o frontend mantém o token apenas em memória
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
- `GET /api/exercises` - Listar (paginado, busca `q`, filtros `category`, `difficulty` e `status`)
- `GET /api/exercises/{id}` - Detalhe
- `GET /api/exercises/slug/{slug}` - Detalhe por slug
- `POST /api/exercises/{id}/run` - Executar código
- `GET /api/gamification/history/exercise/{id}` - Últimas execuções do exercício atual

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
npm run test:e2e:install # uma vez, para instalar o Chromium do Playwright
npm run test:e2e
```

O E2E inicia backend e frontend automaticamente. Para rodar apenas o frontend, use `npm run dev`.

### GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` publica o frontend em:
`https://1victorx.github.io/aprenderJavaSite/`.

GitHub Pages não executa Spring Boot, H2 ou o sandbox Java. Para cadastro, login e progresso funcionarem no endereço publicado, configure a variável de repositório `VITE_API_BASE_URL` com a URL HTTPS do backend e inclua essa origem na política CORS do backend. Depois, execute o workflow `Publish JavaStudy to GitHub Pages` ou faça push na `master`.

O repositório é público e o workflow está habilitado para publicação automática. A variável `VITE_API_BASE_URL` ainda precisa apontar para uma implantação real do backend; sem ela, o frontend abre, mas informa que a API está indisponível.

### Backend hospedado

O arquivo `render.yaml` prepara uma implantação do backend em um serviço Docker gerenciado. Ele usa H2 para o primeiro deploy e mantém a execução de código desabilitada quando não existe um sandbox Docker conectado. Isso evita executar código enviado por usuários dentro do processo público da API.

Para uma implantação completa, o ambiente precisa fornecer um Docker socket isolado e persistência de banco. Depois de criar o serviço no provedor, copie a URL HTTPS gerada para `VITE_API_BASE_URL` nas variáveis do repositório e confirme que `CORS_ALLOWED_ORIGINS` contém `https://1victorx.github.io`.

O H2 em serviços gratuitos pode perder dados ao reiniciar. Antes de uso real por mais de uma pessoa, migre o datasource para PostgreSQL e mantenha o sandbox em infraestrutura isolada.

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
