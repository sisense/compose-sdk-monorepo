import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import { Chart, ChartProps } from '@sisense/sdk-ui';
import { data, attributes, measures } from './__mocks__/dataMocks';

test.describe('React Chart sizing', () => {
  test.describe('Charts based on Highcharts', () => {
    test('should render Line chart with default height - 400px', async ({ mount }) => {
      const lineChartProps: ChartProps = {
        chartType: 'line',
        dataSet: data,
        dataOptions: {
          category: [attributes.years],
          value: [measures.totalUnits],
          breakBy: [],
        },
      };
      const expectedChartSize = {
        width: 500,
        height: 400,
      };
      const component = await mount(
        <div style={{ width: expectedChartSize.width }}>
          <Chart {...lineChartProps} />
        </div>,
      );
      const chart = component.locator('> *');
      const highchartsRoot = chart.locator('.highcharts-root');

      await expect(await chart.boundingBox()).toMatchObject(expectedChartSize);
      await expect(await highchartsRoot.boundingBox()).toMatchObject(expectedChartSize);
    });

    test('should render Pie chart with sizes of the containing element', async ({ mount }) => {
      const pieChartProps: ChartProps = {
        chartType: 'pie',
        dataSet: data,
        dataOptions: {
          category: [attributes.years],
          value: [measures.totalQuantity],
        },
      };
      const expectedChartSize = {
        width: 600,
        height: 500,
      };
      const component = await mount(
        <div style={{ width: expectedChartSize.width, height: expectedChartSize.height }}>
          <Chart {...pieChartProps} />
        </div>,
      );
      const chart = component.locator('> *');
      const highchartsRoot = chart.locator('.highcharts-root');

      await expect(await chart.boundingBox()).toMatchObject(expectedChartSize);
      await expect(await highchartsRoot.boundingBox()).toMatchObject(expectedChartSize);
    });
  });
});
