/**
 * Input Validators Module
 * Validation functions for user input and data
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and feedback
 */
export function validatePassword(password) {
  const result = {
    isValid: false,
    score: 0,
    feedback: []
  };

  if (password.length < 6) {
    result.feedback.push('Password must be at least 6 characters');
  } else {
    result.score += 1;
  }

  if (!/[a-z]/.test(password)) {
    result.feedback.push('Password should contain lowercase letters');
  } else {
    result.score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    result.feedback.push('Password should contain uppercase letters');
  } else {
    result.score += 1;
  }

  if (!/[0-9]/.test(password)) {
    result.feedback.push('Password should contain numbers');
  } else {
    result.score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    result.feedback.push('Password should contain special characters');
  } else {
    result.score += 1;
  }

  result.isValid = result.score >= 3;
  return result;
}

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid username
 */
export function validateUsername(username) {
  // Username: 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array<string>} allowedTypes - Allowed MIME types
 * @returns {boolean} True if valid file type
 */
export function validateFileType(file, allowedTypes) {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} True if file size is valid
 */
export function validateFileSize(file, maxSizeMB) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate CSV file
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export function validateCsvFile(file) {
  const result = {
    isValid: false,
    errors: []
  };

  if (!file.name.endsWith('.csv')) {
    result.errors.push('File must be a CSV file');
  }

  if (!validateFileType(file, ['text/csv', 'text/plain'])) {
    result.errors.push('Invalid file type. Please upload a CSV file');
  }

  if (!validateFileSize(file, 50)) {
    result.errors.push('File size must be less than 50MB');
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validate JSON file
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export function validateJsonFile(file) {
  const result = {
    isValid: false,
    errors: []
  };

  if (!file.name.endsWith('.json')) {
    result.errors.push('File must be a JSON file');
  }

  if (!validateFileType(file, ['application/json'])) {
    result.errors.push('Invalid file type. Please upload a JSON file');
  }

  if (!validateFileSize(file, 50)) {
    result.errors.push('File size must be less than 50MB');
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export function validatePhoneNumber(phone) {
  // Simple validation for international phone numbers
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate date
 * @param {string} dateStr - Date string to validate (YYYY-MM-DD)
 * @returns {boolean} True if valid date
 */
export function validateDate(dateStr) {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate number
 * @param {*} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {boolean} True if valid number
 */
export function validateNumber(value, options = {}) {
  const num = Number(value);
  
  if (isNaN(num)) {
    return false;
  }

  if (options.min !== undefined && num < options.min) {
    return false;
  }

  if (options.max !== undefined && num > options.max) {
    return false;
  }

  return true;
}

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if valid length
 */
export function validateStringLength(str, min, max) {
  return str.length >= min && str.length <= max;
}

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate required field
 * @param {*} value - Value to check
 * @returns {boolean} True if field is provided
 */
export function validateRequired(value) {
  return value !== null && value !== undefined && value !== '';
}
