# ADR-003: Authentication - Stateless JWT (Access Token Only)

## Status
Accepted

## Context
Precisamos de autenticação simples para aplicação local single-user, sem complexidade de sessões server-side ou OAuth.

## Decision
JWT HS256 stateless com access token (30 dias) + refresh token (7 dias) rotation. Armazenado em HttpOnly cookie + localStorage (dupla defesa).

## Alternatives Considered
1. **Session + Cookie** - Requer store server-side (Redis/DB), CSRF protection
2. **JWT com access token curto (15min) + refresh token longo** - Mais seguro, mas complexo para app local
3. **OAuth2/OIDC** - Overkill, requer IdP externo
4. **API Key simples** - Não identifica usuário individualmente

## Consequences
### Positive
- Stateless: não precisa de store server-side
- Simples: apenas validação de assinatura e expiração
- Funciona bem com SPA (Single Page Application)
- Refresh token rotation previne replay attacks
- Logout = apagar tokens cliente (simples)

### Negative
- Revogação imediata não suportada (token válido até expirar)
- Access token longo (30 dias) = janela de exposição maior se vazado
- Refresh token em cookie HttpOnly previne XSS, mas não CSRF (mitigado com SameSite=Lax)
- Não há invalidação server-side de tokens (exceto mudança de secret)

## Mitigations
- JWT secret forte (256+ bits)
- HttpOnly + Secure + SameSite=Lax cookies
- Refresh token rotation a cada uso
- Access token apenas em memory/localStorage (não em cookie)
- Logout limpa ambos os storages

## Implementation Details
```java
// Access Token: 30 dias, HS256
// Refresh Token: 7 dias, HS256, tipo "refresh"
// Cookies: HttpOnly, Secure (prod), SameSite=Lax
// Storage: localStorage (access) + HttpOnly cookie (refresh)
```