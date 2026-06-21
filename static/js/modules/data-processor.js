/**
 * Data Processor Module
 * Handles data parsing, processing, and field extraction
 */

/**
 * Parse CSV content into array of objects
 */
export function parseCSV(content) {
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must have headers and at least one data row');
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const obj = {};
    const values = lines[i].split(',').map(v => v.trim());
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    data.push(obj);
  }
  
  console.log('CSV parsed:', data.length, 'rows,', headers.length, 'columns');
  return data;
}

/**
 * Display data preview in table format
 */
export function displayDataPreview(data) {
  if (data.length === 0) {
    console.warn('No data to display');
    return;
  }

  const dataPreviewDiv = document.getElementById('dataPreview');
  const headers = Object.keys(data[0]);
  
  let html = '<div style="overflow-x: auto;"><table class="w-full text-sm border-collapse"><thead class="sticky top-0 bg-gray-700"><tr>';
  
  headers.forEach(h => {
    html += `<th class="px-4 py-2 text-left text-gray-300 font-semibold border border-gray-600 bg-gray-700">${h}</th>`;
  });
  html += '</tr></thead><tbody>';

  const displayRows = data.length;
  for (let i = 0; i < displayRows; i++) {
    const row = data[i];
    html += '<tr class="border-t border-gray-700 hover:bg-gray-750">';
    headers.forEach(h => {
      const value = row[h] !== undefined ? row[h] : '';
      html += `<td class="px-4 py-2 text-gray-400 border border-gray-700">${String(value).substring(0, 50)}</td>`;
    });
    html += '</tr>';
  }

  html += '</tbody></table></div>';
  
  dataPreviewDiv.innerHTML = html;
  dataPreviewDiv.style.overflow = 'auto';
  
  const rowCount = document.getElementById('rowCount');
  rowCount.textContent = `Showing all ${data.length} rows`;
  
  // Show data statistics
  const dataSize = JSON.stringify(data).length;
  const dataSizeKB = (dataSize / 1024).toFixed(2);
  document.getElementById('statRows').textContent = data.length;
  document.getElementById('statColumns').textContent = headers.length;
  document.getElementById('statSize').textContent = dataSizeKB + 'KB';
  document.getElementById('dataStats').classList.remove('hidden');
  document.getElementById('tableSearch').classList.remove('hidden');
  
  // Populate column selector
  const selector = document.getElementById('columnSelector');
  selector.innerHTML = '<option value="">Select Column</option>';
  headers.forEach(header => {
    const option = document.createElement('option');
    option.value = header;
    option.textContent = header;
    selector.appendChild(option);
  });
  
  document.getElementById('visualizationSection').classList.remove('hidden');
  
  console.log('Data preview displayed:', displayRows, 'rows');
}

/**
 * Search data based on query
 */
export function searchData(query, currentData) {
  if (!currentData.length) return [];

  const lowerQuery = query.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/);
  
  // List of common product categories
  const categories = ['dairy', 'snacks', 'beverages', 'bakery', 'spices', 'rice', 'flour', 'oil', 'detergent', 'shampoo', 'toothpaste', 'noodles', 'tea', 'coffee', 'juice', 'chips', 'biscuits'];
  
  // Check if query contains a category word
  const categoryMatch = categories.find(cat => lowerQuery.includes(cat));
  if (categoryMatch) {
    return currentData.filter(row => {
      const categoryField = getFieldValue(row, ['category', 'type', 'product_category', 'kind']).toLowerCase();
      return categoryField === categoryMatch || categoryField.includes(categoryMatch);
    });
  }
  
  // Check for specific brand queries first
  const brandMatch = query.match(/^(show|list|find|search|get)\s+(.+?)\s+(laptops?|products?|items?|devices?)$/i);
  if (brandMatch) {
    const brand = brandMatch[2].toLowerCase();
    return currentData.filter(row => {
      const brandField = getFieldValue(row, ['brand', 'brand_name', 'manufacturer', 'company']).toLowerCase();
      return brandField === brand || brandField.includes(brand);
    });
  }
  
  // Check for simple brand name queries
  const simpleBrandMatch = words.length <= 2 && words.some(word => {
    const commonBrands = ['apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'msi', 'samsung', 'amul', 'nandini', 'fortune', 'tata', 'nestle'];
    return commonBrands.includes(word);
  });
  
  if (simpleBrandMatch) {
    const brand = words.find(word => {
      const commonBrands = ['apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'msi', 'samsung', 'amul', 'nandini', 'fortune', 'tata', 'nestle'];
      return commonBrands.includes(word);
    });
    
    return currentData.filter(row => {
      const brandField = getFieldValue(row, ['brand', 'brand_name', 'manufacturer', 'company']).toLowerCase();
      return brandField === brand || brandField.includes(brand);
    });
  }
  
  // Score-based matching for general queries
  const results = currentData.map((row, index) => {
    let score = 0;
    const rowStr = JSON.stringify(row).toLowerCase();
    
    // Check each word in query
    words.forEach(word => {
      if (word.length > 2) {
        // Exact match gets highest score
        if (rowStr.includes(word)) {
          score += 10;
        }
        // Partial match (e.g., "milk" matches "amul milk")
        if (rowStr.includes(word.substring(0, 3))) {
          score += 5;
        }
      }
    });
    
    // Boost score for brand/product name matches
    Object.values(row).forEach(val => {
      const valStr = String(val).toLowerCase();
      if (valStr.includes(lowerQuery)) {
        score += 15;
      }
    });
    
    return { ...row, score, index };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score);
  
  return results;
}

/**
 * Get field value from row by trying multiple possible field names
 */
export function getFieldValue(row, fieldNames) {
  for (let name of fieldNames) {
    const key = Object.keys(row).find(k => k.toLowerCase() === name.toLowerCase());
    if (key && row[key]) return row[key];
  }
  return '';
}

/**
 * Get product name from row
 */
export function getProductName(row) {
  const name = getFieldValue(row, ['name', 'product', 'item', 'title', 'description', 'item_name', 'product_name']);
  if (name) return name;
  
  const numericFields = ['price', 'cost', 'rate', 'amount', 'qty', 'quantity', 'size', 'weight', 'volume'];
  for (let key of Object.keys(row)) {
    const value = String(row[key]);
    const isNumeric = !isNaN(value) && value.trim() !== '';
    const isNumericField = numericFields.some(nf => key.toLowerCase().includes(nf));
    
    if (!isNumeric && !isNumericField && value.trim()) {
      return value;
    }
  }
  
  return 'Product';
}
