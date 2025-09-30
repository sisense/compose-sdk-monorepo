import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { ColumnChart, BarChart } from '@/index';
import type { HighchartsOptions } from '@/chart-options-processor/chart-options-service';

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

describe('Border Radius Styling - borderRadius Property', () => {
  describe('Column Chart', () => {
    it('should apply numeric borderRadius property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that borderRadius is applied to series
        expect((options.series?.[0] as any)?.borderRadius).toBe(10);
        expect((options.series?.[1] as any)?.borderRadius).toBe(10);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: 10,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply string borderRadius property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that borderRadius is applied to series
        expect((options.series?.[0] as any)?.borderRadius).toBe('50%');
        expect((options.series?.[1] as any)?.borderRadius).toBe('50%');
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: '50%',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply borderRadius with other series properties', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(15);
        expect(series1?.pointPadding).toBe(0.2);
        expect(series1?.groupPadding).toBe(0.3);
        expect(series2?.borderRadius).toBe(15);
        expect(series2?.pointPadding).toBe(0.2);
        expect(series2?.groupPadding).toBe(0.3);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: 15,
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

    it('should use default borderRadius value when not provided', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use default value: borderRadius = 0
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(0);
        expect(series2?.borderRadius).toBe(0);
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

    it('should handle zero borderRadius value correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(0);
        expect(series2?.borderRadius).toBe(0);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: 0,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle large borderRadius values correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(100);
        expect(series2?.borderRadius).toBe(100);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: 100,
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
    it('should apply numeric borderRadius property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that borderRadius is applied to series
        expect((options.series?.[0] as any)?.borderRadius).toBe(8);
        expect((options.series?.[1] as any)?.borderRadius).toBe(8);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: 8,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply string borderRadius property correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Check that borderRadius is applied to series
        expect((options.series?.[0] as any)?.borderRadius).toBe('25%');
        expect((options.series?.[1] as any)?.borderRadius).toBe('25%');
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: '25%',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply borderRadius with other series properties', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(12);
        expect(series1?.pointPadding).toBe(0.25);
        expect(series1?.groupPadding).toBe(0.35);
        expect(series2?.borderRadius).toBe(12);
        expect(series2?.pointPadding).toBe(0.25);
        expect(series2?.groupPadding).toBe(0.35);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: 12,
              padding: 0.25,
              groupPadding: 0.35,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should use default borderRadius value when not provided', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should use default value: borderRadius = 0
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(0);
        expect(series2?.borderRadius).toBe(0);
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

    it('should handle zero borderRadius value correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(0);
        expect(series2?.borderRadius).toBe(0);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: 0,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle large borderRadius values correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(75);
        expect(series2?.borderRadius).toBe(75);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: 75,
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
    it('should handle undefined borderRadius property gracefully', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Should fallback to default value when borderRadius is undefined
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(0); // Default borderRadius
        expect(series2?.borderRadius).toBe(0);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: undefined,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle mixed borderRadius and padding properties correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        // borderRadius should be 20, padding should be 0.15, groupPadding should be default 0.1
        expect(series1?.borderRadius).toBe(20);
        expect(series1?.pointPadding).toBe(0.15);
        expect(series1?.groupPadding).toBe(0.1);
        expect(series2?.borderRadius).toBe(20);
        expect(series2?.pointPadding).toBe(0.15);
        expect(series2?.groupPadding).toBe(0.1);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: 20,
              padding: 0.15,
            },
            // groupPadding intentionally omitted
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle fractional borderRadius values correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(5.5);
        expect(series2?.borderRadius).toBe(5.5);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: 5.5,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle percentage string borderRadius values correctly', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe('30%');
        expect(series2?.borderRadius).toBe('30%');
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            series: {
              borderRadius: '30%',
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
    it('should preserve default borderRadius values for Column charts', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Column charts should use default values when no borderRadius options provided
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(0); // Default borderRadius
        expect(series2?.borderRadius).toBe(0);
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

    it('should preserve default borderRadius values for Bar charts', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        // Bar charts should use default values when no borderRadius options provided
        const series1 = options.series?.[0] as any;
        const series2 = options.series?.[1] as any;
        expect(series1?.borderRadius).toBe(0); // Default borderRadius
        expect(series2?.borderRadius).toBe(0);
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
