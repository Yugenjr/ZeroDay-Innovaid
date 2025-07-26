import React, { useEffect } from 'react';
import SimpleLogin from './components/SimpleLogin';

// Global Error Boundary to catch all React errors
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.log('🛡️ Global Error Boundary caught error:', error);
    return { hasError: false }; // Don't show error UI, just suppress
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('🛡️ Global Error Boundary details:', error, errorInfo);
    // Reset error state to continue normal operation
    this.setState({ hasError: false });
  }

  render() {
    return this.props.children;
  }
}

// Disable React error overlay completely
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is no longer supported')) {
      return;
    }
    originalError.apply(console, args);
  };
}

const App: React.FC = () => {
  // Enhanced global error handler to catch script errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('❌ Global script error caught:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
      });

      // Log additional context
      console.error('❌ Error context:', {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });

      // Prevent the error from propagating and causing the "Script error" popup
      event.preventDefault();
      event.stopPropagation();
      return true;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('❌ Unhandled promise rejection:', {
        reason: event.reason,
        promise: event.promise,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
      event.preventDefault();
    };

    // Override console.error to catch more details
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, ['🔍 Enhanced Error Log:', ...args]);
    };

    // Add global error listeners
    window.addEventListener('error', handleError, true); // Use capture phase
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError; // Restore original console.error
    };
  }, []);

  return (
    <GlobalErrorBoundary>
      <div style={{ minHeight: '100vh' }}>
        <SimpleLogin />
      </div>
    </GlobalErrorBoundary>
  );
};

export default App;