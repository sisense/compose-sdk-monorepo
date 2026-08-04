/** @vitest-environment jsdom */
import type { ReactNode } from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, Mock, vi } from 'vitest';

import { useThemeContext } from '@/infra/contexts/theme-provider';

import type { InfoButtonConfig, TitleEditorConfig, WidgetHeaderConfig } from './types';
import { WidgetHeader } from './widget-header';
import { WidgetHeaderMenu } from './widget-header-menu';
import { WidgetHeaderToolbar } from './widget-header-toolbar';

vi.mock('@/infra/contexts/theme-provider', () => ({
  useThemeContext: vi.fn(),
}));

vi.mock('./widget-header-toolbar', () => ({
  WidgetHeaderToolbar: vi.fn(() => <div data-testid="widget-header-toolbar">Toolbar</div>),
}));

vi.mock('./widget-header-menu', () => ({
  WidgetHeaderMenu: vi.fn(() => <div data-testid="widget-header-menu">Menu</div>),
}));

const mockUseThemeContext = useThemeContext as Mock;
const mockWidgetHeaderToolbar = WidgetHeaderToolbar as Mock;
const mockWidgetHeaderMenu = WidgetHeaderMenu as Mock;

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

  it('renders toolbar with infoButtonConfig, onRefresh and styleOptions', () => {
    const onRefresh = vi.fn();
    const infoButtonConfig: InfoButtonConfig = {
      dataSetName: 'Sample ECommerce',
      description: 'Sample dataset',
    };
    const styleOptions = { backgroundColor: '#f0f0f0' };

    render(
      <WidgetHeader
        title="Widget"
        infoButtonConfig={infoButtonConfig}
        onRefresh={onRefresh}
        styleOptions={styleOptions}
      />,
    );

    expect(mockWidgetHeaderToolbar).toHaveBeenCalledWith(
      expect.objectContaining({
        infoButtonConfig,
        onRefresh,
        styleOptions,
      }),
      undefined,
    );
  });

  it('renders the menu with config.menu', () => {
    const config: WidgetHeaderConfig = {
      menu: {
        enabled: true,
        items: [{ type: 'action', id: 'export', caption: 'Export', onClick: vi.fn() }],
      },
    };

    const { getByTestId } = render(
      <WidgetHeader
        title="Widget"
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={vi.fn()}
        config={config}
      />,
    );

    expect(getByTestId('widget-header-menu')).toBeInTheDocument();
    expect(mockWidgetHeaderMenu).toHaveBeenCalledWith({ config: config.menu }, undefined);
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

  it('passes config undefined to the menu when config is not provided', () => {
    render(
      <WidgetHeader
        title="Widget"
        infoButtonConfig={defaultInfoButtonConfig}
        onRefresh={vi.fn()}
      />,
    );

    expect(mockWidgetHeaderMenu).toHaveBeenCalledWith({ config: undefined }, undefined);
  });

  describe('title editing (rename) render path', () => {
    const makeTitleEditor = (overrides: Partial<TitleEditorConfig> = {}): TitleEditorConfig => ({
      isEditing: false,
      onCommit: vi.fn(),
      onCancel: vi.fn(),
      onEditingChange: vi.fn(),
      ...overrides,
    });

    it('renders the title through the inline editor (not editing) when titleEditor is provided', () => {
      const { getByText, container } = render(
        <WidgetHeader
          title="My Widget Title"
          infoButtonConfig={defaultInfoButtonConfig}
          onRefresh={vi.fn()}
          titleEditor={makeTitleEditor({ isEditing: false })}
        />,
      );

      expect(
        container.querySelector('[data-component="inline-text-editor-text"]'),
      ).toBeInTheDocument();
      expect(getByText('My Widget Title')).toBeInTheDocument();
    });

    it('renders an input pre-filled with the title when isEditing is true', () => {
      const { container } = render(
        <WidgetHeader
          title="My Widget Title"
          infoButtonConfig={defaultInfoButtonConfig}
          onRefresh={vi.fn()}
          titleEditor={makeTitleEditor({ isEditing: true })}
        />,
      );

      const input = container.querySelector<HTMLInputElement>(
        '[data-component="inline-text-editor-input"]',
      );
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('My Widget Title');
    });

    it('commits the edited title on Enter', async () => {
      const user = userEvent.setup();
      const onCommit = vi.fn();
      const { getByRole } = render(
        <WidgetHeader
          title="Old Title"
          infoButtonConfig={defaultInfoButtonConfig}
          onRefresh={vi.fn()}
          titleEditor={makeTitleEditor({ isEditing: true, onCommit })}
        />,
      );

      const input = getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'New Title');
      await user.keyboard('{Enter}');

      expect(onCommit).toHaveBeenCalledWith('New Title');
    });

    it('cancels editing on Escape', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const onCommit = vi.fn();
      const { getByRole } = render(
        <WidgetHeader
          title="Old Title"
          infoButtonConfig={defaultInfoButtonConfig}
          onRefresh={vi.fn()}
          titleEditor={makeTitleEditor({ isEditing: true, onCancel, onCommit })}
        />,
      );

      const input = getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Discarded');
      await user.keyboard('{Escape}');

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onCommit).not.toHaveBeenCalled();
    });

    it('renders the plain title (no inline editor) when titleEditor is absent', () => {
      const { container, getByText } = render(
        <WidgetHeader
          title="My Widget Title"
          infoButtonConfig={defaultInfoButtonConfig}
          onRefresh={vi.fn()}
        />,
      );

      expect(getByText('My Widget Title')).toBeInTheDocument();
      expect(
        container.querySelector('[data-component="inline-text-editor-text"]'),
      ).not.toBeInTheDocument();
    });
  });
});
