export const helpers = {
  /**
   * Sanitizes a string to prevent XSS vulnerabilities.
   * @param {string} str - The unsafe string.
   * @returns {string} The HTML-escaped string.
   */
  escapeHtml(str) {
    if (typeof str !== 'string') { return ''; }
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Formats carbon emission values beautifully (kg or tonnes).
   * @param {number|string} kgValue - The carbon emission value in kg.
   * @returns {string} The formatted carbon emission string.
   */
  formatCo2(kgValue) {
    const value = parseFloat(kgValue);
    if (isNaN(value)) { return '0 kg CO₂e'; }
    
    if (value >= 1000) {
      const tonnes = value / 1000;
      return `${tonnes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} t CO₂e`;
    }
    
    return `${Math.round(value).toLocaleString()} kg CO₂e`;
  },

  /**
   * Formats carbon saving values beautifully.
   * @param {number|string} kgValue - The carbon saving value in kg.
   * @returns {string} The formatted saving string.
   */
  formatCo2Saving(kgValue) {
    const value = parseFloat(kgValue);
    if (isNaN(value)) { return '0 kg saved'; }
    
    if (value >= 1000) {
      const tonnes = value / 1000;
      return `${tonnes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} t saved`;
    }
    
    return `${value.toFixed(1)} kg saved`;
  },

  /**
   * Reusable helper to construct DOM elements with class attributes, standard attributes, and child nodes.
   * @param {string} tag - HTML tag name.
   * @param {string|string[]} classes - List of CSS classes.
   * @param {object} attrs - Attributes dictionary.
   * @param {HTMLElement[]|string[]} children - Child DOM nodes or text.
   * @returns {HTMLElement} The created DOM element.
   */
  createElement(tag, classes = [], attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    if (Array.isArray(classes)) {
      classes.forEach(c => {
        if (c) { element.classList.add(c); }
      });
    } else if (typeof classes === 'string' && classes) {
      element.className = classes;
    }

    Object.entries(attrs).forEach(([key, val]) => {
      if (key === 'html') {
        element.innerHTML = val;
      } else if (key === 'text') {
        element.textContent = val;
      } else {
        element.setAttribute(key, val);
      }
    });

    children.forEach(child => {
      if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(child));
      }
    });

    return element;
  },

  // Format date
  formatDate(dateInput) {
    const date = new Date(dateInput);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },

  // Time ago formatter (e.g. 5m ago, 2h ago)
  timeAgo(dateInput) {
    const seconds = Math.floor((new Date() - new Date(dateInput)) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) { return Math.floor(interval) + 'yr ago'; }
    interval = seconds / 2592000;
    if (interval > 1) { return Math.floor(interval) + 'mo ago'; }
    interval = seconds / 86400;
    if (interval > 1) { return Math.floor(interval) + 'd ago'; }
    interval = seconds / 3600;
    if (interval > 1) { return Math.floor(interval) + 'h ago'; }
    interval = seconds / 60;
    if (interval > 1) { return Math.floor(interval) + 'm ago'; }
    return 'Just now';
  },

  // Return category details (icon name, color class, gradient background)
  getCategoryInfo(category) {
    const info = {
      transport: {
        icon: 'car',
        label: 'Transportation',
        color: 'text-blue-400',
        bg: 'bg-blue-950/40 border-blue-900/50',
        gradient: 'from-blue-500 to-indigo-500'
      },
      food: {
        icon: 'beef',
        label: 'Food & Diet',
        color: 'text-orange-400',
        bg: 'bg-orange-950/40 border-orange-900/50',
        gradient: 'from-orange-500 to-amber-500'
      },
      energy: {
        icon: 'zap',
        label: 'Home Energy',
        color: 'text-yellow-400',
        bg: 'bg-yellow-950/40 border-yellow-900/50',
        gradient: 'from-yellow-400 to-amber-500'
      },
      shopping: {
        icon: 'shopping-bag',
        label: 'Shopping',
        color: 'text-pink-400',
        bg: 'bg-pink-950/40 border-pink-900/50',
        gradient: 'from-pink-500 to-rose-500'
      },
      waste: {
        icon: 'trash-2',
        label: 'Waste Management',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40 border-emerald-900/50',
        gradient: 'from-emerald-400 to-teal-500'
      },
      other: {
        icon: 'leaf',
        label: 'General',
        color: 'text-green-400',
        bg: 'bg-green-950/40 border-green-900/50',
        gradient: 'from-green-400 to-emerald-500'
      }
    };
    return info[category] || info.other;
  },

  // Force-render Lucide icons on dynamic elements
  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
};
