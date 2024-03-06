import { trackUiError } from '@sisense/sdk-tracking';
import { HttpClient } from '@sisense/sdk-rest-client';
import { Component, ReactNode } from 'react';
import { SisenseContext, SisenseContextPayload } from '../../../sisense-context/sisense-context';

type ErrorTrackerProps = {
  children: ReactNode;
  componentName: string;
};
export class ErrorTracker extends Component<ErrorTrackerProps, { error: Error | string | null }> {
  componentName: string;

  context: SisenseContextPayload;

  httpClient?: HttpClient;

  postponedErrors: Error[] = [];

  constructor(props: ErrorTrackerProps) {
    super(props);
    this.componentName = props.componentName;
  }

  static contextType = SisenseContext;

  componentDidMount() {
    if (this.context.isInitialized) {
      this.httpClient = this.context.app?.httpClient;
    }
  }

  componentDidCatch(error: Error) {
    if (this.context.tracking.enabled) {
      if (!this.httpClient) {
        this.postponedErrors.push(error);
      } else {
        this.sendErrorTracking(error, this.httpClient);
      }
    }
    throw error;
  }

  private sendErrorTracking(error: Error, httpClient: HttpClient) {
    trackUiError(
      {
        packageVersion: __PACKAGE_VERSION__,
        component: this.componentName,
        error,
      },
      httpClient,
    ).catch((trackingSendingError) =>
      console.log('Failed to send tracking error event: ', trackingSendingError),
    );
  }

  render(): ReactNode {
    if (this.httpClient && this.postponedErrors.length > 0) {
      this.postponedErrors.forEach((error) => this.sendErrorTracking(error, this.httpClient!));
    }
    this.postponedErrors = [];
    return this.props.children;
  }
}
