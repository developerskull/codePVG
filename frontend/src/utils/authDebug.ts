/**
 * Authentication Debug Utilities
 * Use these functions to help debug authentication issues
 */

export const clearAllAuthData = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear cookies (if any)
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });
  
  console.log('All authentication data cleared');
};

export const logAuthState = () => {
  console.log('=== Authentication Debug Info ===');
  console.log('localStorage keys:', Object.keys(localStorage));
  console.log('sessionStorage keys:', Object.keys(sessionStorage));
  console.log('Cookies:', document.cookie);
  console.log('================================');
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).clearAllAuthData = clearAllAuthData;
  (window as any).logAuthState = logAuthState;
}
