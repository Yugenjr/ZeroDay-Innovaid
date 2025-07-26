// Complete Script Error Suppression System
// This script completely eliminates all script error popups

(function() {
  'use strict';
  
  console.log('🛡️ Error Suppression System Activated');
  
  // Override window.onerror to suppress all script errors
  window.onerror = function(message, source, lineno, colno, error) {
    console.log('🔇 Script error suppressed:', {
      message: message,
      source: source,
      line: lineno,
      column: colno,
      error: error
    });
    
    // Return true to prevent the default browser error handling
    return true;
  };
  
  // Override window.onunhandledrejection to suppress promise rejections
  window.onunhandledrejection = function(event) {
    console.log('🔇 Promise rejection suppressed:', event.reason);
    event.preventDefault();
    return true;
  };
  
  // Override addEventListener to catch and suppress errors
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'error' || type === 'unhandledrejection') {
      const wrappedListener = function(event) {
        console.log('🔇 Event error suppressed:', event);
        event.preventDefault();
        event.stopPropagation();
        return false;
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // Suppress React error overlay
  if (window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__) {
    window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.isFatalError = () => false;
  }
  
  // Suppress console errors that might trigger overlays
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('Script error') || 
        message.includes('Uncaught') ||
        message.includes('runtime error')) {
      console.log('🔇 Console error suppressed:', ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  console.log('✅ Error Suppression System Ready');
})();
