/**
 * UI Handler Module
 * Manages UI interactions and display updates
 */

/**
 * Add chat message to chat window
 */
export function addChatMessage(sender, message, data = null) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

  let content = '';
  if (sender === 'user') {
    content = `
      <div class="bg-sky-600 text-white rounded-lg rounded-tr-none px-4 py-3 max-w-xs break-words">
        <p class="text-sm">${escapeHtml(message)}</p>
      </div>
    `;
  } else {
    content = `
      <div class="bg-gray-700 text-gray-100 rounded-lg rounded-tl-none px-4 py-3 max-w-sm break-words">
        <p class="text-sm whitespace-pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;
  }

  messageDiv.innerHTML = content;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Show visualization section
 */
export function showVisualizationSection() {
  document.getElementById('visualizationSection').classList.remove('hidden');
}

/**
 * Hide visualization section
 */
export function hideVisualizationSection() {
  document.getElementById('visualizationSection').classList.add('hidden');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Show notification
 */
export function showNotification(message, type = 'info') {
  const notificationDiv = document.createElement('div');
  
  let bgColor = 'bg-blue-600';
  if (type === 'success') bgColor = 'bg-green-600';
  if (type === 'error') bgColor = 'bg-red-600';
  if (type === 'warning') bgColor = 'bg-yellow-600';
  
  notificationDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
  notificationDiv.textContent = message;
  
  document.body.appendChild(notificationDiv);
  
  setTimeout(() => {
    notificationDiv.remove();
  }, 3000);
}

/**
 * Disable chat input
 */
export function disableChatInput() {
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  if (chatInput) chatInput.disabled = true;
  if (sendBtn) sendBtn.disabled = true;
}

/**
 * Enable chat input
 */
export function enableChatInput() {
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  if (chatInput) chatInput.disabled = false;
  if (sendBtn) sendBtn.disabled = false;
}

/**
 * Update bot status
 */
export function updateBotStatus(status) {
  const botStatus = document.getElementById('botStatus');
  if (botStatus) {
    botStatus.textContent = status;
  }
}

/**
 * Clear chat messages
 */
export function clearChat() {
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
    addChatMessage('bot', '🧹 Chat cleared! You can ask new questions about your data.');
  }
}
