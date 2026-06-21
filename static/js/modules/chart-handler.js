/**
 * Chart Handler Module
 * Manages chart creation and table comparisons
 */

let currentChart = null;

/**
 * Create bar chart
 */
export function createBarChart(data, columnName, oldChart) {
  if (oldChart) {
    oldChart.destroy();
  }

  const ctx = document.getElementById('dataChart').getContext('2d');
  
  const labels = Object.keys(data);
  const values = Object.values(data);
  const colors = generateChartColors(labels.length);

  currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: columnName,
        data: values,
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#9ca3af' },
          grid: { color: '#374151' }
        },
        x: {
          ticks: { color: '#9ca3af' },
          grid: { color: '#374151' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#e5e7eb' }
        }
      }
    }
  });

  document.getElementById('chartTitle').textContent = `Bar Chart - ${columnName}`;
  document.getElementById('chartSection').classList.remove('hidden');
  
  return currentChart;
}

/**
 * Create pie chart
 */
export function createPieChart(data, columnName, oldChart) {
  if (oldChart) {
    oldChart.destroy();
  }

  const ctx = document.getElementById('dataChart').getContext('2d');
  
  const labels = Object.keys(data);
  const values = Object.values(data);
  const colors = generateChartColors(labels.length);

  currentChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#e5e7eb',
            padding: 15,
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  document.getElementById('chartTitle').textContent = `Pie Chart - ${columnName}`;
  document.getElementById('chartSection').classList.remove('hidden');
  
  return currentChart;
}

/**
 * Generate chart colors
 */
export function generateChartColors(count) {
  const baseColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];
  
  const background = [];
  const border = [];
  
  for (let i = 0; i < count; i++) {
    const color = baseColors[i % baseColors.length];
    background.push(color + '99');
    border.push(color);
  }
  
  return { background, border };
}

/**
 * Display table comparison
 */
export function displayTableComparison(data) {
  const headers = Object.keys(data[0]);
  const headerRow = document.getElementById('comparisonTableHeader');
  const tbody = document.getElementById('comparisonTableBody');
  
  // Clear existing content
  headerRow.innerHTML = '';
  tbody.innerHTML = '';
  
  // Create header row
  headers.forEach(header => {
    const th = document.createElement('th');
    th.className = 'px-4 py-3 text-left text-gray-300 font-semibold border border-gray-700 bg-gray-800 whitespace-nowrap';
    th.textContent = header;
    headerRow.appendChild(th);
  });
  
  // Create data rows
  data.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    tr.className = 'border-t border-gray-700 hover:bg-gray-700/50 transition';
    
    headers.forEach(header => {
      const td = document.createElement('td');
      td.className = 'px-4 py-3 text-gray-400 border border-gray-700 text-sm';
      const value = row[header] !== undefined ? row[header] : '-';
      td.textContent = String(value).substring(0, 100);
      td.title = String(value);
      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  });
  
  // Update row count
  document.getElementById('comparisonRowCount').textContent = `Showing ${data.length} of ${data.length} rows`;
}

/**
 * Get current chart instance
 */
export function getCurrentChart() {
  return currentChart;
}

/**
 * Clear current chart
 */
export function clearChart() {
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
}
