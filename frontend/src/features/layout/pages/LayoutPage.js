// Layout Page Wrapper - Ensures authenticated routes have layout
export const LayoutPage = {
  render() {
    return ''; // Layout is rendered by main.js
  },

  afterRender() {
    if (!window.authStore?.isAuthenticated) {
      window.router?.navigate('/login');
      return;
    }
    if (window.router?.getCurrentRoute()?.path === '/') {
      window.router?.navigate('/dashboard');
    }
  }
};