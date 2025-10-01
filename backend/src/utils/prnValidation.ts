import pool from './database';

/**
 * Validates PRN format
 * Common PRN formats:
 * - alphanumeric: ABC123456, 21BCE1234
 * - numeric: 2021001234
 */
export const validatePRNFormat = (prn: string): boolean => {
  // Remove spaces and convert to uppercase
  const cleanPRN = prn.trim().toUpperCase();
  
  // Check if PRN is between 6-20 characters
  if (cleanPRN.length < 6 || cleanPRN.length > 20) {
    return false;
  }
  
  // Allow alphanumeric characters
  const prnRegex = /^[A-Z0-9]+$/;
  return prnRegex.test(cleanPRN);
};

/**
 * Check if PRN is already registered
 */
export const isPRNExists = async (prn: string): Promise<boolean> => {
  const cleanPRN = prn.trim().toUpperCase();
  
  const result = await pool.query(
    'SELECT id FROM users WHERE UPPER(prn) = $1',
    [cleanPRN]
  );
  
  return result.rows.length > 0;
};

/**
 * Validate PRN and check for duplicates
 */
export const validatePRN = async (prn: string): Promise<{ valid: boolean; message?: string }> => {
  if (!prn || prn.trim() === '') {
    return { valid: false, message: 'PRN is required' };
  }
  
  if (!validatePRNFormat(prn)) {
    return { valid: false, message: 'Invalid PRN format. PRN should be 6-20 alphanumeric characters.' };
  }
  
  const exists = await isPRNExists(prn);
  if (exists) {
    return { valid: false, message: 'This PRN is already registered' };
  }
  
  return { valid: true };
};
