import { Component, ReactNode, isValidElement } from 'react';
import ErrorBoundaryBox from './error-boundary-box';
import { AbstractTranslatableError } from '@ethings-os/sdk-common';
import isEqual from 'lodash-es/isEqual';

/**
 * @internal
 */
interface ErrorBoundaryProps {
  showErrorBox?: boolean;
  error?: AbstractTranslatableError | Error | string;
  children: ReactNode;
  resetKeys?: any[];
  onError?: (error: Error) => void | ReactNode;
  isContainerComponent?: boolean;
  /** If set to true, children will be rendered when an error is provided via props, but not when caught during rendering */
  shouldRenderChildrenWithProvidedError?: boolean;
}

type ErrorBoundaryState = {
  error: AbstractTranslatableError | Error | string | null;
  customErrorUI: ReactNode | null;
};

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

  onError?: (error: Error) => void | ReactNode;

  isContainerComponent: boolean;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.onError = props.onError;
    this.isContainerComponent = props.isContainerComponent || false;
    this.state = { error: null, customErrorUI: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error, customErrorUI: null };
  }

  componentDidCatch(error: Error) {
    const errorObj = error instanceof Error ? error : new Error(error);

    // Call onError and check if it returns a ReactNode
    if (this.onError) {
      const customErrorUI = this.onError(errorObj);

      // If the return value is a valid React element, store it
      if (customErrorUI !== undefined && isValidElement(customErrorUI)) {
        this.setState({ error, customErrorUI });
        return;
      }
    }

    this.setState({ error });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    // Reset error state if resetKeys have changed
    if (prevState.error !== null && hasArrayChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null, customErrorUI: null });
    }

    // Handle custom UI for errors passed via props
    if (
      this.props.error &&
      !prevProps.error &&
      !prevState.error &&
      !this.state.error &&
      this.onError
    ) {
      const errorObj =
        this.props.error instanceof Error ? this.props.error : new Error(String(this.props.error));

      const customErrorUI = this.onError(errorObj);

      if (customErrorUI !== undefined && isValidElement(customErrorUI)) {
        this.setState({ customErrorUI });
      }
    }
  }

  render() {
    const { error: caughtError, customErrorUI } = this.state;
    const {
      shouldRenderChildrenWithProvidedError,
      showErrorBox,
      error: errorFromProps,
      children,
    } = this.props;
    const finalError = caughtError || errorFromProps;

    // if there is no error, render children
    if (!finalError) {
      return children;
    }

    // If the error came from props and shouldRenderChildrenWithProvidedError is true, render children
    if (errorFromProps && !caughtError && shouldRenderChildrenWithProvidedError) {
      return children;
    }

    // if the error is present, but error boxes should not be shown, render null
    if (!showErrorBox) {
      return null;
    }

    // If we have a custom error UI from onError, use it instead of the default error box
    if (customErrorUI) {
      return customErrorUI;
    }

    // Otherwise use the default error box
    return <ErrorBoundaryBox error={finalError} />;
  }
}

function hasArrayChanged(a: any[] = [], b: any[] = []) {
  return a.length !== b.length || a.some((item, index) => !isEqual(item, b[index]));
}
