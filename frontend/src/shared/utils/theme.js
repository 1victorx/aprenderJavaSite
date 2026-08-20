// Theme Manager
export class Theme {
  constructor() {
    this.currentTheme = 'dark';
  }

  init() {
    // Check localStorage first
    const stored = localStorage.getItem('javastudy_theme');
    if (stored) {
      this.currentTheme = stored;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }
    this.apply();
  }

  apply() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('javastudy_theme', this.currentTheme);
  }

  toggle() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.apply();
  }

  set(theme) {
    this.currentTheme = theme;
    this.apply();
  }

  get() {
    return this.currentTheme;
  }
}