/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { data, attributes, measures } from '../../__mocks__/dataMocks';
import { HighchartsOptions } from '../chart-options-service';
import { LineChart } from '../../line-chart';
import { ColumnChart } from '../../column-chart';
import { BarChart } from '../../bar-chart';
import { AreaChart } from '../../area-chart';
import { AreaRangeChart } from '../../area-range-chart';
import { PolarChart } from '../../polar-chart';
import { Data } from '@sisense/sdk-data';

// Mock data for testing
const mockData: Data = data;

const mockDataOptions = {
  category: [attributes.country],
  value: [measures.totalQuantity, measures.totalUnits],
  breakBy: [],
};

describe('Series Labels Styling Tests', () => {
  describe('LineChart', () => {
    it('should apply enabled property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.enabled).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply rotation property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.rotation).toBe(-45);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              rotation: -45,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply alignInside property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.inside).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              alignInside: true,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply align property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.align).toBe('right');
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              align: 'right',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply verticalAlign property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.verticalAlign).toBe('top');
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              verticalAlign: 'top',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply color property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.style.color).toBe('#ff0000');
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              textStyle: {
                color: '#ff0000',
              },
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply backgroundColor property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.backgroundColor).toBe('#ffff00');
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              backgroundColor: '#ffff00',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply borderColor property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.borderColor).toBe('#0000ff');
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderColor: '#0000ff',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply borderRadius property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.borderRadius).toBe(5);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderRadius: 5,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply borderWidth property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.borderWidth).toBe(2);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderWidth: 2,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply padding property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.padding).toBe(10);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              padding: 10,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply xOffset property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.x).toBe(15);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              xOffset: 15,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply yOffset property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.y).toBe(-10);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              yOffset: -10,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply delay property to series labels animation', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.animation?.defer).toBe(500);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              delay: 500,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply all seriesLabels properties together', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.enabled).toBe(true);
        expect(dataLabels?.rotation).toBe(45);
        expect(dataLabels?.inside).toBe(true);
        expect(dataLabels?.align).toBe('center');
        expect(dataLabels?.verticalAlign).toBe('middle');
        expect(dataLabels?.style.color).toBe('#333333');
        expect(dataLabels?.backgroundColor).toBe('#ffffff');
        expect(dataLabels?.borderColor).toBe('#cccccc');
        expect(dataLabels?.borderRadius).toBe(3);
        expect(dataLabels?.borderWidth).toBe(1);
        expect(dataLabels?.padding).toBe(5);
        expect(dataLabels?.x).toBe(0);
        expect(dataLabels?.y).toBe(0);
        expect(dataLabels?.animation?.defer).toBe(200);
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              rotation: 45,
              alignInside: true,
              align: 'center',
              verticalAlign: 'middle',
              textStyle: {
                color: '#333333',
              },
              backgroundColor: '#ffffff',
              borderColor: '#cccccc',
              borderRadius: 3,
              borderWidth: 1,
              padding: 5,
              xOffset: 0,
              yOffset: 0,
              delay: 200,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });

  describe('ColumnChart', () => {
    it('should apply enabled property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.enabled).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={data}
          dataOptions={{
            category: [attributes.years],
            value: [measures.totalQuantity],
            breakBy: [],
          }}
          styleOptions={{
            seriesLabels: {
              enabled: true,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply rotation property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.rotation).toBe(-90);
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={data}
          dataOptions={{
            category: [attributes.years],
            value: [measures.totalQuantity],
            breakBy: [],
          }}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              rotation: -90,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply color property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.style.color).toBe('#ff0000');
        return options;
      });

      const { findByLabelText } = render(
        <ColumnChart
          dataSet={data}
          dataOptions={{
            category: [attributes.years],
            value: [measures.totalQuantity],
            breakBy: [],
          }}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              textStyle: {
                color: '#ff0000',
              },
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });

  describe('BarChart', () => {
    it('should apply enabled property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.enabled).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={data}
          dataOptions={{
            category: [attributes.years],
            value: [measures.totalQuantity],
            breakBy: [],
          }}
          styleOptions={{
            seriesLabels: {
              enabled: true,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply rotation property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.rotation).toBe(0);
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              rotation: 0,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply backgroundColor property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.backgroundColor).toBe('#ffff00');
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              backgroundColor: '#ffff00',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });

  describe('AreaChart', () => {
    it('should apply enabled property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.enabled).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply rotation property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.rotation).toBe(30);
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              rotation: 30,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply borderColor property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.borderColor).toBe('#0000ff');
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderColor: '#0000ff',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });

  describe('AreaRange Chart', () => {
    it('should apply enabled property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.enabled).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={data}
          dataOptions={{
            category: [attributes.years],
            breakBy: [],
            value: [
              {
                title: 'Revenue',
                upperBound: measures.totalUnits,
                lowerBound: measures.totalUnits,
              },
            ],
          }}
          styleOptions={{
            subtype: 'arearange/basic',
            seriesLabels: {
              enabled: true,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply rotation property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.rotation).toBe(-30);
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={data}
          dataOptions={{
            category: [attributes.years],
            breakBy: [],
            value: [
              {
                title: 'Revenue',
                upperBound: measures.totalUnits,
                lowerBound: measures.totalUnits,
              },
            ],
          }}
          styleOptions={{
            subtype: 'arearange/basic',
            seriesLabels: {
              enabled: true,
              rotation: -30,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply padding property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.padding).toBe(8);
        return options;
      });

      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={data}
          dataOptions={{
            category: [attributes.years],
            breakBy: [],
            value: [
              {
                title: 'Revenue',
                upperBound: measures.totalUnits,
                lowerBound: measures.totalUnits,
              },
            ],
          }}
          styleOptions={{
            subtype: 'arearange/basic',
            seriesLabels: {
              enabled: true,
              padding: 8,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });

  describe('PolarChart', () => {
    it('should apply enabled property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.enabled).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <PolarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply rotation property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.rotation).toBe(60);
        return options;
      });

      const { findByLabelText } = render(
        <PolarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              rotation: 60,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply backgroundColor property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.backgroundColor).toBe('#ff00ff');
        return options;
      });

      const { findByLabelText } = render(
        <PolarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              backgroundColor: '#ff00ff',
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });
});
