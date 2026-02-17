/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { InfoButtonConfig, MenuItem } from './types';
import { WidgetHeaderToolbar } from './widget-header-toolbar';

vi.mock('./widget-header-info-button', () => ({
  default: ({
    title,
    description,
    errorMessages,
    warningMessages,
    onRefresh,
  }: {
    title?: string;
    description?: string;
    errorMessages?: string[];
    warningMessages?: string[];
    onRefresh: () => void;
  }) => (
    <div
      data-testid="widget-header-info-button"
      data-title={title}
      data-description={description}
      data-error-messages={errorMessages?.join(',')}
      data-warning-messages={warningMessages?.join(',')}
    >
      <button type="button" data-testid="info-button-refresh" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  ),
}));

vi.mock('./widget-menu-button', () => ({
  WidgetMenuButton: ({ menuItems }: { menuItems: MenuItem[] }) => (
    <div data-testid="widget-menu-button" data-menu-items-count={menuItems.length}>
      Menu
    </div>
  ),
}));

describe('WidgetHeaderToolbar', () => {
  const defaultInfoButtonConfig: InfoButtonConfig = {
    dataSetName: 'Sample Data',
    description: 'Sample description',
    errorMessages: [],
    warningMessages: [],
  };
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders info button with passed props', () => {
    const { getByTestId } = render(
      <WidgetHeaderToolbar infoButtonConfig={defaultInfoButtonConfig} onRefresh={mockOnRefresh} />,
    );

    const infoButton = getByTestId('widget-header-info-button');
    expect(infoButton).toBeInTheDocument();
    expect(infoButton).toHaveAttribute('data-title', 'Sample Data');
    expect(infoButton).toHaveAttribute('data-description', 'Sample description');
  });

  it('passes styleOptions to info button when provided', () => {
    const styleOptions = { titleTextColor: '#333' };
    const { getByTestId } = render(
      <WidgetHeaderToolbar
        infoButtonConfig={defaultInfoButtonConfig}
        styleOptions={styleOptions}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(getByTestId('widget-header-info-button')).toBeInTheDocument();
  });

  it('does not render menu button when config is undefined', () => {
    const { queryByTestId } = render(
      <WidgetHeaderToolbar infoButtonConfig={defaultInfoButtonConfig} onRefresh={mockOnRefresh} />,
    );

    expect(queryByTestId('widget-menu-button')).not.toBeInTheDocument();
  });

  it('does not render menu button when config.menu.items is empty', () => {
    const { queryByTestId } = render(
      <WidgetHeaderToolbar
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={mockOnRefresh}
        config={{ menu: { items: [] } }}
      />,
    );

    expect(queryByTestId('widget-menu-button')).not.toBeInTheDocument();
  });

  it('does not render menu button when config.menu.enabled is false', () => {
    const menuItems: MenuItem[] = [{ id: 'export', caption: 'Export', onClick: vi.fn() }];
    const { queryByTestId } = render(
      <WidgetHeaderToolbar
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={mockOnRefresh}
        config={{ menu: { enabled: false, items: menuItems } }}
      />,
    );

    expect(queryByTestId('widget-menu-button')).not.toBeInTheDocument();
  });

  it('renders menu button when config.menu.enabled is undefined (default true) and items are provided', () => {
    const menuItems: MenuItem[] = [{ id: 'export', caption: 'Export', onClick: vi.fn() }];
    const { getByTestId } = render(
      <WidgetHeaderToolbar
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={mockOnRefresh}
        config={{ menu: { items: menuItems } }}
      />,
    );

    const menuButton = getByTestId('widget-menu-button');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('data-menu-items-count', '1');
  });

  it('renders menu button when config.menu.enabled is true and items are provided', () => {
    const menuItems: MenuItem[] = [
      { id: 'export', caption: 'Export', onClick: vi.fn() },
      { id: 'refresh', caption: 'Refresh', onClick: vi.fn() },
    ];
    const { getByTestId } = render(
      <WidgetHeaderToolbar
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={mockOnRefresh}
        config={{ menu: { enabled: true, items: menuItems } }}
      />,
    );

    const menuButton = getByTestId('widget-menu-button');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('data-menu-items-count', '2');
  });

  it('does not render menu button when config.menu.items is undefined', () => {
    const { queryByTestId } = render(
      <WidgetHeaderToolbar
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={mockOnRefresh}
        config={{ menu: { enabled: true } }}
      />,
    );

    expect(queryByTestId('widget-menu-button')).not.toBeInTheDocument();
  });

  it('returns result of renderToolbar when styleOptions.renderToolbar is provided', () => {
    const customToolbar = <div data-testid="custom-toolbar">Custom toolbar</div>;
    const renderToolbar = vi.fn(() => customToolbar);

    const { getByTestId } = render(
      <WidgetHeaderToolbar
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={mockOnRefresh}
        styleOptions={{ renderToolbar }}
      />,
    );

    expect(renderToolbar).toHaveBeenCalledTimes(1);
    expect(renderToolbar).toHaveBeenCalledWith(mockOnRefresh, expect.any(Object));
    expect(getByTestId('custom-toolbar')).toBeInTheDocument();
    expect(getByTestId('custom-toolbar')).toHaveTextContent('Custom toolbar');
  });

  it('calls onRefresh when info button refresh is triggered', async () => {
    const { getByTestId } = render(
      <WidgetHeaderToolbar infoButtonConfig={defaultInfoButtonConfig} onRefresh={mockOnRefresh} />,
    );

    getByTestId('info-button-refresh').click();

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });
});
