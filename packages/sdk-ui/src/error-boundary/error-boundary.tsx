import { Component, ReactNode } from 'react';
import ErrorBoundaryBox from './error-boundary-box';
import { SisenseContextPayload } from '../sisense-context/sisense-context';

/**
 * @internal
 */
interface ErrorBoundaryProps {
  showErrorBox?: boolean;
  error?: Error | string;
  children: ReactNode;
  resetKeys?: any[];
}

type ErrorBoundaryState = { error: Error | string | null };

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

  context: SisenseContextPayload;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.showErrorBox = props.showErrorBox ?? true;
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    if (prevState.error !== null && hasArrayChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null });
    }
  }

  render() {
    const error = this.state.error || this.props.error;
    if (error) {
      return this.showErrorBox ? <ErrorBoundaryBox errorText={error.toString()} /> : <div />;
    }

    return this.props.children;
  }
}

function hasArrayChanged(a: any[] = [], b: any[] = []) {
  return a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));
}
