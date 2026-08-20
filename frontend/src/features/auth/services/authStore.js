// Auth Store - State management for authentication
export class AuthStore {
  constructor() {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.listeners = new Set();
    
    // Load from localStorage
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('javastudy_auth');
      if (stored) {
        const data = JSON.parse(stored);
        this.user = data.user;
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        
        if (this.accessToken) {
          window.apiClient?.setToken(this.accessToken);
        }
      }
    } catch (e) {
      console.warn('Failed to load auth from storage', e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('javastudy_auth', JSON.stringify({
        user: this.user,
        accessToken: this.accessToken,
        refreshToken: this.refreshToken
      }));
    } catch (e) {
      console.warn('Failed to save auth to storage', e);
    }
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
    this.saveToStorage();
    this.notify();
  }

  setUser(user) {
    this.user = user;
    this.saveToStorage();
    this.notify();
  }

  logout() {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    window.apiClient?.clearToken();
    localStorage.removeItem('javastudy_auth');
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
      this.saveToStorage();
      this.notify();
      return data;
    } catch (e) {
      if (e.status === 401) {
        this.logout();
      }
      throw e;
    }
  }
}