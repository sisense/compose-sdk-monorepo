import { Component, Context, ReactNode } from 'react';
import ErrorBoundaryBox from './ErrorBoundaryBox';
import { SisenseContext, SisenseContextPayload } from '../SisenseContextProvider';
import { trackUiError } from '@sisense/sdk-common';
import { HttpClient } from '@sisense/sdk-rest-client';

/**
 * @internal
 */
interface ErrorBoundaryProps {
  componentName: string;
  showErrorBox?: boolean;
  children: ReactNode;
}

/**
 * This component is used to catch errors thrown by the UI component and display an error message
 *
 * @param props - component properties
 * @param props.children - The chart to render
 * @returns A ErrorBoundaryBox component with specific error message
 * @internal
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { error: Error | string | null }> {
  showErrorBox = true;

  componentName: string;

  context: SisenseContextPayload;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.showErrorBox = props.showErrorBox ?? true;
    this.state = { error: null };
    this.componentName = props.componentName;
  }

  httpClient?: HttpClient;

  static contextType?: Context<SisenseContextPayload> | undefined = SisenseContext;

  componentDidMount() {
    if (this.context.isInitialized) this.httpClient = this.context.app?.httpClient;
  }

  onError = (error: Error | string) => {
    if (this.context.enableTracking)
      // eslint-disable-next-line promise/no-promise-in-callback
      trackUiError(
        {
          packageVersion: __PACKAGE_VERSION__,
          component: this.componentName,
          error,
        },
        this.httpClient as HttpClient,
      ).catch(() => console.log('Failed to send tracking error event'));
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
