import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Alert } from './alert.js';

describe('Alert component', () => {
  it('renders alert with title and description', () => {
    const { container } = render(<Alert title="Test Title" description="Test Description" />);
    expect(container).toMatchSnapshot();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders error variant correctly', () => {
    const { container } = render(
      <Alert variant="error" title="Error" description="Error message" />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders warning variant correctly', () => {
    const { container } = render(
      <Alert variant="warning" title="Warning" description="Warning message" />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders info variant correctly', () => {
    const { container } = render(<Alert variant="info" title="Info" description="Info message" />);
    expect(container).toMatchSnapshot();
  });

  it('renders without title', () => {
    const { container } = render(<Alert description="Description only" />);
    expect(container).toMatchSnapshot();
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    expect(screen.getByText('Description only')).toBeInTheDocument();
  });

  it('renders dismissible alert with close button', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <Alert dismissible={true} onDismiss={onDismiss} description="Dismissible alert" />,
    );
    expect(container).toMatchSnapshot();
    expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<Alert dismissible={true} onDismiss={onDismiss} description="Test" />);

    const dismissButton = screen.getByLabelText('Dismiss alert');
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when Enter key is pressed on dismiss button', () => {
    const onDismiss = vi.fn();
    render(<Alert dismissible={true} onDismiss={onDismiss} description="Test" />);

    const dismissButton = screen.getByLabelText('Dismiss alert');
    fireEvent.keyDown(dismissButton, { key: 'Enter' });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render dismiss button when dismissible is false', () => {
    render(<Alert dismissible={false} description="Non-dismissible" />);
    expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismissOnClick is true and alert body is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <Alert
        dismissible={true}
        dismissOnClick={true}
        onDismiss={onDismiss}
        description="Click anywhere"
      />,
    );

    const alert = screen.getByRole('alert');
    fireEvent.click(alert);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when dismissOnClick is true and Space key is pressed on alert', () => {
    const onDismiss = vi.fn();
    render(
      <Alert
        dismissible={true}
        dismissOnClick={true}
        onDismiss={onDismiss}
        description="Keyboard dismiss"
      />,
    );

    const alert = screen.getByRole('alert');
    fireEvent.keyDown(alert, { key: ' ' });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
