import { storage } from './storage.js';

export class Router {
  constructor(routes, containerId) {
    this.routes = routes;
    this.container = document.getElementById(containerId);
    this.currentRoute = null;

    // Listen to hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  init() {
    // Navigate to initial hash or default to landing
    const initialHash = window.location.hash || '#landing';
    this.navigate(initialHash);
  }

  navigate(hash) {
    window.location.hash = hash;
  }

  handleHashChange() {
    let hash = window.location.hash || '#landing';
    
    // Normalize hash
    if (!hash.startsWith('#')) {
      hash = '#' + hash;
    }

    // Check if user is onboarded
    const profile = storage.getProfile();
    
    // Redirect to onboarding page (landing has onboarding quiz) if not onboarded
    if (!profile.onboarded && hash !== '#landing') {
      this.navigate('#landing');
      return;
    }

    // If onboarded and trying to go to landing, redirect to dashboard
    if (profile.onboarded && hash === '#landing') {
      this.navigate('#dashboard');
      return;
    }

    const routeKey = hash.split('?')[0]; // strip query parameters if any
    const renderFunc = this.routes[routeKey];

    if (renderFunc) {
      this.currentRoute = routeKey;
      
      // Update active links in sidebar/nav
      this.updateActiveNavLinks(routeKey);

      // Render the page
      this.container.innerHTML = '';
      const pageEl = renderFunc();
      this.container.appendChild(pageEl);

      // Scroll to top
      window.scrollTo(0, 0);

      // Emit custom navigation event
      window.dispatchEvent(new CustomEvent('page-navigated', { detail: { route: routeKey } }));
    } else {
      console.error(`Route ${routeKey} not found! Redirecting to dashboard.`);
      this.navigate('#dashboard');
    }
  }

  updateActiveNavLinks(routeKey) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      if (link.getAttribute('href') === routeKey) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
export const getQueryParam = (name) => {
  const hash = window.location.hash;
  if (!hash.includes('?')) {
    return null;
  }
  const urlParams = new URLSearchParams(hash.split('?')[1]);
  return urlParams.get(name);
};
