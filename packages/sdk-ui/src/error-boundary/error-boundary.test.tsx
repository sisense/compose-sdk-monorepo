import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './error-boundary';

// Mock dependencies used by ErrorBoundary and ErrorBoundaryBox
vi.mock('react-i18next', () => ({
  // Mock the useTranslation hook
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'errorBoxText') {
        return options?.errorMessage || 'Error Message';
      }
      return key;
    },
  }),
  // Mock the initReactI18next export
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Mock theme and context dependencies
vi.mock('@/theme-provider/theme-context', () => ({
  useThemeContext: () => ({
    themeSettings: {},
  }),
}));

vi.mock('@/sisense-context/sisense-context', () => ({
  useSisenseContext: () => ({
    app: {},
  }),
}));

// Create a component that will throw an error when rendered
const ThrowError = () => {
  throw new Error('Test error');
};

// Mock console.error to avoid test noise
beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should render error boundary box when error occurs', () => {
    render(
      <ErrorBoundary showErrorBox={true}>
        <ThrowError />
      </ErrorBoundary>,
    );

    // The ErrorBoundaryBox should be rendered
    const errorBox = screen.getByLabelText('error-box');
    expect(errorBox).toBeInTheDocument();
  });

  it('should call onError when error occurs', () => {
    const onErrorMock = vi.fn();

    render(
      <ErrorBoundary onError={onErrorMock} showErrorBox={true}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onErrorMock.mock.calls[0][0].message).toBe('Test error');
  });

  it('should render custom error UI when onError returns a ReactNode', () => {
    const customErrorUI = <div data-testid="custom-error">Custom Error Display</div>;
    const onErrorWithCustomUI = vi.fn().mockReturnValue(customErrorUI);

    render(
      <ErrorBoundary onError={onErrorWithCustomUI} showErrorBox={true}>
        <ThrowError />
      </ErrorBoundary>,
    );

    // The custom error UI should be rendered
    const element = screen.getByTestId('custom-error');
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Custom Error Display')).toBeInTheDocument();
  });

  it('should not render anything for container components with showErrorBox=false', () => {
    const { container } = render(
      <ErrorBoundary isContainerComponent={true} showErrorBox={false}>
        <ThrowError />
      </ErrorBoundary>,
    );

    // Container should be empty
    expect(container.innerHTML).toBe('');
  });

  it('should reset error state when resetKeys change', () => {
    const TestComponent = ({ counter }: { counter: number }) => {
      if (counter === 0) {
        throw new Error('Test error');
      }
      return <div data-testid="child">Counter: {counter}</div>;
    };

    const { rerender } = render(
      <ErrorBoundary resetKeys={[0]}>
        <TestComponent counter={0} />
      </ErrorBoundary>,
    );

    // Error occurred, ErrorBoundaryBox should be shown
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();

    // Change resetKeys to trigger componentDidUpdate
    rerender(
      <ErrorBoundary resetKeys={[1]}>
        <TestComponent counter={1} />
      </ErrorBoundary>,
    );

    // Error state should be reset, component should render normally
    const element = screen.getByTestId('child');
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Counter: 1')).toBeInTheDocument();
  });

  it('should render error boundary box for error passed via props', () => {
    render(
      <ErrorBoundary error={new Error('Provided error')} showErrorBox={true}>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>,
    );

    // The ErrorBoundaryBox should be rendered
    const errorBox = screen.getByLabelText('error-box');
    expect(errorBox).toBeInTheDocument();
    // Children should not be rendered
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('should render children when shouldRenderChildrenWithProvidedError=true and error is provided via props', () => {
    render(
      <ErrorBoundary
        error={new Error('Provided error')}
        shouldRenderChildrenWithProvidedError={true}
        showErrorBox={true}
      >
        <div data-testid="child">Child content</div>
      </ErrorBoundary>,
    );

    // Children should be rendered despite the error
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();

    // No error box should be shown
    expect(screen.queryByLabelText('error-box')).not.toBeInTheDocument();
  });

  it('should still show error UI for caught errors even when shouldRenderChildrenWithProvidedError=true', () => {
    render(
      <ErrorBoundary shouldRenderChildrenWithProvidedError={true} showErrorBox={true}>
        <ThrowError />
      </ErrorBoundary>,
    );

    // The ErrorBoundaryBox should be rendered for caught errors
    const errorBox = screen.getByLabelText('error-box');
    expect(errorBox).toBeInTheDocument();
  });

  it('should render custom error UI for errors passed via props', () => {
    const customErrorUI = <div data-testid="custom-error">Custom Error For Prop</div>;
    const onErrorWithCustomUI = vi.fn().mockReturnValue(customErrorUI);

    const { rerender } = render(
      <ErrorBoundary onError={onErrorWithCustomUI}>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>,
    );

    // Initially, children should render normally
    expect(screen.getByTestId('child')).toBeInTheDocument();

    // Now provide an error via props
    rerender(
      <ErrorBoundary
        onError={onErrorWithCustomUI}
        error={new Error('Prop error')}
        showErrorBox={true}
      >
        <div data-testid="child">Child content</div>
      </ErrorBoundary>,
    );

    // The custom error UI should be rendered
    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    expect(screen.getByText('Custom Error For Prop')).toBeInTheDocument();

    // Children should not be rendered
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();

    // onError should have been called
    expect(onErrorWithCustomUI).toHaveBeenCalledTimes(1);
    expect(onErrorWithCustomUI.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onErrorWithCustomUI.mock.calls[0][0].message).toBe('Prop error');
  });
});
