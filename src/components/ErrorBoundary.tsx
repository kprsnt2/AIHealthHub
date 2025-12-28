import { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error);
        console.error('Component stack:', errorInfo.componentStack);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="error-boundary"
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                    }}
                >
                    <div
                        style={{
                            textAlign: 'center',
                            maxWidth: '500px',
                            padding: '2rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-subtle)'
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                            ⚠️
                        </div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            marginBottom: '1rem',
                            color: 'var(--text-primary)'
                        }}>
                            Something went wrong
                        </h1>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '1.5rem',
                            lineHeight: 1.6
                        }}>
                            We encountered an unexpected error. Please try refreshing the page or click the button below.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <details style={{
                                marginBottom: '1.5rem',
                                textAlign: 'left',
                                padding: '1rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.85rem'
                            }}>
                                <summary style={{
                                    cursor: 'pointer',
                                    color: 'var(--accent-amber)',
                                    marginBottom: '0.5rem'
                                }}>
                                    Error Details (Development Only)
                                </summary>
                                <pre style={{
                                    overflow: 'auto',
                                    color: 'var(--accent-red)',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="btn btn-primary"
                            style={{
                                padding: '0.75rem 2rem',
                                fontSize: '1rem',
                                background: 'var(--gradient-main)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            🔄 Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
