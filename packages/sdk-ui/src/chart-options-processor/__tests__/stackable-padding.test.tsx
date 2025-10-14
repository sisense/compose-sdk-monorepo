import { render } from '@testing-library/react';
import { vi } from 'vitest';

import type { HighchartsOptions } from '@/chart-options-processor/chart-options-service';
import { BarChart, ColumnChart } from '@/index';

// Mock data for testing
const mockData = {
  columns: [
    { name: 'Category', type: 'string' },
    { name: 'Value1', type: 'number' },
    { name: 'Value2', type: 'number' },
  ],
  rows: [
    ['A', 100, 150],
    ['B', 200, 250],
    ['C', 300, 350],
    ['D', 400, 450],
  ],
};

const mockDataOptions = {
  category: [{ column: { name: 'Category', type: 'string' } }],
  value: [
    { column: { name: 'Value1', type: 'number' } },
    { column: { name: 'Value2', type: 'number' } },
  ],
  breakBy: [],
};

describe('Stackable Padding - itemPadding and groupPadding Props', () => {
  describe('Column Chart', () => {
    it('should apply itemPadding property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that itemPadding is applied as pointPadding to series
        expect((options.series?.[0] as any)?.pointPadding).toBe(0.3);
        expect((options.series?.[1] as any)?.pointPadding).toBe(0.3);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: 0.3,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply groupPadding property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that groupPadding is applied to series
        expect((options.series?.[0] as any)?.groupPadding).toBe(0.4);
        expect((options.series?.[1] as any)?.groupPadding).toBe(0.4);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              groupPadding: 0.4,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply both itemPadding and groupPadding properties together', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(0.15);
        expect(series1?.groupPadding).toBe(0.25);
        expect(series2?.pointPadding).toBe(0.15);
        expect(series2?.groupPadding).toBe(0.25);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: 0.15,
              groupPadding: 0.25,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should use default values when padding properties are not provided', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use default values: itemPadding = 0.01, groupPadding = 0.1
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(0.01);
        expect(series1?.groupPadding).toBe(0.1);
        expect(series2?.pointPadding).toBe(0.01);
        expect(series2?.groupPadding).toBe(0.1);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{}}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle zero padding values correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(0);
        expect(series1?.groupPadding).toBe(0);
        expect(series2?.pointPadding).toBe(0);
        expect(series2?.groupPadding).toBe(0);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: 0,
              groupPadding: 0,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle maximum padding values correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(1);
        expect(series1?.groupPadding).toBe(1);
        expect(series2?.pointPadding).toBe(1);
        expect(series2?.groupPadding).toBe(1);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: 1,
              groupPadding: 1,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });

  describe('Bar Chart', () => {
    it('should apply itemPadding property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that itemPadding is applied as pointPadding to series
        expect((options.series?.[0] as any)?.pointPadding).toBe(0.35);
        expect((options.series?.[1] as any)?.pointPadding).toBe(0.35);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: 0.35,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply groupPadding property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that groupPadding is applied to series
        expect((options.series?.[0] as any)?.groupPadding).toBe(0.45);
        expect((options.series?.[1] as any)?.groupPadding).toBe(0.45);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              groupPadding: 0.45,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply both itemPadding and groupPadding properties together', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(0.2);
        expect(series1?.groupPadding).toBe(0.3);
        expect(series2?.pointPadding).toBe(0.2);
        expect(series2?.groupPadding).toBe(0.3);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: 0.2,
              groupPadding: 0.3,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should use default values when padding properties are not provided', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use default values: itemPadding = 0.01, groupPadding = 0.1
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(0.01);
        expect(series1?.groupPadding).toBe(0.1);
        expect(series2?.pointPadding).toBe(0.01);
        expect(series2?.groupPadding).toBe(0.1);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{}}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle zero padding values correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(0);
        expect(series1?.groupPadding).toBe(0);
        expect(series2?.pointPadding).toBe(0);
        expect(series2?.groupPadding).toBe(0);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: 0,
              groupPadding: 0,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle maximum padding values correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(1);
        expect(series1?.groupPadding).toBe(1);
        expect(series2?.pointPadding).toBe(1);
        expect(series2?.groupPadding).toBe(1);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: 1,
              groupPadding: 1,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined padding properties gracefully', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should fallback to default values when padding properties are undefined
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(0.01); // Default itemPadding
        expect(series1?.groupPadding).toBe(0.1); // Default groupPadding
        expect(series2?.pointPadding).toBe(0.01);
        expect(series2?.groupPadding).toBe(0.1);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: undefined,
              groupPadding: undefined,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle mixed padding properties correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        // itemPadding should be 0.5, groupPadding should be default 0.1
        expect(series1?.pointPadding).toBe(0.5);
        expect(series1?.groupPadding).toBe(0.1);
        expect(series2?.pointPadding).toBe(0.5);
        expect(series2?.groupPadding).toBe(0.1);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: 0.5,
            },
            // groupPadding intentionally omitted
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle fractional padding values correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(0.123);
        expect(series1?.groupPadding).toBe(0.456);
        expect(series2?.pointPadding).toBe(0.123);
        expect(series2?.groupPadding).toBe(0.456);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: 0.123,
              groupPadding: 0.456,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle negative padding values correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(-0.1);
        expect(series1?.groupPadding).toBe(-0.2);
        expect(series2?.pointPadding).toBe(-0.1);
        expect(series2?.groupPadding).toBe(-0.2);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              padding: -0.1,
              groupPadding: -0.2,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });

  describe('Default Values Preservation', () => {
    it('should preserve default padding values for Column charts', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Column charts should use default values when no padding options provided
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(0.01); // Default itemPadding
        expect(series1?.groupPadding).toBe(0.1); // Default groupPadding
        expect(series2?.pointPadding).toBe(0.01);
        expect(series2?.groupPadding).toBe(0.1);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{}}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should preserve default padding values for Bar charts', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Bar charts should use default values when no padding options provided
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.pointPadding).toBe(0.01); // Default itemPadding
        expect(series1?.groupPadding).toBe(0.1); // Default groupPadding
        expect(series2?.pointPadding).toBe(0.01);
        expect(series2?.groupPadding).toBe(0.1);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
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
});
