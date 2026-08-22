// Theme Manager
export class Theme {
  constructor() {
    // The study workspace opens in the warm light theme; dark mode remains
    // available through the header toggle for focused evening sessions.
    this.currentTheme = 'light';
  }

  init() {
    // Check localStorage first
    const stored = localStorage.getItem('javastudy_theme');
    if (stored) {
      this.currentTheme = stored;
    } else {
      this.currentTheme = 'light';
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
