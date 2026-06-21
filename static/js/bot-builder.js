/**
 * Bot Builder Main Script
 * Handles data upload, preview, chat, and visualization
 */

import authService from '../firebase-auth.js';
import { db } from '../firebase-config.js';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
  parseCSV, 
  displayDataPreview, 
  searchData, 
  getFieldValue, 
  getProductName 
} from './modules/data-processor.js';
import { generateResponse } from './modules/response-generator.js';
import { 
  createBarChart, 
  createPieChart, 
  generateChartColors,
  displayTableComparison 
} from './modules/chart-handler.js';
import { 
  addChatMessage, 
  showVisualizationSection 
} from './modules/ui-handler.js';

// Global state
let currentData = [];
let uploadedFile = null;
let currentUser = null;
let currentChart = null;

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const uploadProgress = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressBar');
const botStatus = document.getElementById('botStatus');
const tableSearch = document.getElementById('tableSearch');

/**
 * Initialize auth listener
 */
authService.initAuthListener((user) => {
  currentUser = user;
  if (user) {
    authService.getUserData(user.uid).then(userData => {
      if (userData) {
        document.getElementById('botUsername').textContent = `Welcome, ${userData.username}`;
      }
    });
  }
});

/**
 * Load template from session storage if available
 */
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('template') === 'true') {
  const templateData = sessionStorage.getItem('templateData');
  const templateName = sessionStorage.getItem('templateName');
  if (templateData) {
    currentData = JSON.parse(templateData);
    uploadedFile = templateName + '.csv';
    document.getElementById('botStatus').textContent = `Loaded: ${templateName}`;
    displayDataPreview(currentData);
    document.getElementById('chatInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    sessionStorage.removeItem('templateData');
    sessionStorage.removeItem('templateName');
  }
}

/**
 * File upload event listeners
 */
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-sky-500', 'bg-sky-500/10');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('border-sky-500', 'bg-sky-500/10');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-sky-500', 'bg-sky-500/10');
  handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) {
    handleFile(e.target.files[0]);
  }
});

/**
 * Handle file upload
 */
function handleFile(file) {
  if (!file) return;
  
  uploadedFile = file;
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      let data = [];
      const content = e.target.result;
      
      console.log('File loaded:', file.name, 'Size:', content.length);

      if (file.name.endsWith('.csv')) {
        data = parseCSV(content);
      } else if (file.name.endsWith('.json')) {
        data = JSON.parse(content);
        if (!Array.isArray(data)) data = [data];
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        addChatMessage('bot', 'Excel files require additional processing. Please convert to CSV or JSON first.');
        return;
      } else {
        addChatMessage('bot', 'Unsupported file format. Please upload CSV, JSON, or Excel files.');
        return;
      }
      
      console.log('Data parsed:', data.length, 'records');

      if (data.length === 0) {
        addChatMessage('bot', '⚠️ No data found in the file. Please check the file format.');
        return;
      }

      currentData = data;
      displayDataPreview(currentData);
      chatInput.disabled = false;
      sendBtn.disabled = false;
      botStatus.textContent = 'Ready - Data loaded';
      
      // Clear chat
      chatMessages.innerHTML = '';
      addChatMessage('bot', `✅ Great! I've loaded your data with ${data.length} records. What would you like to know?`);
      
      console.log('Display completed successfully');
    } catch (error) {
      console.error('Error:', error);
      addChatMessage('bot', '❌ Error parsing file: ' + error.message);
    }
  };

  reader.onerror = () => {
    addChatMessage('bot', '❌ Error reading file. Please try again.');
    console.error('File read error');
  };

  reader.readAsText(file);
}

/**
 * Table search functionality
 */
tableSearch.addEventListener('keyup', (e) => {
  const searchValue = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#dataPreview tbody tr');
  
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    if (text.includes(searchValue)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
});

/**
 * Chat form submission
 */
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;
  
  addChatMessage('user', userMessage);
  chatInput.value = '';
  
  // Search and respond
  const results = searchData(userMessage);
  const response = generateResponse(userMessage, results);
  addChatMessage('bot', response);
});

/**
 * Clear chat button
 */
document.getElementById('clearChatBtn').addEventListener('click', () => {
  chatMessages.innerHTML = '';
  addChatMessage('bot', '💬 Chat cleared. Ask me anything about your data!');
});

/**
 * Download data button
 */
document.getElementById('downloadDataBtn').addEventListener('click', () => {
  if (!currentData || currentData.length === 0) {
    alert('No data to download');
    return;
  }

  const headers = Object.keys(currentData[0]);
  let csv = headers.join(',') + '\n';
  
  currentData.forEach(row => {
    const values = headers.map(h => {
      const value = row[h] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csv += values.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `data-export-${new Date().getTime()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
});

/**
 * Export PDF button
 */
document.getElementById('exportPdfBtn').addEventListener('click', () => {
  const element = document.getElementById('chatMessages');
  const opt = {
    margin: 10,
    filename: `chat-export-${new Date().getTime()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };

  html2pdf().set(opt).from(element).save();
});

/**
 * Save bot button
 */
document.getElementById('saveBotBtn').addEventListener('click', async () => {
  if (!currentUser) {
    alert('Please log in to save a bot');
    return;
  }

  const botName = prompt('Enter a name for this bot:');
  if (!botName) return;

  try {
    await addDoc(collection(db, 'bots'), {
      userId: currentUser.uid,
      name: botName,
      data: currentData,
      fileName: uploadedFile.name || 'custom-data',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    addChatMessage('bot', `✅ Bot "${botName}" saved successfully!`);
  } catch (error) {
    console.error('Error saving bot:', error);
    addChatMessage('bot', '❌ Error saving bot: ' + error.message);
  }
});

/**
 * Bar chart button
 */
document.getElementById('barChartBtn').addEventListener('click', () => {
  const selectedColumn = document.getElementById('columnSelector').value;
  
  if (!selectedColumn) {
    alert('Please select a column');
    return;
  }

  if (!currentData || currentData.length === 0) {
    alert('Please upload data first');
    return;
  }

  try {
    const frequency = {};
    currentData.forEach(row => {
      const value = row[selectedColumn];
      if (value !== null && value !== '') {
        frequency[value] = (frequency[value] || 0) + 1;
      }
    });

    createBarChart(frequency, selectedColumn, currentChart);
    document.getElementById('summarySection').classList.add('hidden');
    document.getElementById('tableComparisonSection').classList.add('hidden');
  } catch (error) {
    alert('Error creating chart: ' + error.message);
  }
});

/**
 * Pie chart button
 */
document.getElementById('pieChartBtn').addEventListener('click', () => {
  const selectedColumn = document.getElementById('columnSelector').value;
  
  if (!selectedColumn) {
    alert('Please select a column');
    return;
  }

  if (!currentData || currentData.length === 0) {
    alert('Please upload data first');
    return;
  }

  try {
    const frequency = {};
    currentData.forEach(row => {
      const value = row[selectedColumn];
      if (value !== null && value !== '') {
        frequency[value] = (frequency[value] || 0) + 1;
      }
    });

    createPieChart(frequency, selectedColumn, currentChart);
    document.getElementById('summarySection').classList.add('hidden');
    document.getElementById('tableComparisonSection').classList.add('hidden');
  } catch (error) {
    alert('Error creating chart: ' + error.message);
  }
});

/**
 * Summary button
 */
document.getElementById('summaryBtn').addEventListener('click', () => {
  const selectedColumn = document.getElementById('columnSelector').value;
  
  if (!selectedColumn) {
    alert('Please select a column');
    return;
  }

  if (!currentData || currentData.length === 0) {
    alert('Please upload data first');
    return;
  }

  try {
    const values = currentData.map(row => row[selectedColumn]).filter(v => v !== null && v !== '');
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    
    // Calculate statistics
    const total = values.length;
    const mean = numericValues.length > 0 ? (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2) : 'N/A';
    const max = numericValues.length > 0 ? Math.max(...numericValues).toFixed(2) : 'N/A';
    const min = numericValues.length > 0 ? Math.min(...numericValues).toFixed(2) : 'N/A';
    const median = getMedian(numericValues).toFixed(2) || 'N/A';
    const stdDev = getStandardDeviation(numericValues).toFixed(2) || 'N/A';
    
    // Frequency distribution
    const frequency = {};
    values.forEach(v => {
      frequency[v] = (frequency[v] || 0) + 1;
    });
    
    // Create summary text
    let summaryText = `Column: ${selectedColumn}\n\n`;
    summaryText += `=== STATISTICS ===\n`;
    summaryText += `Total Records: ${total}\n`;
    summaryText += `Unique Values: ${Object.keys(frequency).length}\n`;
    summaryText += `Mean: ${mean}\n`;
    summaryText += `Median: ${median}\n`;
    summaryText += `Standard Deviation: ${stdDev}\n`;
    summaryText += `Maximum: ${max}\n`;
    summaryText += `Minimum: ${min}\n\n`;
    
    summaryText += `=== TOP 10 VALUES ===\n`;
    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sorted.forEach((entry, index) => {
      summaryText += `${index + 1}. ${entry[0]}: ${entry[1]} occurrences\n`;
    });

    // Update UI
    document.getElementById('summaryTotal').textContent = total;
    document.getElementById('summaryMean').textContent = mean;
    document.getElementById('summaryMax').textContent = max;
    document.getElementById('summaryMin').textContent = min;
    document.getElementById('summaryDetails').textContent = summaryText;

    document.getElementById('chartSection').classList.add('hidden');
    document.getElementById('tableComparisonSection').classList.add('hidden');
    document.getElementById('summarySection').classList.remove('hidden');
  } catch (error) {
    alert('Error creating summary: ' + error.message);
  }
});

/**
 * Table comparison button
 */
document.getElementById('tableComparisonBtn').addEventListener('click', () => {
  if (!currentData || currentData.length === 0) {
    alert('Please upload data first');
    return;
  }

  displayTableComparison(currentData);
  document.getElementById('chartSection').classList.add('hidden');
  document.getElementById('summarySection').classList.add('hidden');
  document.getElementById('tableComparisonSection').classList.remove('hidden');
});

/**
 * Close chart button
 */
document.getElementById('closeChartBtn').addEventListener('click', () => {
  document.getElementById('chartSection').classList.add('hidden');
  if (currentChart) {
    currentChart.destroy();
  }
});

/**
 * Close summary button
 */
document.getElementById('closeSummaryBtn').addEventListener('click', () => {
  document.getElementById('summarySection').classList.add('hidden');
});

/**
 * Close comparison button
 */
document.getElementById('closeComparisonBtn').addEventListener('click', () => {
  document.getElementById('tableComparisonSection').classList.add('hidden');
});

/**
 * Search in table comparison
 */
document.getElementById('comparisonTableSearch').addEventListener('keyup', (e) => {
  const searchValue = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#comparisonTableBody tr');
  let visibleCount = 0;
  
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    if (text.includes(searchValue)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  
  document.getElementById('comparisonRowCount').textContent = `Showing ${visibleCount} of ${currentData.length} rows (filtered)`;
});

/**
 * Helper: Calculate Median
 */
function getMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Helper: Calculate Standard Deviation
 */
function getStandardDeviation(arr) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * Populate column selector on data load
 */
function populateColumnSelector(data) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const selector = document.getElementById('columnSelector');
  selector.innerHTML = '<option value="">Select Column</option>';
  
  headers.forEach(header => {
    const option = document.createElement('option');
    option.value = header;
    option.textContent = header;
    selector.appendChild(option);
  });
}

// Export for use in other modules
export { currentData, populateColumnSelector, addChatMessage };
