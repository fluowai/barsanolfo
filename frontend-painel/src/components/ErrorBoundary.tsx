import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log para console em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('Erro capturado por Error Boundary:', error, errorInfo);
    }

    // Aqui você pode integrar com Sentry ou outro serviço de error tracking
    // Sentry.captureException(error, { contexts: { react: errorInfo } });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>⚠️ Algo deu errado</h1>
            <p style={styles.message}>
              Desculpe, encontramos um erro ao renderizar esta página.
            </p>

            {import.meta.env.DEV && (
              <details style={styles.details}>
                <summary style={styles.summary}>
                  Detalhes do erro (apenas em desenvolvimento)
                </summary>
                <pre style={styles.errorText}>
                  {this.state.error?.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={styles.buttonGroup}>
              <button
                onClick={this.handleReset}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Voltar para Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
  card: {
    backgroundColor: 'white' as const,
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center' as const,
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '24px',
    fontWeight: '600' as const,
    color: '#dc2626',
  },
  message: {
    margin: '0 0 24px 0',
    fontSize: '16px',
    color: '#6b7280',
  },
  details: {
    textAlign: 'left' as const,
    marginBottom: '24px',
    backgroundColor: '#f3f4f6',
    padding: '12px',
    borderRadius: '4px',
  },
  summary: {
    cursor: 'pointer' as const,
    fontWeight: '500' as const,
    color: '#374151',
  },
  errorText: {
    overflow: 'auto' as const,
    fontSize: '12px',
    color: '#111827',
    backgroundColor: '#e5e7eb',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '8px',
    maxHeight: '300px',
  },
  buttonGroup: {
    display: 'flex' as const,
    gap: '12px',
    justifyContent: 'center' as const,
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500' as const,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer' as const,
    transition: 'all 0.3s ease',
  },
  primaryButton: {
    backgroundColor: '#dc2626',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    color: '#111827',
  },
};
