import { helpers } from '../utils/helpers.js';

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = helpers.createElement('div', 'toast-container');
    document.body.appendChild(toastContainer);
  }
}

export const toast = {
  show(message, type = 'info', duration = 4000) {
    ensureContainer();

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';

    const icon = helpers.createElement('i', [], { 'data-lucide': iconName });
    const textEl = helpers.createElement('span', [], { text: message });
    const toastEl = helpers.createElement('div', ['toast', `toast-${type}`], {}, [icon, textEl]);

    toastContainer.appendChild(toastEl);
    helpers.refreshIcons();

    // Trigger enter animation
    setTimeout(() => {
      toastEl.classList.add('show');
    }, 50);

    // Trigger exit animation & delete
    setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => {
        toastEl.remove();
      }, 300);
    }, duration);
  },

  success(message, duration) {
    this.show(message, 'success', duration);
  },

  error(message, duration) {
    this.show(message, 'error', duration);
  },

  info(message, duration) {
    this.show(message, 'info', duration);
  }
};
