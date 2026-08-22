// Auth Store - State management for authentication
export class AuthStore {
  constructor() {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.listeners = new Set();
    
  }

  get isAuthenticated() {
    return !!this.accessToken && !!this.user;
  }

  get currentUser() {
    return this.user;
  }

  get token() {
    return this.accessToken;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  setTokens(accessToken, refreshToken, user) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (user) this.user = user;
    window.apiClient?.setToken(accessToken);
    this.notify();
  }

  setUser(user) {
    this.user = user;
    this.notify();
  }

  logout() {
    window.apiClient?.post('/api/auth/logout', {}).catch(() => {});
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    window.apiClient?.clearToken();
    this.notify();
  }

  async login(email, password) {
    const data = await window.apiClient.post('/api/auth/login', { email, password });
    this.setTokens(data.accessToken, data.refreshToken, data.user);
    return data;
  }

  async register(name, email, password) {
    const data = await window.apiClient.post('/api/auth/register', { name, email, password });
    this.setTokens(data.accessToken, data.refreshToken, data.user);
    return data;
  }

  async refresh() {
    try {
      const data = await window.apiClient.post('/api/auth/refresh', {});
      this.setTokens(data.accessToken, data.refreshToken, data.user);
      return data;
    } catch (e) {
      this.logout();
      throw e;
    }
  }

  async fetchMe() {
    try {
      const data = await window.apiClient.get('/api/auth/me');
      this.user = data;
      this.notify();
      return data;
    } catch (e) {
      if (e.status === 401) {
        try {
          return await this.refresh();
        } catch {
          this.logout();
        }
      }
      throw e;
    }
  }
}
