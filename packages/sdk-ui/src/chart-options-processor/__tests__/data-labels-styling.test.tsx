/** @vitest-environment jsdom */
import { Data } from '@sisense/sdk-data';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { attributes, data, measures } from '../../__mocks__/dataMocks';
import { AreaChart } from '../../area-chart';
import { AreaRangeChart } from '../../area-range-chart';
import { BarChart } from '../../bar-chart';
import { ColumnChart } from '../../column-chart';
import { LineChart } from '../../line-chart';
import { PolarChart } from '../../polar-chart';
import { ScatterChart } from '../../scatter-chart';
import {
  createLinearGradient,
  createRadialGradient,
  GradientDirections,
  RadialGradientPresets,
} from '../../utils/gradient';
import { HighchartsOptions } from '../chart-options-service';

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

    it('should apply linear gradient backgroundColor to series labels', async () => {
      const linearGradient = createLinearGradient(GradientDirections.topToBottom, [
        { position: 0, color: '#ff0000' },
        { position: 1, color: '#0000ff' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.backgroundColor).toEqual({
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, '#ff0000'],
            [1, '#0000ff'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              backgroundColor: linearGradient,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply radial gradient backgroundColor to series labels', async () => {
      const radialGradient = createRadialGradient(RadialGradientPresets.center, [
        { position: 0, color: '#ffffff' },
        { position: 0.5, color: '#cccccc' },
        { position: 1, color: '#000000' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.backgroundColor).toEqual({
          radialGradient: {
            cx: 0.5,
            cy: 0.5,
            r: 0.8,
          },
          stops: [
            [0, '#ffffff'],
            [0.5, '#cccccc'],
            [1, '#000000'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              backgroundColor: radialGradient,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply linear gradient borderColor to series labels', async () => {
      const linearGradient = createLinearGradient(GradientDirections.leftToRight, [
        { position: 0, color: '#00ff00' },
        { position: 1, color: '#ff00ff' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.borderColor).toEqual({
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 0,
          },
          stops: [
            [0, '#00ff00'],
            [1, '#ff00ff'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderColor: linearGradient,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply radial gradient borderColor to series labels', async () => {
      const radialGradient = createRadialGradient({ centerX: 0.3, centerY: 0.7, radius: 0.5 }, [
        { position: 0, color: '#ffff00' },
        { position: 1, color: '#00ffff' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.borderColor).toEqual({
          radialGradient: {
            cx: 0.3,
            cy: 0.7,
            r: 0.5,
          },
          stops: [
            [0, '#ffff00'],
            [1, '#00ffff'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderColor: radialGradient,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply both gradient backgroundColor and borderColor to series labels', async () => {
      const linearGradient = createLinearGradient(GradientDirections.diagonalTopLeft, [
        { position: 0, color: '#ff0000' },
        { position: 1, color: '#0000ff' },
      ]);

      const radialGradient = createRadialGradient(RadialGradientPresets.topLeft, [
        { position: 0, color: '#ffffff' },
        { position: 1, color: '#000000' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.backgroundColor).toEqual({
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 1,
          },
          stops: [
            [0, '#ff0000'],
            [1, '#0000ff'],
          ],
        });
        expect(dataLabels?.borderColor).toEqual({
          radialGradient: {
            cx: 0,
            cy: 0,
            r: 1,
          },
          stops: [
            [0, '#ffffff'],
            [1, '#000000'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <LineChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              backgroundColor: linearGradient,
              borderColor: radialGradient,
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

    it('should apply linear gradient backgroundColor to series labels', async () => {
      const linearGradient = createLinearGradient(GradientDirections.bottomToTop, [
        { position: 0, color: '#00ff00' },
        { position: 1, color: '#ff0000' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.backgroundColor).toEqual({
          linearGradient: {
            x1: 0,
            y1: 1,
            x2: 0,
            y2: 0,
          },
          stops: [
            [0, '#00ff00'],
            [1, '#ff0000'],
          ],
        });
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
              backgroundColor: linearGradient,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply radial gradient borderColor to series labels', async () => {
      const radialGradient = createRadialGradient(RadialGradientPresets.bottomRight, [
        { position: 0, color: '#ffffff' },
        { position: 1, color: '#000000' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.borderColor).toEqual({
          radialGradient: {
            cx: 1,
            cy: 1,
            r: 1,
          },
          stops: [
            [0, '#ffffff'],
            [1, '#000000'],
          ],
        });
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
              borderColor: radialGradient,
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

    it('should apply linear gradient backgroundColor to series labels', async () => {
      const linearGradient = createLinearGradient(GradientDirections.rightToLeft, [
        { position: 0, color: '#ff00ff' },
        { position: 0.5, color: '#00ffff' },
        { position: 1, color: '#ffff00' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.backgroundColor).toEqual({
          linearGradient: {
            x1: 1,
            y1: 0,
            x2: 0,
            y2: 0,
          },
          stops: [
            [0, '#ff00ff'],
            [0.5, '#00ffff'],
            [1, '#ffff00'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              backgroundColor: linearGradient,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply radial gradient borderColor to series labels', async () => {
      const radialGradient = createRadialGradient(RadialGradientPresets.topRight, [
        { position: 0, color: '#ff0000' },
        { position: 1, color: '#0000ff' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.borderColor).toEqual({
          radialGradient: {
            cx: 1,
            cy: 0,
            r: 1,
          },
          stops: [
            [0, '#ff0000'],
            [1, '#0000ff'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <BarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderColor: radialGradient,
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

    it('should apply linear gradient backgroundColor to series labels', async () => {
      const linearGradient = createLinearGradient(GradientDirections.diagonalTopRight, [
        { position: 0, color: '#ff0000' },
        { position: 0.3, color: '#00ff00' },
        { position: 0.7, color: '#0000ff' },
        { position: 1, color: '#ffff00' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.backgroundColor).toEqual({
          linearGradient: {
            x1: 1,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, '#ff0000'],
            [0.3, '#00ff00'],
            [0.7, '#0000ff'],
            [1, '#ffff00'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              backgroundColor: linearGradient,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply radial gradient borderColor to series labels', async () => {
      const radialGradient = createRadialGradient(RadialGradientPresets.bottomLeft, [
        { position: 0, color: '#ffffff' },
        { position: 0.5, color: '#cccccc' },
        { position: 1, color: '#000000' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.borderColor).toEqual({
          radialGradient: {
            cx: 0,
            cy: 1,
            r: 1,
          },
          stops: [
            [0, '#ffffff'],
            [0.5, '#cccccc'],
            [1, '#000000'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <AreaChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderColor: radialGradient,
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

    it('should apply linear gradient backgroundColor to series labels', async () => {
      const linearGradient = createLinearGradient(GradientDirections.leftToRight, [
        { position: 0, color: '#ff0000' },
        { position: 1, color: '#0000ff' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.backgroundColor).toEqual({
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 0,
          },
          stops: [
            [0, '#ff0000'],
            [1, '#0000ff'],
          ],
        });
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
              backgroundColor: linearGradient,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply radial gradient borderColor to series labels', async () => {
      const radialGradient = createRadialGradient({ centerX: 0.2, centerY: 0.8, radius: 0.6 }, [
        { position: 0, color: '#00ff00' },
        { position: 1, color: '#ff00ff' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.borderColor).toEqual({
          radialGradient: {
            cx: 0.2,
            cy: 0.8,
            r: 0.6,
          },
          stops: [
            [0, '#00ff00'],
            [1, '#ff00ff'],
          ],
        });
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
              borderColor: radialGradient,
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

    it('should apply linear gradient backgroundColor to series labels', async () => {
      const linearGradient = createLinearGradient(GradientDirections.diagonalTopLeft, [
        { position: 0, color: '#ff0000' },
        { position: 0.25, color: '#ffff00' },
        { position: 0.75, color: '#00ff00' },
        { position: 1, color: '#0000ff' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.backgroundColor).toEqual({
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 1,
          },
          stops: [
            [0, '#ff0000'],
            [0.25, '#ffff00'],
            [0.75, '#00ff00'],
            [1, '#0000ff'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <PolarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              backgroundColor: linearGradient,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should apply radial gradient borderColor to series labels', async () => {
      const radialGradient = createRadialGradient(RadialGradientPresets.center, [
        { position: 0, color: '#ffffff' },
        { position: 0.3, color: '#cccccc' },
        { position: 0.7, color: '#666666' },
        { position: 1, color: '#000000' },
      ]);

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        const dataLabels = options.plotOptions?.series?.dataLabels as any;
        expect(dataLabels?.borderColor).toEqual({
          radialGradient: {
            cx: 0.5,
            cy: 0.5,
            r: 0.8,
          },
          stops: [
            [0, '#ffffff'],
            [0.3, '#cccccc'],
            [0.7, '#666666'],
            [1, '#000000'],
          ],
        });
        return options;
      });

      const { findByLabelText } = render(
        <PolarChart
          dataSet={mockData}
          dataOptions={mockDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderColor: radialGradient,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });
  });

  describe('ScatterChart', () => {
    const scatterDataOptions = {
      x: attributes.years,
      y: measures.totalQuantity,
      breakByPoint: attributes.country,
      size: measures.totalUnits,
    };

    it('should apply enabled property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.enabled).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
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
        expect((options.plotOptions?.series?.dataLabels as any)?.rotation).toBe(-30);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
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

    it('should apply alignInside property to series labels', async () => {
      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.inside).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
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
        expect((options.plotOptions?.series?.dataLabels as any)?.align).toBe('left');
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              align: 'left',
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
        expect((options.plotOptions?.series?.dataLabels as any)?.verticalAlign).toBe('bottom');
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              verticalAlign: 'bottom',
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
        expect((options.plotOptions?.series?.dataLabels as any)?.style.color).toBe('#00ff00');
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              textStyle: {
                color: '#00ff00',
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
        expect((options.plotOptions?.series?.dataLabels as any)?.backgroundColor).toBe('#ffaa00');
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              backgroundColor: '#ffaa00',
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
        expect((options.plotOptions?.series?.dataLabels as any)?.borderColor).toBe('#aa00ff');
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderColor: '#aa00ff',
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
        expect((options.plotOptions?.series?.dataLabels as any)?.borderRadius).toBe(8);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderRadius: 8,
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
        expect((options.plotOptions?.series?.dataLabels as any)?.borderWidth).toBe(3);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              borderWidth: 3,
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
        expect((options.plotOptions?.series?.dataLabels as any)?.padding).toBe(12);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              padding: 12,
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
        expect((options.plotOptions?.series?.dataLabels as any)?.x).toBe(20);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              xOffset: 20,
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
        expect((options.plotOptions?.series?.dataLabels as any)?.y).toBe(-15);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              yOffset: -15,
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
        expect((options.plotOptions?.series?.dataLabels as any)?.animation?.defer).toBe(750);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              delay: 750,
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
        expect(dataLabels?.rotation).toBe(60);
        expect(dataLabels?.inside).toBe(false);
        expect(dataLabels?.align).toBe('right');
        expect(dataLabels?.verticalAlign).toBe('top');
        expect(dataLabels?.style.color).toBe('#444444');
        expect(dataLabels?.backgroundColor).toBe('#f0f0f0');
        expect(dataLabels?.borderColor).toBe('#dddddd');
        expect(dataLabels?.borderRadius).toBe(6);
        expect(dataLabels?.borderWidth).toBe(2);
        expect(dataLabels?.padding).toBe(8);
        expect(dataLabels?.x).toBe(5);
        expect(dataLabels?.y).toBe(-5);
        expect(dataLabels?.animation?.defer).toBe(300);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={scatterDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              rotation: 60,
              alignInside: false,
              align: 'right',
              verticalAlign: 'top',
              textStyle: {
                color: '#444444',
              },
              backgroundColor: '#f0f0f0',
              borderColor: '#dddddd',
              borderRadius: 6,
              borderWidth: 2,
              padding: 8,
              xOffset: 5,
              yOffset: -5,
              delay: 300,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle scatter chart with bubble sizing', async () => {
      const bubbleDataOptions = {
        x: attributes.years,
        y: measures.totalQuantity,
        size: measures.totalUnits,
        breakByColor: attributes.country,
      };

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.enabled).toBe(true);
        expect(options.plotOptions?.bubble).toBeDefined();
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={bubbleDataOptions}
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

    it('should handle scatter chart with breakByPoint only', async () => {
      const pointDataOptions = {
        x: attributes.years,
        y: measures.totalQuantity,
        breakByPoint: attributes.country,
      };

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.enabled).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={pointDataOptions}
          styleOptions={{
            seriesLabels: {
              enabled: true,
              rotation: 45,
            },
          }}
          onBeforeRender={onBeforeRender}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
      expect(onBeforeRender).toHaveBeenCalled();
    });

    it('should handle scatter chart with breakByColor only', async () => {
      const colorDataOptions = {
        x: attributes.years,
        y: measures.totalQuantity,
        breakByColor: attributes.country,
      };

      const onBeforeRender = vi.fn((options: HighchartsOptions) => {
        expect((options.plotOptions?.series?.dataLabels as any)?.enabled).toBe(true);
        return options;
      });

      const { findByLabelText } = render(
        <ScatterChart
          dataSet={mockData}
          dataOptions={colorDataOptions}
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
  });
});
