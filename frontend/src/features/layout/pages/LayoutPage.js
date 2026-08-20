// Layout Page Wrapper - Ensures authenticated routes have layout
export const LayoutPage = {
  render() {
    return ''; // Layout is rendered by main.js
  },

  afterRender() {
    // Check authentication
    if (!window.authStore?.isAuthenticated) {
      window.router?.navigate('/login');
    }
  }
};