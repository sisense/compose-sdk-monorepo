import React, { Component } from 'react';
import ErrorBoundaryBox from './ErrorBoundaryBox';

/**
 * @internal
 */
interface ErrorBoundaryProps {
  showErrorBox: boolean;
  children: React.ReactNode;
}

/**
 * This component is used to catch errors thrown by the SisenseContextProvider and display an error message
 *
 * @param props - component properties
 * @param props.children - The chart to render
 * @returns A ErrorBoundaryBox component with specific error message
 * @internal
 */
export class DisconnectedErrorBoundary extends Component<
  ErrorBoundaryProps,
  { error: Error | string | null }
> {
  showErrorBox = true;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.showErrorBox = props.showErrorBox ?? true;
    this.state = { error: null };
  }

  onError = (error: Error | string) => {
    this.setState({ error });
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.onError(error);
  }

  render() {
    if (this.state.error) {
      return this.showErrorBox ? (
        <ErrorBoundaryBox errorText={this.state.error.toString()} />
      ) : (
        <div />
      );
    }

    return this.props.children;
  }
}
