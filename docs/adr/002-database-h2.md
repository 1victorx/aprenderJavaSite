# ADR-002: Database - H2 File Mode

## Status
Accepted

## Context
O projeto é uma aplicação local single-user para estudos. Não queremos dependência externa de banco de dados (PostgreSQL, MySQL) para simplificar setup.

## Decision
Usar H2 em modo arquivo (`jdbc:h2:file:./data/javastudy`) em vez de modo memória.

## Alternatives Considered
1. **H2 em memória** - Dados perdidos ao reiniciar
2. **SQLite** - Requer driver nativo ou JDBC extra, H2 já vem com Spring Boot
3. **PostgreSQL/MySQL** - Overkill para uso local single-user
4. **Arquivo plano (JSON/CSV)** - Sem ACID, sem queries, sem migrações

## Consequences
### Positive
- Zero configuração externa
- Persistência entre reinícios da aplicação
- Compatível com JPA/Hibernate (migração futura para PostgreSQL trivial)
- Console web H2 disponível para debug (`/h2-console`)
- ACID completo, suporte a transações

### Negative
- Não suporta alta concorrência (aceitável para single-user local)
- Lock de arquivo pode causar problemas se múltiplas instâncias
- Backup manual necessário (copiar arquivo .mv.db)

## Implementation Details
```yaml
spring:
  datasource:
    url: jdbc:h2:file:./data/javastudy;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE
  h2:
    console:
      enabled: true
      path: /h2-console
```
- `DDL_AUTO=update` para desenvolvimento
- Arquivo salvo em `backend/data/javastudy.mv.db`