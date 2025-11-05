/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 */
import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    // Reset error state and reload the page
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-container" style={{ 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ff6b6b' }}>Something went wrong</h1>
          <p style={{ marginTop: '20px', marginBottom: '10px' }}>
            The application encountered an unexpected error.
          </p>
          {this.state.error && (
            <details style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#1a1a1a',
              border: '1px solid #ffffff',
              borderRadius: '5px',
              textAlign: 'left',
              maxWidth: '600px'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Error Details
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                wordWrap: 'break-word',
                fontSize: '0.9em',
                color: '#ff6b6b'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button 
            onClick={this.handleReset}
            style={{ marginTop: '30px' }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

