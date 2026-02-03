/** @vitest-environment jsdom */
import { Data } from '@sisense/sdk-data';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import {
  createLinearGradient,
  createRadialGradient,
  GradientDirections,
  RadialGradientPresets,
} from '@/shared/utils/gradient';

import { attributes, data, measures } from '../../../../../__mocks__/dataMocks';
import { AreaChart } from '../../../components/area-chart';
import { BarChart } from '../../../components/bar-chart';
import { ColumnChart } from '../../../components/column-chart';
import { HighchartsOptions } from '../chart-options-service';

// Mock data for testing
const mockData: Data = data;

const mockDataOptions = {
  category: [attributes.country],
  value: [measures.totalQuantity, measures.totalUnits],
  breakBy: [],
};

// Helper function to safely access yAxis stackLabels
const getStackLabels = (options: HighchartsOptions) => {
  const yAxis = Array.isArray(options.yAxis) ? options.yAxis[0] : options.yAxis;
  return yAxis?.stackLabels as any;
};

describe('Total Labels Styling Tests', () => {
  describe('Bar Chart', () => {
    describe('classic stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply rotation property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.rotation).toBe(-45);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
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

      it('should apply align property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.align).toBe('right');
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
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

      it('should apply verticalAlign property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.verticalAlign).toBe('top');
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
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

      it('should apply textStyle color property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.style?.color).toBe('#ff0000');
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
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

      it('should apply backgroundColor property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.backgroundColor).toBe('#ffff00');
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
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

      it('should apply borderColor property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.borderColor).toBe('#0000ff');
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
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

      it('should apply borderRadius property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.borderRadius).toBe(5);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
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

      it('should apply borderWidth property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.borderWidth).toBe(2);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
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

      it('should apply xOffset property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.x).toBe(15);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
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

      it('should apply yOffset property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.y).toBe(-10);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
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

      it('should apply delay property to total labels animation', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.animation?.defer).toBe(500);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
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

      it('should apply prefix property to total labels', async () => {
        const { findByLabelText, findByText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
                enabled: true,
                prefix: 'Total: ',
              },
            }}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(await findByText('Total: 4.54K')).toBeInTheDocument();
      });

      it('should apply suffix property to total labels', async () => {
        const { findByLabelText, findByText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
                enabled: true,
                suffix: ' units',
              },
            }}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(await findByText('4.54K units')).toBeInTheDocument();
      });

      it('should apply fontFamily property to total labels textStyle', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.style?.fontFamily).toBe('Arial, sans-serif');
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
                enabled: true,
                textStyle: {
                  fontFamily: 'Arial, sans-serif',
                },
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply fontSize property to total labels textStyle', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.style?.fontSize).toBe('14px');
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
                enabled: true,
                textStyle: {
                  fontSize: '14px',
                },
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply fontWeight property to total labels textStyle', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.style?.fontWeight).toBe('bold');
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
                enabled: true,
                textStyle: {
                  fontWeight: 'bold',
                },
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply fontStyle property to total labels textStyle', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.style?.fontStyle).toBe('italic');
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
                enabled: true,
                textStyle: {
                  fontStyle: 'italic',
                },
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply textOutline property to total labels textStyle', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.style?.textOutline).toBe('1px solid black');
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
                enabled: true,
                textStyle: {
                  textOutline: '1px solid black',
                },
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply all totalLabels properties together', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.enabled).toBe(true);
          expect(stackLabels?.rotation).toBe(45);
          expect(stackLabels?.align).toBe('center');
          expect(stackLabels?.verticalAlign).toBe('middle');
          expect(stackLabels?.textAlign).toBe('right');
          expect(stackLabels?.style?.color).toBe('#333333');
          expect(stackLabels?.style?.fontFamily).toBe('Arial, sans-serif');
          expect(stackLabels?.style?.fontSize).toBe('14px');
          expect(stackLabels?.style?.fontWeight).toBe('bold');
          expect(stackLabels?.style?.fontStyle).toBe('italic');
          expect(stackLabels?.style?.textOutline).toBe('1px solid black');
          expect(stackLabels?.backgroundColor).toBe('#ffffff');
          expect(stackLabels?.borderColor).toBe('#cccccc');
          expect(stackLabels?.borderRadius).toBe(3);
          expect(stackLabels?.borderWidth).toBe(1);
          expect(stackLabels?.x).toBe(0);
          expect(stackLabels?.y).toBe(0);
          expect(stackLabels?.animation?.defer).toBe(200);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
                enabled: true,
                rotation: 45,
                align: 'center',
                verticalAlign: 'middle',
                textStyle: {
                  color: '#333333',
                  align: 'right',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  textOutline: '1px solid black',
                },
                backgroundColor: '#ffffff',
                borderColor: '#cccccc',
                borderRadius: 3,
                borderWidth: 1,
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

      it('should apply linear gradient backgroundColor to total labels', async () => {
        const linearGradient = createLinearGradient(GradientDirections.topToBottom, [
          { position: 0, color: '#ff0000' },
          { position: 1, color: '#0000ff' },
        ]);

        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.backgroundColor).toEqual({
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
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
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

      it('should apply radial gradient backgroundColor to total labels', async () => {
        const radialGradient = createRadialGradient(RadialGradientPresets.center, [
          { position: 0, color: '#ffffff' },
          { position: 0.5, color: '#cccccc' },
          { position: 1, color: '#000000' },
        ]);

        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.backgroundColor).toEqual({
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
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
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

      it('should apply linear gradient borderColor to total labels', async () => {
        const linearGradient = createLinearGradient(GradientDirections.leftToRight, [
          { position: 0, color: '#00ff00' },
          { position: 1, color: '#ff00ff' },
        ]);

        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.borderColor).toEqual({
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
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
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

      it('should apply radial gradient borderColor to total labels', async () => {
        const radialGradient = createRadialGradient(RadialGradientPresets.topLeft, [
          { position: 0, color: '#ffff00' },
          { position: 1, color: '#00ffff' },
        ]);

        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.borderColor).toEqual({
            radialGradient: {
              cx: 0,
              cy: 0,
              r: 1,
            },
            stops: [
              [0, '#ffff00'],
              [1, '#00ffff'],
            ],
          });
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
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

      it('should apply both gradient backgroundColor and borderColor to total labels', async () => {
        const linearGradient = createLinearGradient(GradientDirections.diagonalTopLeft, [
          { position: 0, color: '#ff0000' },
          { position: 1, color: '#0000ff' },
        ]);

        const radialGradient = createRadialGradient(RadialGradientPresets.bottomRight, [
          { position: 0, color: '#ffffff' },
          { position: 1, color: '#000000' },
        ]);

        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.backgroundColor).toEqual({
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
          expect(stackLabels?.borderColor).toEqual({
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
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
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

    describe('stacked stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply rotation property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.rotation).toBe(-90);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked',
              totalLabels: {
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
    });

    describe('stacked100 stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply rotation property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.rotation).toBe(0);
          return options;
        });

        const { findByLabelText } = render(
          <BarChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'bar/stacked100',
              totalLabels: {
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
    });
  });

  describe('Column Chart', () => {
    describe('classic stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <ColumnChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply rotation property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.rotation).toBe(90);
          return options;
        });

        const { findByLabelText } = render(
          <ColumnChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn100',
              totalLabels: {
                enabled: true,
                rotation: 90,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply backgroundColor property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.backgroundColor).toBe('#ffff00');
          return options;
        });

        const { findByLabelText } = render(
          <ColumnChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn',
              totalLabels: {
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

      it('should apply prefix and suffix properties to total labels', async () => {
        const { findByLabelText, findByText } = render(
          <ColumnChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn',
              totalLabels: {
                enabled: true,
                prefix: 'Sum: ',
                suffix: ' items',
              },
            }}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(await findByText('Sum: 4.54K items')).toBeInTheDocument();
      });

      it('should apply comprehensive textStyle properties to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.style?.fontFamily).toBe('Helvetica, sans-serif');
          expect(stackLabels?.style?.fontSize).toBe('16px');
          expect(stackLabels?.style?.fontWeight).toBe('600');
          expect(stackLabels?.style?.fontStyle).toBe('normal');
          expect(stackLabels?.style?.textOutline).toBe('2px #fff');
          return options;
        });

        const { findByLabelText } = render(
          <ColumnChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn',
              totalLabels: {
                enabled: true,
                textStyle: {
                  fontFamily: 'Helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: '600',
                  fontStyle: 'normal',
                  textOutline: '2px #fff',
                },
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply linear gradient backgroundColor to total labels', async () => {
        const linearGradient = createLinearGradient(GradientDirections.bottomToTop, [
          { position: 0, color: '#00ff00' },
          { position: 1, color: '#ff0000' },
        ]);

        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.backgroundColor).toEqual({
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
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn',
              totalLabels: {
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

      it('should apply radial gradient borderColor to total labels', async () => {
        const radialGradient = createRadialGradient(RadialGradientPresets.topRight, [
          { position: 0, color: '#ffffff' },
          { position: 1, color: '#000000' },
        ]);

        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.borderColor).toEqual({
            radialGradient: {
              cx: 1,
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
          <ColumnChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn100',
              totalLabels: {
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

    describe('stackedcolumn stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <ColumnChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply rotation property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.rotation).toBe(-45);
          return options;
        });

        const { findByLabelText } = render(
          <ColumnChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn',
              totalLabels: {
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

    describe('stackedcolumn100 stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <ColumnChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn100',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply rotation property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.rotation).toBe(30);
          return options;
        });

        const { findByLabelText } = render(
          <ColumnChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'column/stackedcolumn100',
              totalLabels: {
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
    });
  });

  describe('Area Chart', () => {
    describe('basic stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply rotation property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.rotation).toBe(60);
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked100',
              totalLabels: {
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

      it('should apply borderColor property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.borderColor).toBe('#0000ff');
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked',
              totalLabels: {
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

      it('should apply prefix and suffix properties to total labels', async () => {
        const { findByLabelText, findByText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked100',
              totalLabels: {
                enabled: true,
                prefix: 'Area: ',
                suffix: ' sq units',
              },
            }}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(await findByText('Area: 4.54K sq units')).toBeInTheDocument();
      });

      it('should apply comprehensive textStyle properties to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.style?.fontFamily).toBe('Georgia, serif');
          expect(stackLabels?.style?.fontSize).toBe('18px');
          expect(stackLabels?.style?.fontWeight).toBe('700');
          expect(stackLabels?.style?.fontStyle).toBe('oblique');
          expect(stackLabels?.style?.textOutline).toBe('3px solid #000');
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked',
              totalLabels: {
                enabled: true,
                textStyle: {
                  fontFamily: 'Georgia, serif',
                  fontSize: '18px',
                  fontWeight: '700',
                  fontStyle: 'oblique',
                  textOutline: '3px solid #000',
                },
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply linear gradient backgroundColor to total labels', async () => {
        const linearGradient = createLinearGradient(GradientDirections.rightToLeft, [
          { position: 0, color: '#ff00ff' },
          { position: 0.5, color: '#00ffff' },
          { position: 1, color: '#ffff00' },
        ]);

        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.backgroundColor).toEqual({
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
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked',
              totalLabels: {
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

      it('should apply radial gradient borderColor to total labels', async () => {
        const radialGradient = createRadialGradient(RadialGradientPresets.bottomLeft, [
          { position: 0, color: '#ffffff' },
          { position: 0.5, color: '#cccccc' },
          { position: 1, color: '#000000' },
        ]);

        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          const stackLabels = getStackLabels(options);
          expect(stackLabels?.borderColor).toEqual({
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
              subtype: 'area/stacked100',
              totalLabels: {
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

    describe('stacked stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply rotation property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.rotation).toBe(-30);
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked',
              totalLabels: {
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
    });

    describe('stacked100 stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked100',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });

      it('should apply rotation property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.rotation).toBe(45);
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked100',
              totalLabels: {
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
    });

    describe('spline stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stacked100',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });
    });

    describe('stackedspline stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stackedspline',
              totalLabels: {
                enabled: true,
              },
            }}
            onBeforeRender={onBeforeRender}
          />,
        );

        expect(await findByLabelText('chart-root')).toBeInTheDocument();
        expect(onBeforeRender).toHaveBeenCalled();
      });
    });

    describe('stackedspline100 stack type', () => {
      it('should apply enabled property to total labels', async () => {
        const onBeforeRender = vi.fn((options: HighchartsOptions) => {
          expect(getStackLabels(options)?.enabled).toBe(true);
          return options;
        });

        const { findByLabelText } = render(
          <AreaChart
            dataSet={mockData}
            dataOptions={mockDataOptions}
            styleOptions={{
              subtype: 'area/stackedspline100',
              totalLabels: {
                enabled: true,
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
});
