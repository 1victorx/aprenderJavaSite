# ADR-001: Sandbox Strategy - Docker + nsjail

## Status
Accepted

## Context
Precisamos executar código Java submetido pelo usuário de forma segura no backend. O código pode ser malicioso ou conter loops infinitos, acesso a arquivos, rede, etc.

## Decision
Usar container Docker efêmero com nsjail para isolamento forte.

## Alternatives Considered
1. **Java SecurityManager** - Deprecated desde Java 17, inseguro
2. **GraalVM native-image** - Compilação lenta, complexo para sandbox
3. **Docker simples (sem nsjail)** - Menos isolamento, risco de escape
4. **Processo isolado com seccomp** - Complexo de configurar corretamente

## Consequences
### Positive
- Isolamento forte (namespaces: pid, net, ipc, mnt, user, cgroup)
- Limites de recursos via cgroups (CPU, memória, tempo)
- Sem acesso à rede (--network=none)
- Sistema de arquivos read-only exceto /tmp
- Cleanup automático (--rm)

### Negative
- Requer Docker instalado no host
- Latência ~500ms-1s por execução (container startup)
- Complexidade operacional média
- Docker-in-Docker necessário se backend rodar em container

## Implementation Details
- Imagem base: `eclipse-temurin:21-jdk-alpine` (~150MB)
- Interface `Sandbox` para facilitar testes e troca futura
- Implementação `DockerSandboxService` usando Docker Java API
- Timeout: 3s, Memória: 256MB, Disco: 50MB