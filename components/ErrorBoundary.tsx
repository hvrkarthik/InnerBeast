import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <AlertTriangle size={64} color="#EF4444" />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. Please try again.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.errorDetails}>
                {this.state.error.toString()}
              </Text>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <RefreshCw size={20} color="#FFFFFF" />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});