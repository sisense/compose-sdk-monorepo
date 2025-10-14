import { render } from '@testing-library/react';
import { vi } from 'vitest';

import type { HighchartsOptions } from '@/chart-options-processor/chart-options-service';
import { AreaChart, AreaRangeChart, LineChart } from '@/index';

// Mock data for testing
const mockData = {
  columns: [
    { name: 'Category', type: 'string' },
    { name: 'Value', type: 'number' },
    { name: 'UpperBound', type: 'number' },
    { name: 'LowerBound', type: 'number' },
  ],
  rows: [
    ['A', 100, 120, 80],
    ['B', 150, 180, 120],
    ['C', 200, 240, 160],
    ['D', 250, 300, 200],
  ],
};

const mockDataOptions = {
  category: [{ column: { name: 'Category', type: 'string' } }],
  value: [{ column: { name: 'Value', type: 'number' } }],
  breakBy: [],
};

const mockRangeDataOptions = {
  category: [{ column: { name: 'Category', type: 'string' } }],
  value: [
    {
      title: 'Range',
      upperBound: { name: 'UpperBound', aggregation: 'sum' },
      lowerBound: { name: 'LowerBound', aggregation: 'sum' },
    },
  ],
  breakBy: [],
};

describe('Line Styling - New Line Inner Props', () => {
  describe('Line Chart', () => {
    it('should apply new line.width property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line width is applied to series
        expect((options.series?.[0] as any)?.lineWidth).toBe(5);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              width: 5,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply new line.dash property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line dash style is applied to series
        expect((options.series?.[0] as any)?.dashStyle).toBe('ShortDash');
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              dashStyle: 'ShortDash',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply new line.endCap property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line end cap is applied to series
        expect((options.series?.[0] as any)?.linecap).toBe('round');
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              endCap: 'Round',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply new line.shadow property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line shadow is applied to series
        expect((options.series?.[0] as any)?.shadow).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              shadow: true,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply all new line properties together', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series = options.series?.[0] as any;
        expect(series?.lineWidth).toBe(8);
        expect(series?.dashStyle).toBe('Dash');
        expect(series?.linecap).toBe('square');
        expect(series?.shadow).toBe(false);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              width: 8,
              dashStyle: 'Dash',
              endCap: 'Square',
              shadow: false,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should fallback to deprecated lineWidth when line.width is not provided', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use lineWidth 'bold' which translates to 3
        expect((options.series?.[0] as any)?.lineWidth).toBe(3);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            lineWidth: { width: 'bold' },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should prioritize line.width over deprecated lineWidth', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use line.width (7) instead of lineWidth 'bold' (3)
        expect((options.series?.[0] as any)?.lineWidth).toBe(7);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            lineWidth: { width: 'bold' },
            line: {
              width: 7,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should use default line width when neither line.width nor lineWidth is provided', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use default 'bold' which translates to 3
        expect((options.series?.[0] as any)?.lineWidth).toBe(3);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{}}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });

  describe('Area Chart', () => {
    it('should apply new line.width property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line width is applied to series
        expect((options.series?.[0] as any)?.lineWidth).toBe(6);
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              width: 6,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply new line.dash property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line dash style is applied to series
        expect((options.series?.[0] as any)?.dashStyle).toBe('Dot');
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              dashStyle: 'Dot',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply new line.endCap property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line end cap is applied to series
        expect((options.series?.[0] as any)?.linecap).toBe('square');
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              endCap: 'Square',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply new line.shadow property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line shadow is applied to series
        expect((options.series?.[0] as any)?.shadow).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              shadow: true,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should fallback to deprecated lineWidth when line.width is not provided', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use lineWidth 'thin' which translates to 1
        expect((options.series?.[0] as any)?.lineWidth).toBe(1);
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            lineWidth: { width: 'thin' },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should prioritize line.width over deprecated lineWidth', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use line.width (4) instead of lineWidth 'thin' (1)
        expect((options.series?.[0] as any)?.lineWidth).toBe(4);
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            lineWidth: { width: 'thin' },
            line: {
              width: 4,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should use default line width when neither line.width nor lineWidth is provided', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use default 'thin' which translates to 1
        expect((options.series?.[0] as any)?.lineWidth).toBe(1);
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{}}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });
  });

  describe('AreaRange Chart', () => {
    it('should apply new line.width property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line width is applied to series
        expect((options.series?.[0] as any)?.lineWidth).toBe(9);
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={mockData}
          dataOptions={mockRangeDataOptions}
          styleOptions={{
            line: {
              width: 9,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply new line.dash property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line dash style is applied to series
        expect((options.series?.[0] as any)?.dashStyle).toBe('LongDash');
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={mockData}
          dataOptions={mockRangeDataOptions}
          styleOptions={{
            line: {
              dashStyle: 'LongDash',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply new line.endCap property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line end cap is applied to series
        expect((options.series?.[0] as any)?.linecap).toBe('round');
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={mockData}
          dataOptions={mockRangeDataOptions}
          styleOptions={{
            line: {
              endCap: 'Round',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply new line.shadow property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that the line shadow is applied to series
        expect((options.series?.[0] as any)?.shadow).toBe(false);
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={mockData}
          dataOptions={mockRangeDataOptions}
          styleOptions={{
            line: {
              shadow: false,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply all new line properties together', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series = options.series?.[0] as any;
        expect(series?.lineWidth).toBe(10);
        expect(series?.dashStyle).toBe('ShortDashDot');
        expect(series?.linecap).toBe('square');
        expect(series?.shadow).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={mockData}
          dataOptions={mockRangeDataOptions}
          styleOptions={{
            line: {
              width: 10,
              dashStyle: 'ShortDashDot',
              endCap: 'Square',
              shadow: true,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should fallback to deprecated lineWidth when line.width is not provided', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use lineWidth 'thick' which translates to 5
        expect((options.series?.[0] as any)?.lineWidth).toBe(5);
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={mockData}
          dataOptions={mockRangeDataOptions}
          styleOptions={{
            lineWidth: { width: 'thick' },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should prioritize line.width over deprecated lineWidth', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use line.width (12) instead of lineWidth 'thick' (5)
        expect((options.series?.[0] as any)?.lineWidth).toBe(12);
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={mockData}
          dataOptions={mockRangeDataOptions}
          styleOptions={{
            lineWidth: { width: 'thick' },
            line: {
              width: 12,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });
  });

  describe('Default Values Preservation', () => {
    it('should preserve default line width values for Line charts', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Line charts default to 'bold' (3) when no line options provided
        expect((options.series?.[0] as any)?.lineWidth).toBe(3);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{}}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should preserve default line width values for Area charts', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Area charts default to 'thin' (1) when no line options provided
        expect((options.series?.[0] as any)?.lineWidth).toBe(1);
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{}}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should preserve default line width values for AreaRange charts', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // AreaRange charts default to 'bold' (3) when no line options provided
        expect((options.series?.[0] as any)?.lineWidth).toBe(3);
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={mockData}
          dataOptions={mockRangeDataOptions}
          styleOptions={{}}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined line properties gracefully', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should fallback to default values when line properties are undefined
        const series = options.series?.[0] as any;
        expect(series?.lineWidth).toBe(3); // Line chart default
        expect(series?.dashStyle).toBeUndefined();
        expect(series?.linecap).toBeUndefined();
        expect(series?.shadow).toBeUndefined();
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              width: undefined,
              dashStyle: undefined,
              endCap: undefined,
              shadow: undefined,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should handle empty line object gracefully', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should fallback to default values when line object is empty
        expect((options.series?.[0] as any)?.lineWidth).toBe(3); // Line chart default
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {},
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should handle mixed line properties correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series = options.series?.[0] as any;
        // width should be 15, dash should be 'LongDashDotDot', others undefined
        expect(series?.lineWidth).toBe(15);
        expect(series?.dashStyle).toBe('LongDashDotDot');
        expect(series?.linecap).toBeUndefined();
        expect(series?.shadow).toBeUndefined();
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            line: {
              width: 15,
              dashStyle: 'LongDashDotDot',
              // endCap and shadow intentionally omitted
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });
  });
});
