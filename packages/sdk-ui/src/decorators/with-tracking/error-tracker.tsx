import { trackUiError } from '@sisense/sdk-common';
import { HttpClient } from '@sisense/sdk-rest-client';
import { Component, ReactNode } from 'react';
import { SisenseContext, SisenseContextPayload } from '../../sisense-context/sisense-context';

type ErrorTrackerProps = {
  children: ReactNode;
  componentName: string;
};
export class ErrorTracker extends Component<ErrorTrackerProps, { error: Error | string | null }> {
  componentName: string;

  context: SisenseContextPayload;

  httpClient?: HttpClient;

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
    if (this.context.enableTracking) {
      trackUiError(
        {
          packageVersion: __PACKAGE_VERSION__,
          component: this.componentName,
          error,
        },
        this.httpClient as HttpClient,
      ).catch(() => console.log('Failed to send tracking error event'));
    }

    throw error;
  }

  render(): ReactNode {
    return this.props.children;
  }
}
