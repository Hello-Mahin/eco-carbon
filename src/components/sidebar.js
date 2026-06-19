import { storage } from '../utils/storage.js';
import { helpers } from '../utils/helpers.js';

export function renderSidebar() {
  const profile = storage.getProfile();
  
  // Sidebar Logo
  const logoIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  logoIcon.setAttribute("class", "sidebar-logo-icon");
  logoIcon.setAttribute("viewBox", "0 0 24 24");
  logoIcon.setAttribute("fill", "none");
  logoIcon.setAttribute("stroke", "currentColor");
  logoIcon.setAttribute("stroke-width", "2");
  
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 9.5q-1.2 3.6-4 6.5C13.5 19.5 12.3 20 11 20z");
  logoIcon.appendChild(path);

  const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute("d", "M19 2c-2.26 4.33-5.27 7.14-8 10");
  logoIcon.appendChild(path2);

  const logoTitle = helpers.createElement('span', [], { text: 'EcoCarbon' });
  const logo = helpers.createElement('div', 'sidebar-logo', {}, [logoIcon, logoTitle]);

  // Navigation Items
  const navItems = [
    { href: '#dashboard', icon: 'layout-dashboard', text: 'Dashboard' },
    { href: '#calculator', icon: 'calculator', text: 'Calculator' },
    { href: '#tracker', icon: 'calendar-days', text: 'Tracker' },
    { href: '#insights', icon: 'sparkles', text: 'AI Insights' },
    { href: '#goals', icon: 'award', text: 'Goals & Badges' },
    { href: '#analytics', icon: 'bar-chart-3', text: 'Analytics' },
    { href: '#compare', icon: 'globe', text: 'Global Rank' },
    { href: '#profile', icon: 'settings', text: 'Settings' }
  ];

  const nav = helpers.createElement('nav', 'sidebar-nav');
  
  navItems.forEach(item => {
    const linkIcon = helpers.createElement('i', [], { 'data-lucide': item.icon });
    const linkText = helpers.createElement('span', [], { text: item.text });
    const link = helpers.createElement('a', 'sidebar-link', { href: item.href }, [linkIcon, linkText]);
    
    // Highlight if active
    const currentHash = window.location.hash || '#landing';
    if (currentHash.split('?')[0] === item.href) {
      link.classList.add('active');
    }

    nav.appendChild(link);
  });

  // Profile footer
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'EW';
  const avatar = helpers.createElement('div', 'sidebar-avatar', { text: initials });
  
  const profName = helpers.createElement('span', 'sidebar-profile-name', { text: profile.name });
  const profLevel = helpers.createElement('span', 'sidebar-profile-level', { text: `Level ${profile.level}` });
  const profInfo = helpers.createElement('div', 'sidebar-profile-info', {}, [profName, profLevel]);

  const profileStub = helpers.createElement('div', 'sidebar-profile-stub', {}, [avatar, profInfo]);
  profileStub.addEventListener('click', () => {
    window.location.hash = '#profile';
  });

  const sidebar = helpers.createElement('div', 'sidebar', {}, [logo, nav, profileStub]);

  // Setup sidebar hide/show behaviors for mobile responsive toggle
  return sidebar;
}
