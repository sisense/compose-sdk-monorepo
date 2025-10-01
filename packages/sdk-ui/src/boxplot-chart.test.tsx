import { render } from '@testing-library/react';
import { HighchartsOptions, SeriesType } from './chart-options-processor/chart-options-service';
import type { Data } from '@ethings-os/sdk-data';
import { BoxplotChart } from './boxplot-chart';
import { withBlurredRows } from './__test-helpers__';

const dataSet: Data = {
  columns: [
    {
      name: 'Category',
      type: 'text',
    },
    {
      name: 'Box Min',
      type: 'number',
    },
    {
      name: 'Box Median',
      type: 'number',
    },
    {
      name: 'Box Max',
      type: 'number',
    },
    {
      name: 'Whisker Min',
      type: 'number',
    },
    {
      name: 'Whisker Max',
      type: 'number',
    },
    {
      name: 'Outlier Count',
      type: 'number',
    },
    {
      name: 'Cost (Outliers)',
      type: 'number',
    },
  ],
  rows: [
    [
      'Apple Mac Desktops',
      168.3239288330078,
      335.3749694824219,
      577.9123840332031,
      -446.05875396728516,
      1192.295066833496,
      2,
      '1232.0960693359375,1408.0069580078125',
    ],
    [
      'Apple Mac Laptops',
      153.461296081543,
      281.7227478027344,
      559.2744293212891,
      -455.2584037780761,
      1167.9941291809082,
      3,
      '1181.6976318359375,1200,1222.219970703125',
    ],
  ],
};

const [
  category,
  boxMinValue,
  boxMedianValue,
  boxMaxValue,
  whiskerMinValue,
  whiskerMaxValue,
  outlierCount,
  outlierValue,
] = dataSet.columns;

const costValue = {
  name: 'Cost',
  type: 'number',
  // having mocked jaql method in order to allow generating iternal formulas
  jaql: () => ({}),
};

describe('Boxplot Chart', () => {
  it('render boxplot with custom data options that allow to pass all values', async () => {
    const { findByLabelText } = render(
      <BoxplotChart
        dataSet={dataSet}
        dataOptions={{
          category: [category],
          value: [
            boxMinValue,
            boxMedianValue,
            boxMaxValue,
            whiskerMinValue,
            whiskerMaxValue,
            outlierCount,
          ],
          outliers: [outlierValue],
          valueTitle: 'Some data title',
        }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });

  it('render boxplot with single value in data options', async () => {
    const { findByLabelText } = render(
      <BoxplotChart
        dataSet={dataSet}
        dataOptions={{
          category: [category],
          value: [costValue],
          boxType: 'iqr',
          outliersEnabled: true,
        }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });

  it('render boxplot without outlier points', async () => {
    const { findByLabelText } = render(
      <BoxplotChart
        dataSet={dataSet}
        dataOptions={{
          category: [category],
          value: [costValue],
          boxType: 'iqr',
          outliersEnabled: false,
        }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options.series?.length).toBe(1);
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });

  it('render boxplot with only values (without category)', async () => {
    const { findByLabelText } = render(
      <BoxplotChart
        dataSet={dataSet}
        dataOptions={{
          category: [],
          value: [costValue],
          boxType: 'iqr',
          outliersEnabled: true,
        }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect((options.series?.[0] as SeriesType).data.length).toBe(1);
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });

  it('render boxplot with highlights', async () => {
    const bluredDataIndexes = [0];

    const { findByLabelText } = render(
      <BoxplotChart
        dataSet={withBlurredRows(dataSet, bluredDataIndexes)}
        dataOptions={{
          category: [category],
          value: [costValue],
          boxType: 'iqr',
          outliersEnabled: true,
        }}
        onBeforeRender={(options: HighchartsOptions) => {
          (options.series?.[0] as SeriesType).data.forEach(({ selected }, index) => {
            const isCorrectBlurApplied = bluredDataIndexes.includes(index) ? selected : !selected;
            expect(isCorrectBlurApplied).toBe(true);
          });

          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });
});
