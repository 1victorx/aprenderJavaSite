// Simple SPA Router
export class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.notFoundRoute = null;
    this.navigationVersion = 0;
  }

  add(path, component, meta = {}) {
    const regex = this.pathToRegex(path);
    this.routes.push({ path, regex, component, meta });
    return this;
  }

  notFound(component) {
    this.notFoundRoute = component;
    return this;
  }

  pathToRegex(path) {
    const pattern = path
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, '(?<$1>[^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  match(pathname) {
    for (const route of this.routes) {
      const match = pathname.match(route.regex);
      if (match) {
        return { route, params: match.groups || {} };
      }
    }
    return { route: null, params: {} };
  }

  navigate(path) {
    this.navigationVersion += 1;
    window.location.hash = path;
    // resolve will be called by hashchange listener
  }

  getNavigationVersion() {
    return this.navigationVersion;
  }

  resolve(path) {
    const pathname = path.split('?')[0];
    const search = path.split('?')[1] || '';
    
    const { route, params } = this.match(pathname);
    
    if (route) {
      this.currentRoute = { ...route, params, search };
      
      // Check auth requirement
      if (!route.meta.public && !window.authStore?.isAuthenticated) {
        this.navigate('/login');
        return;
      }
      
      // Redirect authenticated users from auth pages
      if (route.meta.public && window.authStore?.isAuthenticated && (pathname === '/login' || pathname === '/register')) {
        this.navigate('/');
        return;
      }
    } else if (this.notFoundRoute) {
      this.currentRoute = { component: this.notFoundRoute, params: {}, meta: {} };
    }
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  getQueryParams() {
    if (!this.currentRoute?.search) return {};
    return Object.fromEntries(new URLSearchParams(this.currentRoute.search));
  }
}