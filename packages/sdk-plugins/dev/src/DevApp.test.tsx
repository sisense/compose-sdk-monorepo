// @vitest-environment jsdom
import React from 'react';

import type { CustomVisualizationProps, WidgetPlugin } from '@sisense/sdk-ui';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DevApp, EnvWarning } from './DevApp.js';

vi.mock('@sisense/sdk-ui', () => ({
  SisenseContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const mockChartComponent = vi.fn((_props: CustomVisualizationProps) => (
  <div data-testid="chart-component" />
));

type DesignPanelTestProps = {
  styleOptions?: Record<string, unknown>;
  onChange: (opts: object) => void;
};

const mockDesignPanelComponent = vi.fn((props: DesignPanelTestProps) => (
  <button data-testid="design-panel" onClick={() => props.onChange({ updated: true })} />
));

// The test fixtures intentionally omit non-essential WidgetPlugin fields.
// `as unknown as WidgetPlugin` documents the coercion explicitly.
const pluginWithWidget = {
  name: 'test-plugin',
  customWidget: {
    visualization: { Component: mockChartComponent },
  },
} as unknown as WidgetPlugin;

const pluginWithDesignPanel = {
  name: 'test-plugin',
  customWidget: {
    visualization: { Component: mockChartComponent },
    designPanel: { Component: mockDesignPanelComponent },
  },
} as unknown as WidgetPlugin;

const pluginWithoutWidget = { name: 'no-widget-plugin' } as unknown as WidgetPlugin;

// Minimal chartProps for tests that don't care about the data shape
const emptyChartProps = {} as unknown as CustomVisualizationProps;

describe('EnvWarning', () => {
  it('renders the configuration required title', () => {
    render(<EnvWarning />);
    expect(screen.getByText('Configuration required')).toBeInTheDocument();
  });

  it('mentions both required env variable names', () => {
    const { container } = render(<EnvWarning />);
    expect(container.textContent).toContain('VITE_APP_SISENSE_URL');
    expect(container.textContent).toContain('VITE_APP_SISENSE_TOKEN');
  });
});

describe('DevApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders EnvWarning when url is missing', () => {
    render(<DevApp plugin={pluginWithWidget} chartProps={emptyChartProps} token="tok" />);
    expect(screen.getByText('Configuration required')).toBeInTheDocument();
  });

  it('renders EnvWarning when token is missing', () => {
    render(
      <DevApp plugin={pluginWithWidget} chartProps={emptyChartProps} url="https://example.com" />,
    );
    expect(screen.getByText('Configuration required')).toBeInTheDocument();
  });

  it('renders EnvWarning when both url and token are missing', () => {
    render(<DevApp plugin={pluginWithWidget} chartProps={emptyChartProps} />);
    expect(screen.getByText('Configuration required')).toBeInTheDocument();
  });

  it('renders MissingCustomWidgetWarning when plugin has no customWidget', () => {
    render(
      <DevApp
        plugin={pluginWithoutWidget}
        chartProps={emptyChartProps}
        url="https://example.com"
        token="tok"
      />,
    );
    expect(screen.getByText('No custom widget defined')).toBeInTheDocument();
    expect(screen.getByText(/no-widget-plugin/)).toBeInTheDocument();
  });

  it('renders the chart visualization component with chartProps', () => {
    const chartProps = {
      styleOptions: { color: 'red' },
      dataOptions: {},
    } as unknown as CustomVisualizationProps;
    render(
      <DevApp
        plugin={pluginWithWidget}
        chartProps={chartProps}
        url="https://example.com"
        token="tok"
      />,
    );
    expect(screen.getByTestId('chart-component')).toBeInTheDocument();
    const lastChartCall = mockChartComponent.mock.calls.at(-1);
    expect(lastChartCall?.[0]).toEqual(expect.objectContaining({ styleOptions: { color: 'red' } }));
  });

  it('does not render design panel when designPanel is not defined', () => {
    render(
      <DevApp
        plugin={pluginWithWidget}
        chartProps={emptyChartProps}
        url="https://example.com"
        token="tok"
      />,
    );
    expect(screen.queryByTestId('design-panel')).not.toBeInTheDocument();
  });

  it('renders design panel component when defined', () => {
    render(
      <DevApp
        plugin={pluginWithDesignPanel}
        chartProps={emptyChartProps}
        url="https://example.com"
        token="tok"
      />,
    );
    expect(screen.getByTestId('design-panel')).toBeInTheDocument();
  });

  it('passes styleOptions from chartProps to both chart and design panel initially', () => {
    const chartProps = {
      styleOptions: { subtype: 'line/spline' },
    } as unknown as CustomVisualizationProps;
    render(
      <DevApp
        plugin={pluginWithDesignPanel}
        chartProps={chartProps}
        url="https://example.com"
        token="tok"
      />,
    );
    const lastDesignPanelCall = mockDesignPanelComponent.mock.calls.at(-1);
    expect(lastDesignPanelCall?.[0]).toEqual(
      expect.objectContaining({ styleOptions: { subtype: 'line/spline' } }),
    );
  });

  it('updates styleOptions when design panel calls onChange', () => {
    const chartProps = {
      styleOptions: { subtype: 'line/basic' },
    } as unknown as CustomVisualizationProps;
    render(
      <DevApp
        plugin={pluginWithDesignPanel}
        chartProps={chartProps}
        url="https://example.com"
        token="tok"
      />,
    );

    fireEvent.click(screen.getByTestId('design-panel'));

    // After onChange, the chart should receive the new styleOptions
    const lastChartCall = mockChartComponent.mock.lastCall;
    expect(lastChartCall?.[0]?.styleOptions).toEqual({ updated: true });
  });
});
