/** @vitest-environment jsdom */
import type { ReactNode } from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';

import { useThemeContext } from '@/infra/contexts/theme-provider';

import type { InfoButtonConfig } from './types';
import { WidgetHeader } from './widget-header';
import { WidgetHeaderToolbar } from './widget-header-toolbar';

vi.mock('@/infra/contexts/theme-provider', () => ({
  useThemeContext: vi.fn(),
}));

vi.mock('./widget-header-toolbar', () => ({
  WidgetHeaderToolbar: vi.fn(() => <div data-testid="widget-header-toolbar">Toolbar</div>),
}));

const mockUseThemeContext = useThemeContext as Mock;
const mockWidgetHeaderToolbar = WidgetHeaderToolbar as Mock;

const defaultThemeSettings = {
  themeSettings: {
    widget: {
      header: {
        backgroundColor: '#FFFFFF',
        titleTextColor: '#5B6372',
        titleFontSize: 15,
        titleAlignment: 'Left',
        dividerLine: false,
        dividerLineColor: '#e6e6e6',
      },
    },
    typography: {
      fontFamily: '"Open Sans",sans-serif',
    },
  },
};

const defaultInfoButtonConfig: InfoButtonConfig = {};

describe('WidgetHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseThemeContext.mockReturnValue(defaultThemeSettings);
  });

  it('renders title from props', () => {
    const { getByText } = render(
      <WidgetHeader
        title="My Widget Title"
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={vi.fn()}
      />,
    );

    expect(getByText('My Widget Title')).toBeInTheDocument();
  });

  it('renders without title when title is not provided', () => {
    const { getByTestId } = render(
      <WidgetHeader infoButtonConfig={defaultInfoButtonConfig} onRefresh={vi.fn()} />,
    );

    expect(getByTestId('widget-header-toolbar')).toBeInTheDocument();
  });

  it('uses renderTitle from styleOptions when provided', () => {
    const renderTitle = vi.fn((title: ReactNode) => (
      <span data-testid="custom-title">Custom: {title}</span>
    ));
    const { getByTestId } = render(
      <WidgetHeader
        title="Original Title"
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={vi.fn()}
        styleOptions={{ renderTitle }}
      />,
    );

    expect(renderTitle).toHaveBeenCalledWith('Original Title');
    expect(getByTestId('custom-title')).toHaveTextContent('Custom: Original Title');
  });

  it('renders toolbar with infoButtonConfig, onRefresh, styleOptions and config.toolbar', () => {
    const onRefresh = vi.fn();
    const infoButtonConfig: InfoButtonConfig = {
      dataSetName: 'Sample ECommerce',
      description: 'Sample dataset',
    };
    const styleOptions = { backgroundColor: '#f0f0f0' };
    const config = {
      toolbar: {
        menu: { enabled: true, items: [] },
      },
    };

    render(
      <WidgetHeader
        title="Widget"
        infoButtonConfig={infoButtonConfig}
        onRefresh={onRefresh}
        styleOptions={styleOptions}
        config={config}
      />,
    );

    expect(mockWidgetHeaderToolbar).toHaveBeenCalledWith(
      expect.objectContaining({
        infoButtonConfig,
        onRefresh,
        styleOptions,
        config: config.toolbar,
      }),
      undefined,
    );
  });

  it('does not render divider when theme dividerLine is false and no styleOptions', () => {
    const { container } = render(
      <WidgetHeader infoButtonConfig={defaultInfoButtonConfig} onRefresh={vi.fn()} />,
    );

    const headerRoot = container.querySelector('[data-component="widget-header"]');
    expect(headerRoot?.children.length).toBe(1);
  });

  it('renders divider when theme dividerLine is true', () => {
    mockUseThemeContext.mockReturnValue({
      themeSettings: {
        ...defaultThemeSettings.themeSettings,
        widget: {
          ...defaultThemeSettings.themeSettings.widget,
          header: {
            ...defaultThemeSettings.themeSettings.widget.header,
            dividerLine: true,
          },
        },
      },
    });

    const { container } = render(
      <WidgetHeader infoButtonConfig={defaultInfoButtonConfig} onRefresh={vi.fn()} />,
    );

    const headerRoot = container.querySelector('[data-component="widget-header"]');
    expect(headerRoot?.children.length).toBe(2);
    expect(container.querySelector('[data-component="widget-header-divider"]')).toBeInTheDocument();
  });

  it('renders divider when styleOptions dividerLine is true', () => {
    const { container } = render(
      <WidgetHeader
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={vi.fn()}
        styleOptions={{ dividerLine: true }}
      />,
    );

    const headerRoot = container.querySelector('[data-component="widget-header"]');
    expect(headerRoot?.children.length).toBe(2);
    expect(container.querySelector('[data-component="widget-header-divider"]')).toBeInTheDocument();
  });

  it('passes styleOptions to toolbar so header styles can be applied', () => {
    const styleOptions = { backgroundColor: '#abcdef' };
    render(
      <WidgetHeader
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={vi.fn()}
        styleOptions={styleOptions}
      />,
    );

    expect(mockWidgetHeaderToolbar).toHaveBeenCalledWith(
      expect.objectContaining({ styleOptions }),
      undefined,
    );
  });

  it('passes config undefined to toolbar when config is not provided', () => {
    render(
      <WidgetHeader
        title="Widget"
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={vi.fn()}
      />,
    );

    expect(mockWidgetHeaderToolbar).toHaveBeenCalledWith(
      expect.objectContaining({
        config: undefined,
      }),
      undefined,
    );
  });
});
