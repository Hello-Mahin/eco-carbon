import { helpers } from '../utils/helpers.js';
import { gemini } from '../utils/gemini.js';

export function initChatbot() {
  // Prevent duplicate insertion
  if (document.getElementById('chatbot-widget')) return;

  const chatIcon = helpers.createElement('i', [], { 'data-lucide': 'message-square-plus' });
  const bubble = helpers.createElement('div', 'chatbot-bubble', {}, [chatIcon]);

  // Window header
  const robotIcon = helpers.createElement('i', [], { 'data-lucide': 'bot' });
  const titleText = helpers.createElement('div', 'chatbot-header-title', { text: 'EcoBot AI' });
  titleText.prepend(robotIcon);
  const statusIndicator = helpers.createElement('span', 'chatbot-header-subtitle', { text: 'Sustainability Assistant' });
  const headerText = helpers.createElement('div', {}, {}, [titleText, statusIndicator]);

  const closeIcon = helpers.createElement('i', [], { 'data-lucide': 'x' });
  const closeBtn = helpers.createElement('button', 'chatbot-close', {}, [closeIcon]);
  const header = helpers.createElement('div', 'chatbot-header', {}, [headerText, closeBtn]);

  // Message area
  const messagesArea = helpers.createElement('div', 'chatbot-messages');

  // Suggestions row
  const suggestions = [
    { label: 'Diet Impact', text: 'How do I reduce my food carbon footprint?' },
    { label: 'Car vs Bus', text: 'What is the carbon footprint difference between driving a petrol car vs. riding a local bus?' },
    { label: 'LED Energy', text: 'How much carbon dioxide do LED bulbs save?' }
  ];

  const suggestionsContainer = helpers.createElement('div', 'chatbot-suggestions');
  suggestions.forEach(s => {
    const btn = helpers.createElement('button', 'chatbot-suggest-btn', { text: s.label });
    btn.addEventListener('click', () => {
      handleUserSend(s.text);
    });
    suggestionsContainer.appendChild(btn);
  });

  // Input row
  const inputEl = helpers.createElement('input', 'chatbot-input', { type: 'text', placeholder: 'Ask EcoBot anything...' });
  const sendIcon = helpers.createElement('i', [], { 'data-lucide': 'send' });
  const sendBtn = helpers.createElement('button', 'chatbot-send', {}, [sendIcon]);
  const inputContainer = helpers.createElement('div', 'chatbot-input-container', {}, [inputEl, sendBtn]);

  // Chat window
  const windowEl = helpers.createElement('div', 'chatbot-window', {}, [
    header,
    messagesArea,
    suggestionsContainer,
    inputContainer
  ]);

  const widget = helpers.createElement('div', 'chatbot-widget', { id: 'chatbot-widget' }, [bubble, windowEl]);
  document.body.appendChild(widget);

  helpers.refreshIcons();

  // Chat memory history
  let conversationHistory = [];

  // Toggle open
  bubble.addEventListener('click', () => {
    windowEl.classList.toggle('open');
    if (windowEl.classList.contains('open') && messagesArea.children.length === 0) {
      // Add welcome message
      addMessage('ai', "Hello! I'm EcoBot, your AI sustainability guide. Ask me any questions about reducing your carbon footprint, green lifestyle tips, or energy savings!");
    }
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    windowEl.classList.remove('open');
  });

  // Enter to send
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserSend(inputEl.value);
    }
  });

  sendBtn.addEventListener('click', () => {
    handleUserSend(inputEl.value);
  });

  function addMessage(role, text) {
    // Basic markdown replacement helper (bold, bullets, line breaks)
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\s*\*\s*(.*?)/g, '<li>$1</li>')
      .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>') // rough wrapper
      .replace(/\n/g, '<br>');

    // Clean nested ul tags if any
    formattedText = formattedText.replace(/<\/ul><br><ul>/g, '');

    const msgEl = helpers.createElement('div', ['chatbot-msg', role], { html: formattedText });
    messagesArea.appendChild(msgEl);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    // Save to conversation memory
    conversationHistory.push({ role, text });
  }

  function showTypingIndicator() {
    const dot1 = helpers.createElement('div', 'chatbot-dot');
    const dot2 = helpers.createElement('div', 'chatbot-dot');
    const dot3 = helpers.createElement('div', 'chatbot-dot');
    const typingIndicator = helpers.createElement('div', 'chatbot-typing', { id: 'chatbot-typing' }, [dot1, dot2, dot3]);
    messagesArea.appendChild(typingIndicator);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('chatbot-typing');
    if (typing) {
      typing.remove();
    }
  }

  async function handleUserSend(text) {
    if (!text.trim()) return;
    
    // User message
    addMessage('user', text);
    inputEl.value = '';

    // Typing
    showTypingIndicator();

    try {
      // Get AI response
      const response = await gemini.chat(text, conversationHistory.slice(-6)); // send last 3 exchanges (6 items)
      removeTypingIndicator();
      addMessage('ai', response);
    } catch (e) {
      removeTypingIndicator();
      addMessage('ai', "Oops, I encountered a communication error. Please try again or check your settings.");
      console.error(e);
    }
  }
}
