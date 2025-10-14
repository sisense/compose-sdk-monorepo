import { Component, ReactNode } from 'react';

import { HttpClient } from '@sisense/sdk-rest-client';
import { ErrorEventOptions } from '@sisense/sdk-tracking';

import { SisenseContext, SisenseContextPayload } from '../../../sisense-context/sisense-context';

type ErrorTrackerProps = {
  children: ReactNode;
  handler: (options: ErrorEventOptions) => Promise<void>;
  componentName: string;
};
export class ErrorTracker extends Component<ErrorTrackerProps, { error: Error | string | null }> {
  componentName: string;

  context: SisenseContextPayload;

  handler: (options: ErrorEventOptions) => Promise<void>;

  httpClient?: HttpClient;

  postponedErrors: Error[] = [];

  constructor(props: ErrorTrackerProps) {
    super(props);
    this.handler = props.handler;
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
        this.sendErrorTracking(error);
      }
    }
    throw error;
  }

  private sendErrorTracking(error: Error) {
    try {
      this.handler({
        packageName: 'sdk-ui',
        packageVersion: __PACKAGE_VERSION__,
        component: this.componentName,
        error,
      });
    } catch (trackingSendingError) {
      console.log('Failed to send tracking error event: ', trackingSendingError);
    }
  }

  render(): ReactNode {
    if (this.httpClient && this.postponedErrors.length > 0) {
      this.postponedErrors.forEach((error) => this.sendErrorTracking(error));
    }
    this.postponedErrors = [];
    return this.props.children;
  }
}
