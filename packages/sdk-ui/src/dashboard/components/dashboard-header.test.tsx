import { render } from '@testing-library/react';

import { DashboardHeader } from './dashboard-header';

describe('DashboardHeader', () => {
  it('should render and contain provided title', () => {
    const TEST_TITLE = 'Test Title';
    const { getByText } = render(<DashboardHeader title={TEST_TITLE} />);

    expect(getByText(TEST_TITLE)).toBeInTheDocument();
  });

  it('should render without toolbar when not provided', () => {
    const TEST_TITLE = 'Test Title';
    const { getByTestId } = render(<DashboardHeader title={TEST_TITLE} />);
    // Check toolbar container is empty
    expect(getByTestId('dashboard-header-toolbar').textContent).toBe('');
  });

  it('should render toolbar when provided', () => {
    const TEST_TITLE = 'Test Title';
    const TEST_TOOLBAR_CONTENT = 'Toolbar Content';
    const mockToolbar = () => <span data-testid="test-toolbar">{TEST_TOOLBAR_CONTENT}</span>;

    const { getByText, getByTestId } = render(
      <DashboardHeader title={TEST_TITLE} toolbar={mockToolbar} />,
    );

    expect(getByText(TEST_TITLE)).toBeInTheDocument();
    expect(getByTestId('test-toolbar')).toBeInTheDocument();
    expect(getByText(TEST_TOOLBAR_CONTENT)).toBeInTheDocument();
  });

  it('should render multiple toolbar components when provided', () => {
    const TEST_TITLE = 'Test Title';
    const mockToolbar = () => (
      <>
        <button data-testid="button1">Button 1</button>
        <button data-testid="button2">Button 2</button>
        <span data-testid="span1">Extra Content</span>
      </>
    );

    const { getByText, getByTestId } = render(
      <DashboardHeader title={TEST_TITLE} toolbar={mockToolbar} />,
    );

    expect(getByText(TEST_TITLE)).toBeInTheDocument();
    expect(getByTestId('button1')).toBeInTheDocument();
    expect(getByTestId('button2')).toBeInTheDocument();
    expect(getByTestId('span1')).toBeInTheDocument();
  });

  it('should handle toolbar function that returns null', () => {
    const TEST_TITLE = 'Test Title';
    const mockToolbar = () => null;

    const { getByText, getByTestId } = render(
      <DashboardHeader title={TEST_TITLE} toolbar={mockToolbar} />,
    );

    expect(getByText(TEST_TITLE)).toBeInTheDocument();
    // Check that the toolbar div exists but is empty
    const toolbarDiv = getByTestId('dashboard-header-toolbar');
    expect(toolbarDiv).toBeInTheDocument();
    expect(toolbarDiv.textContent).toBe('');
  });
});
