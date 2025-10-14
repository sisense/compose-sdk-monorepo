/** @vitest-environment jsdom */
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { IndicatorCanvas } from './indicator-canvas';

// Mock the theme provider
vi.mock('./theme-provider', () => ({
  useThemeContext: () => ({
    themeSettings: {
      chart: {
        backgroundColor: '#ffffff',
      },
    },
  }),
}));

// Mock the Indicator class
vi.mock('./charts/indicator/chart/indicator', () => ({
  Indicator: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
  })),
}));

describe('IndicatorCanvas', () => {
  const mockChartData = {
    type: 'indicator',
    value: 12345.67,
    secondary: 6789.12,
    min: 0,
    max: 50000,
  } as any;

  const mockDataOptions = {
    value: [{ column: { name: 'Revenue', type: 'number' } }],
    secondary: [{ column: { name: 'Cost', type: 'number' } }],
    min: [{ column: { name: 'Min', type: 'number' } }],
    max: [{ column: { name: 'Max', type: 'number' } }],
  } as any;

  const mockDesignOptions = {
    indicatorType: 'gauge',
    indicatorComponents: {
      title: {
        shouldBeShown: true,
        text: 'Test Indicator',
      },
    },
    forceTickerView: false,
  } as any;

  describe('Component rendering', () => {
    it('should render IndicatorCanvas component', () => {
      const { container } = render(
        <IndicatorCanvas
          chartData={mockChartData}
          dataOptions={mockDataOptions}
          designOptions={mockDesignOptions}
        />,
      );

      const indicatorRoot = container.querySelector('[aria-label="indicator-root"]');
      expect(indicatorRoot).toBeInTheDocument();
    });

    it('should render canvas element', () => {
      const { container } = render(
        <IndicatorCanvas
          chartData={mockChartData}
          dataOptions={mockDataOptions}
          designOptions={mockDesignOptions}
        />,
      );

      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('onDataPointClick event handler', () => {
    it('should call onDataPointClick when indicator is clicked', () => {
      const onDataPointClickMock = vi.fn();

      const { container } = render(
        <IndicatorCanvas
          chartData={mockChartData}
          dataOptions={mockDataOptions}
          designOptions={mockDesignOptions}
          onDataPointClick={onDataPointClickMock}
        />,
      );

      const indicatorRoot = container.querySelector('[aria-label="indicator-root"]');
      expect(indicatorRoot).toHaveStyle('cursor: pointer');

      fireEvent.click(indicatorRoot!);

      expect(onDataPointClickMock).toHaveBeenCalledTimes(1);
    });

    it('should pass correct IndicatorDataPoint structure to onDataPointClick', () => {
      const onDataPointClickMock = vi.fn();

      const { container } = render(
        <IndicatorCanvas
          chartData={mockChartData}
          dataOptions={mockDataOptions}
          designOptions={mockDesignOptions}
          onDataPointClick={onDataPointClickMock}
        />,
      );

      const indicatorRoot = container.querySelector('[aria-label="indicator-root"]');
      fireEvent.click(indicatorRoot!);

      expect(onDataPointClickMock).toHaveBeenCalledWith(
        expect.objectContaining({
          entries: expect.objectContaining({
            value: expect.objectContaining({
              value: 12345.67,
              displayValue: '12.35K',
              id: 'value',
              dataOption: expect.objectContaining({
                column: expect.objectContaining({
                  name: 'Revenue',
                  type: 'number',
                }),
              }),
            }),
            secondary: expect.objectContaining({
              value: 6789.12,
              displayValue: '6.79K',
              id: 'secondary',
              dataOption: expect.objectContaining({
                column: expect.objectContaining({
                  name: 'Cost',
                  type: 'number',
                }),
              }),
            }),
            min: expect.objectContaining({
              value: 0,
              displayValue: '0',
              id: 'min',
              dataOption: expect.objectContaining({
                column: expect.objectContaining({
                  name: 'Min',
                  type: 'number',
                }),
              }),
            }),
            max: expect.objectContaining({
              value: 50000,
              displayValue: '50K',
              id: 'max',
              dataOption: expect.objectContaining({
                column: expect.objectContaining({
                  name: 'Max',
                  type: 'number',
                }),
              }),
            }),
          }),
        }),
        expect.any(Object), // MouseEvent
      );
    });

    it('should pass MouseEvent as second parameter to onDataPointClick', () => {
      const onDataPointClickMock = vi.fn();

      const { container } = render(
        <IndicatorCanvas
          chartData={mockChartData}
          dataOptions={mockDataOptions}
          designOptions={mockDesignOptions}
          onDataPointClick={onDataPointClickMock}
        />,
      );

      const indicatorRoot = container.querySelector('[aria-label="indicator-root"]');
      fireEvent.click(indicatorRoot!);

      const [, nativeEvent] = onDataPointClickMock.mock.calls[0];
      expect(nativeEvent).toBeInstanceOf(Object);
      expect(nativeEvent.type).toBe('click');
    });

    it('should work with minimal dataOptions (only value)', () => {
      const onDataPointClickMock = vi.fn();
      const minimalDataOptions = {
        value: [{ column: { name: 'Revenue', type: 'number' } }],
      } as any;
      const minimalChartData = {
        type: 'indicator',
        value: 12345.67,
      } as any;

      const { container } = render(
        <IndicatorCanvas
          chartData={minimalChartData}
          dataOptions={minimalDataOptions}
          designOptions={mockDesignOptions}
          onDataPointClick={onDataPointClickMock}
        />,
      );

      const indicatorRoot = container.querySelector('[aria-label="indicator-root"]');
      fireEvent.click(indicatorRoot!);

      expect(onDataPointClickMock).toHaveBeenCalledTimes(1);
      expect(onDataPointClickMock).toHaveBeenCalledWith(
        expect.objectContaining({
          entries: expect.objectContaining({
            value: expect.objectContaining({
              value: 12345.67,
              displayValue: '12.35K',
              id: 'value',
              dataOption: expect.objectContaining({
                column: expect.objectContaining({
                  name: 'Revenue',
                  type: 'number',
                }),
              }),
            }),
          }),
        }),
        expect.any(Object),
      );
    });
  });
});
