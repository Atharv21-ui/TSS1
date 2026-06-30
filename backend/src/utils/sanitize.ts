/**
 * Secure input sanitization and validation utilities
 */

/**
 * Escapes HTML characters to prevent Cross-Site Scripting (XSS)
 */
export const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Ensures the input is a clean, escaped string.
 * Prevents NoSQL object injection by coercing input to string.
 */
export const sanitizeString = (input: any, maxLength = 1000): string => {
  if (input === undefined || input === null) return '';
  
  // Coerce to string and truncate to prevent DoS via huge inputs
  const str = String(input).slice(0, maxLength);
  return escapeHTML(str.trim());
};

/**
 * Validates and sanitizes email format
 */
export const sanitizeEmail = (input: any): string => {
  const str = sanitizeString(input, 254).toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(str) ? str : '';
};

/**
 * Sanitizes and validates a number (ensures it is positive and non-negative)
 * Prevents business logic flaws like negative values.
 */
export const sanitizePositiveNumber = (input: any, defaultValue = 0): number => {
  const num = Number(input);
  if (isNaN(num) || num < 0) {
    return defaultValue;
  }
  return num;
};

/**
 * Sanitizes a price string (coerces to number, keeps positive, formats back to string)
 */
export const sanitizePrice = (input: any, defaultValue = '0$'): string => {
  if (typeof input === 'string') {
    // Strip everything except numbers and decimal point
    const numericStr = input.replace(/[^0-9.]/g, '');
    const num = parseFloat(numericStr);
    if (isNaN(num) || num < 0) return defaultValue;
    return `${num}$`;
  }
  
  const num = Number(input);
  if (isNaN(num) || num < 0) return defaultValue;
  return `${num}$`;
};
