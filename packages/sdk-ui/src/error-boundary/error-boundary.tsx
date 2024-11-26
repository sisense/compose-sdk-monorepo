import { Component, ReactNode } from 'react';
import ErrorBoundaryBox from './error-boundary-box';
import { AbstractTranslatableError } from '@sisense/sdk-common';
import isEqual from 'lodash-es/isEqual';

/**
 * @internal
 */
interface ErrorBoundaryProps {
  showErrorBox?: boolean;
  error?: AbstractTranslatableError | Error | string;
  children: ReactNode;
  resetKeys?: any[];
  onError?: (error: Error) => void;
  isContainerComponent?: boolean;
}

type ErrorBoundaryState = { error: AbstractTranslatableError | Error | string | null };

/**
 * This component is used to catch errors thrown by the UI component and display an error message
 *
 * @param props - component properties
 * @param props.children - The chart to render
 * @returns A ErrorBoundaryBox component with specific error message
 * @internal
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  showErrorBox = true;

  onError?: (error: Error) => void;

  isContainerComponent: boolean;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.showErrorBox = props.showErrorBox ?? true;
    this.onError = props.onError;
    this.isContainerComponent = props.isContainerComponent || false;
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.setState({ error });
    this.onError?.(error instanceof Error ? error : new Error(error));
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    if (prevState.error !== null && hasArrayChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null });
    }
  }

  render() {
    const error = this.state.error || this.props.error;
    if (!error || (this.isContainerComponent && !this.showErrorBox)) {
      return this.props.children;
    }
    return this.showErrorBox ? <ErrorBoundaryBox error={error} /> : null;
  }
}

function hasArrayChanged(a: any[] = [], b: any[] = []) {
  return a.length !== b.length || a.some((item, index) => !isEqual(item, b[index]));
}
