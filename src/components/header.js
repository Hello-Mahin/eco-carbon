import { storage } from '../utils/storage.js';
import { helpers } from '../utils/helpers.js';

export function renderHeader(titleText = 'Dashboard', subtitleText = 'Your sustainability overview') {
  const title = helpers.createElement('h1', 'header-title', { text: titleText });
  const subtitle = helpers.createElement('span', 'header-subtitle', { text: subtitleText });
  const titleContainer = helpers.createElement('div', 'header-title-container', {}, [title, subtitle]);

  // Actions
  const currentTheme = storage.getTheme();
  const themeIconName = currentTheme === 'dark' ? 'sun' : 'moon';
  const themeToggleIcon = helpers.createElement('i', [], { 'data-lucide': themeIconName });
  const themeBtn = helpers.createElement('button', 'theme-toggle', { title: 'Toggle Theme' }, [themeToggleIcon]);
  
  themeBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nextTheme);
    storage.setTheme(nextTheme);
    
    // Toggle icon
    themeBtn.innerHTML = '';
    const newIconName = nextTheme === 'dark' ? 'sun' : 'moon';
    const newIcon = helpers.createElement('i', [], { 'data-lucide': newIconName });
    themeBtn.appendChild(newIcon);
    helpers.refreshIcons();
  });

  // Notification button (mock click shows alert)
  const bellIcon = helpers.createElement('i', [], { 'data-lucide': 'bell' });
  const bellBtn = helpers.createElement('button', 'notifications-toggle', { title: 'Notifications' }, [bellIcon]);
  
  bellBtn.addEventListener('click', () => {
    import('./toast.js').then(m => {
      m.toast.info('You have no new alerts. Keep carbon tracking!');
    });
  });

  const actions = helpers.createElement('div', 'header-actions', {}, [themeBtn, bellBtn]);
  const header = helpers.createElement('header', 'header', {}, [titleContainer, actions]);

  return header;
}
