/* eslint-disable max-lines-per-function */
/* eslint-disable sonarjs/no-duplicate-string */
import { test, expect } from '@playwright/experimental-ct-react';
import {
  Chart,
  ChartProps,
  Table,
  TableProps,
  IndicatorChart,
  IndicatorChartProps,
} from '@sisense/sdk-ui';
import { data, attributes, measures } from './__mocks__/dataMocks';

test.describe('React Chart sizing', () => {
  test.describe('Highcharts related charts', () => {
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
        width: 400,
        height: 400,
      };
      const component = await mount(
        <div style={{ display: 'inline-block' }}>
          <Chart {...lineChartProps} />
        </div>,
      );
      const chart = component.locator('> *');
      const highchartsRoot = chart.locator('.highcharts-root');

      expect(await chart.boundingBox()).toMatchObject(expectedChartSize);
      expect(await highchartsRoot.boundingBox()).toMatchObject(expectedChartSize);
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

      expect(await chart.boundingBox()).toMatchObject(expectedChartSize);
      expect(await highchartsRoot.boundingBox()).toMatchObject(expectedChartSize);
    });
  });

  test.describe('Table chart', () => {
    const tableProps: TableProps = {
      dataSet: data,
      dataOptions: {
        columns: [attributes.years, measures.totalQuantity],
      },
    };

    test('should render Table chart with default sizes', async ({ mount }) => {
      const expectedChartSize = {
        width: 400,
        height: 500,
      };
      const component = await mount(
        // Uses `inline-block` in order to prevent parent width inheriting
        <div style={{ display: 'inline-block' }}>
          <Table {...tableProps} />
        </div>,
      );
      const chart = component.locator('> *');
      const tableRoot = component.getByTestId('table-root');

      expect(await chart.boundingBox()).toMatchObject(expectedChartSize);
      expect(await tableRoot.boundingBox()).toMatchObject(expectedChartSize);
    });

    test('should render Table chart with sizes of the containing element', async ({ mount }) => {
      const expectedChartSize = {
        width: 600,
        height: 300,
      };
      const component = await mount(
        <div style={{ width: expectedChartSize.width, height: expectedChartSize.height }}>
          <Table {...tableProps} />
        </div>,
      );
      const chart = component.locator('> *');
      const tableRoot = component.getByTestId('table-root');

      expect(await chart.boundingBox()).toMatchObject(expectedChartSize);
      expect(await tableRoot.boundingBox()).toMatchObject(expectedChartSize);
    });
  });

  test.describe('Indicator chart', () => {
    const indicatorProps: IndicatorChartProps = {
      dataSet: data,
      dataOptions: {
        value: [measures.totalQuantity],
        secondary: [measures.totalUnits],
      },
    };

    test('should render Indicator chart with default sizes', async ({ mount }) => {
      const expectedChartSize = {
        width: 200,
        height: 200,
      };
      const component = await mount(
        // Uses `inline-block` in order to prevent parent width inheriting
        <div style={{ display: 'inline-block' }}>
          <IndicatorChart {...indicatorProps} />
        </div>,
      );
      const chart = component.locator('> *');
      const indicatorRoot = component.getByTestId('indicator-root');

      expect(await chart.boundingBox()).toMatchObject(expectedChartSize);
      expect(await indicatorRoot.boundingBox()).toMatchObject(expectedChartSize);
    });

    test('should render Indicator chart with sizes of the containing element', async ({
      mount,
    }) => {
      const expectedChartSize = {
        width: 600,
        height: 400,
      };
      const component = await mount(
        <div style={{ width: expectedChartSize.width, height: expectedChartSize.height }}>
          <IndicatorChart {...indicatorProps} />
        </div>,
      );
      const chart = component.locator('> *');
      const indicatorRoot = component.getByTestId('indicator-root');

      expect(await chart.boundingBox()).toMatchObject(expectedChartSize);
      expect(await indicatorRoot.boundingBox()).toMatchObject(expectedChartSize);
    });
  });
});
