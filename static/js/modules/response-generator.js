/**
 * Response Generator Module
 * Generates intelligent responses based on queries and data
 */

import { getFieldValue, getProductName } from './data-processor.js';

/**
 * Generate response based on query and search results
 */
export function generateResponse(query, results) {
  const lowerQuery = query.toLowerCase();
  
  if (results.length === 0) {
    return `❌ Sorry, I couldn't find anything for "${query}". Try searching differently!`;
  }
  
  // 1. COUNT QUESTIONS
  if (lowerQuery.includes('how many') || lowerQuery.includes('count') || lowerQuery.includes('number of')) {
    return `Found ${results.length} item(s) matching your search.`;
  }
  
  // 2. PRICE QUESTIONS
  if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('rate') || lowerQuery.includes('amount')) {
    if (lowerQuery.includes('highest') || lowerQuery.includes('maximum') || lowerQuery.includes('max')) {
      const highest = results.reduce((max, r) => {
        const price = parseFloat(getFieldValue(r, ['price', 'cost', 'rate', 'amount'])) || 0;
        return price > max.price ? { item: r, price } : max;
      }, { price: 0 });
      
      if (highest.price > 0) {
        const name = getProductName(highest.item);
        return `💰 Highest priced item: ${name} at ₹${highest.price.toLocaleString('en-IN')}`;
      }
    }
    
    if (lowerQuery.includes('lowest') || lowerQuery.includes('minimum') || lowerQuery.includes('min') || lowerQuery.includes('cheapest')) {
      const lowest = results.reduce((min, r) => {
        const price = parseFloat(getFieldValue(r, ['price', 'cost', 'rate', 'amount'])) || Infinity;
        return price < min.price ? { item: r, price } : min;
      }, { price: Infinity });
      
      if (lowest.price < Infinity) {
        const name = getProductName(lowest.item);
        return `💰 Lowest priced item: ${name} at ₹${lowest.price.toLocaleString('en-IN')}`;
      }
    }
    
    if (lowerQuery.includes('average') || lowerQuery.includes('avg')) {
      const prices = results.map(r => parseFloat(getFieldValue(r, ['price', 'cost', 'rate', 'amount'])) || 0).filter(p => p > 0);
      if (prices.length > 0) {
        const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        return `💰 Average price: ₹${avg.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
      }
    }
    
    // Regular price listing
    let priceInfo = results.map((r) => {
      const price = getFieldValue(r, ['price', 'cost', 'rate', 'amount']) || '?';
      const name = getProductName(r);
      return `• ${name}: ₹${price}`;
    }).join('\n');
    return `Found ${results.length} item(s):\n${priceInfo}`;
  }
  
  // 3. BRAND QUESTIONS
  if (lowerQuery.includes('brand') || lowerQuery.includes('manufacturer') || lowerQuery.includes('company')) {
    let brands = [...new Set(results.map(r => getFieldValue(r, ['brand', 'brand_name', 'manufacturer', 'company'])).filter(b => b))];
    if (brands.length > 0) {
      if (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('what')) {
        return `Found ${brands.length} brand(s):\n${brands.map(b => `• ${b}`).join('\n')}`;
      } else {
        return `Available brands: ${brands.join(', ')}`;
      }
    }
  }
  
  // 4. QUANTITY/STOCK QUESTIONS
  if (lowerQuery.includes('quantity') || lowerQuery.includes('stock') || lowerQuery.includes('qty') || lowerQuery.includes('available')) {
    if (lowerQuery.includes('total') || lowerQuery.includes('sum')) {
      const totalQty = results.reduce((sum, r) => {
        const qty = parseFloat(getFieldValue(r, ['quantity', 'qty', 'stock', 'available'])) || 0;
        return sum + qty;
      }, 0);
      return `📊 Total quantity: ${totalQty} units`;
    }
    
    let qtyInfo = results.map((r) => {
      const qty = getFieldValue(r, ['quantity', 'qty', 'stock', 'available']) || '?';
      const name = getProductName(r);
      return `• ${name}: ${qty} units`;
    }).join('\n');
    return `Found ${results.length} item(s):\n${qtyInfo}`;
  }
  
  // 5. COMPARISON QUESTIONS
  if (lowerQuery.includes('compare') || lowerQuery.includes('difference') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
    if (results.length >= 2) {
      let comparison = results.slice(0, 2).map((r, index) => {
        const name = getProductName(r);
        const price = getFieldValue(r, ['price', 'cost', 'rate', 'amount']) || '?';
        const quantity = getFieldValue(r, ['quantity', 'qty', 'stock', 'available']) || '?';
        return `${index + 1}. ${name}\n   Price: ₹${price}\n   Quantity: ${quantity}`;
      }).join('\n\n');
      return `📊 Comparison:\n${comparison}`;
    }
  }
  
  // 6. SPECIFIC ITEM QUESTIONS
  if (lowerQuery.includes('what is') || lowerQuery.includes('tell me about') || lowerQuery.includes('details')) {
    if (results.length > 0) {
      const item = results[0];
      const name = getProductName(item);
      const price = getFieldValue(item, ['price', 'cost', 'rate', 'amount']) || 'N/A';
      const quantity = getFieldValue(item, ['quantity', 'qty', 'stock', 'available']) || 'N/A';
      const brand = getFieldValue(item, ['brand', 'brand_name', 'manufacturer', 'company']) || 'N/A';
      
      return `📋 Details for ${name}:\n• Brand: ${brand}\n• Price: ₹${price}\n• Quantity: ${quantity}`;
    }
  }
  
  // 7. LIST/SHOW QUESTIONS
  if (lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('display') || lowerQuery.includes('all')) {
    let info = results.map((r, index) => {
      const name = getProductName(r);
      const price = getFieldValue(r, ['price', 'cost', 'rate', 'amount']) || '';
      const quantity = getFieldValue(r, ['quantity', 'qty', 'stock', 'available']) || '';
      
      let details = `${index + 1}. ${name}`;
      if (price) details += ` - ₹${price}`;
      if (quantity) details += ` (${quantity} units)`;
      
      return details;
    }).join('\n');
    
    return `📦 Found ${results.length} item(s):\n${info}`;
  }
  
  // 8. CATEGORY/TYPE QUESTIONS
  if (lowerQuery.includes('category') || lowerQuery.includes('type') || lowerQuery.includes('kind')) {
    const categories = [...new Set(results.map(r => getFieldValue(r, ['category', 'type', 'kind', 'classification'])).filter(c => c))];
    if (categories.length > 0) {
      return `📂 Categories found: ${categories.join(', ')}`;
    }
  }
  
  // 9. SEARCH QUESTIONS
  if (lowerQuery.includes('search') || lowerQuery.includes('find') || lowerQuery.includes('look for')) {
    let info = results.map((r) => {
      const name = getProductName(r);
      const price = getFieldValue(r, ['price', 'cost', 'rate', 'amount']) || '';
      const quantity = getFieldValue(r, ['quantity', 'qty', 'stock', 'available']) || '';
      
      let details = `• ${name}`;
      if (price) details += ` - ₹${price}`;
      if (quantity) details += ` (${quantity})`;
      
      return details;
    }).join('\n');
    
    return `🔍 Search results (${results.length} items):\n${info}`;
  }
  
  // 10. DEFAULT RESPONSE
  let info = results.map((r, index) => {
    const name = getProductName(r);
    const price = getFieldValue(r, ['price', 'cost', 'rate', 'amount']) || '';
    const quantity = getFieldValue(r, ['quantity', 'qty', 'stock', 'available']) || '';
    
    let details = `${index + 1}. ${name}`;
    if (price) details += ` - ₹${price}`;
    if (quantity) details += ` (${quantity} units)`;
    
    return details;
  }).join('\n');
  
  return `📦 Found ${results.length} item(s):\n${info}`;
}
