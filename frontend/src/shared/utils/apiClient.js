// API Client with JWT handling
export class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.accessToken = null;
    this.refreshPromise = null;
  }

  setToken(token) {
    this.accessToken = token;
  }

  clearToken() {
    this.accessToken = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include'
    };

    try {
      let response = await fetch(url, config);

      // Handle 401 - try refresh token
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          // Retry with new token
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          config.headers = headers;
          response = await fetch(url, config);
        } else {
          // Refresh failed, redirect to login
          window.authStore?.logout();
          window.router?.navigate('/login');
          throw new Error('Sessão expirada');
        }
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(response.status, data.code || 'ERROR', data.message || 'Erro na requisição', data.details);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'NETWORK_ERROR', 'Erro de conexão. Verifique sua internet.');
    }
  }

  async tryRefreshToken() {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          this.accessToken = data.accessToken;
          window.authStore?.setTokens(data.accessToken, data.refreshToken);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Convenience methods
  get(endpoint) { return this.request(endpoint, { method: 'GET' }); }
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
}

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}