import uniqueId from 'lodash-es/uniqueId';
import merge from 'ts-deepmerge';
import {
  BoxplotChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
  HighchartsPoint,
  RangeChartDataOptionsInternal,
  ScatterChartDataOptionsInternal,
  StyledColumn,
  StyledMeasureColumn,
} from '..';
import { getDataPoint } from './data-points';

const createPointMock = (chartType: string, point: Partial<HighchartsPoint>) => {
  return merge(
    {
      series: {
        chart: {
          options: {
            chart: {
              type: chartType,
            },
          },
        },
      },
      options: {
        custom: {},
      },
    },
    point,
  ) as HighchartsPoint;
};

const createDataOptionMock = (isMeasure?: boolean) => {
  const base = { testId: uniqueId() };

  if (isMeasure) {
    return {
      ...base,
      column: {
        name: 'some measure name',
        aggregation: 'sum',
      },
    } as StyledMeasureColumn;
  }
  return {
    ...base,
    column: {
      name: 'some attribute name',
      type: 'attribute',
    },
  } as StyledColumn;
};

describe('getDataPoint', () => {
  it('should prepare scatter data point with valid entries', () => {
    const rawPoint = createPointMock('scatter', {
      custom: {
        maskedX: '1',
        maskedY: '2',
        maskedBreakByPoint: '3',
        maskedBreakByColor: '4',
        maskedSize: '5',
      },
    });
    const dataOptions = {
      x: createDataOptionMock(),
      y: createDataOptionMock(),
      breakByPoint: createDataOptionMock(),
      breakByColor: createDataOptionMock(),
      size: createDataOptionMock(true),
    } as ScatterChartDataOptionsInternal;

    const { entries } = getDataPoint(rawPoint, dataOptions);

    expect(entries).toMatchObject({
      x: {
        id: 'x',
        value: '1',
        dataOption: dataOptions.x,
      },
      y: {
        id: 'y',
        value: '2',
        dataOption: dataOptions.y,
      },
      breakByPoint: {
        id: 'breakByPoint',
        value: '3',
        dataOption: dataOptions.breakByPoint,
      },
      breakByColor: {
        id: 'breakByColor',
        value: '4',
        dataOption: dataOptions.breakByColor,
      },
      size: {
        id: 'size',
        value: '5',
        dataOption: dataOptions.size,
      },
    });
  });

  it('should prepare funnel data point with valid entries', () => {
    const rawPoint = createPointMock('funnel', {
      custom: {
        xValue: [1],
        rawValue: 2,
      },
    });
    const dataOptions = {
      breakBy: [createDataOptionMock()],
      y: [createDataOptionMock(true)],
    } as unknown as CategoricalChartDataOptionsInternal;

    const { entries } = getDataPoint(rawPoint, dataOptions);

    expect(entries).toMatchObject({
      category: [
        {
          id: 'category.0',
          value: 1,
          dataOption: dataOptions.breakBy[0],
        },
      ],
      value: [
        {
          id: 'value.0',
          value: 2,
          dataOption: dataOptions.y[0],
        },
      ],
    });
  });

  it('should prepare pie data point with valid entries', () => {
    const rawPoint = createPointMock('pie', {
      custom: {
        xValue: [1],
        rawValue: 2,
      },
    });
    const dataOptions = {
      breakBy: [createDataOptionMock()],
      y: [createDataOptionMock(true)],
    } as unknown as CategoricalChartDataOptionsInternal;

    const { entries } = getDataPoint(rawPoint, dataOptions);

    expect(entries).toMatchObject({
      category: [
        {
          id: 'category.0',
          value: 1,
          dataOption: dataOptions.breakBy[0],
        },
      ],
      value: [
        {
          id: 'value.0',
          value: 2,
          dataOption: dataOptions.y[0],
        },
      ],
    });
  });

  it('should prepare treemap/sunburst data point with valid entries', () => {
    const rawPoint = createPointMock('treemap', {
      custom: {
        rawValues: [1],
      },
      value: 2,
      options: {
        custom: {
          level: 1,
        },
      },
    } as unknown as HighchartsPoint);
    const dataOptions = {
      breakBy: [createDataOptionMock()],
      y: [createDataOptionMock(true)],
    } as unknown as CategoricalChartDataOptionsInternal;

    const { entries } = getDataPoint(rawPoint, dataOptions);

    expect(entries).toMatchObject({
      category: [
        {
          id: 'category.0',
          value: 1,
          dataOption: dataOptions.breakBy[0],
        },
      ],
      value: [
        {
          id: 'value.0',
          value: 2,
          dataOption: dataOptions.y[0],
        },
      ],
    });
  });

  it('should prepare boxplot data point with valid entries', () => {
    const rawPoint = createPointMock('boxplot', {
      options: {
        q1: 1,
        median: 2,
        q3: 3,
        low: 4,
        high: 5,
      },
      custom: {
        xValue: [6],
      },
    } as HighchartsPoint);
    const dataOptions = {
      category: createDataOptionMock(),
      boxMin: createDataOptionMock(true),
      boxMedian: createDataOptionMock(true),
      boxMax: createDataOptionMock(true),
      whiskerMin: createDataOptionMock(true),
      whiskerMax: createDataOptionMock(true),
    } as BoxplotChartDataOptionsInternal;

    const { entries } = getDataPoint(rawPoint, dataOptions);

    expect(entries).toMatchObject({
      category: [
        {
          id: 'category.0',
          value: 6,
          dataOption: dataOptions.category,
        },
      ],
      value: [
        {
          id: 'value.0.boxMin',
          value: 1,
          dataOption: dataOptions.boxMin,
        },
        {
          id: 'value.0.boxMedian',
          value: 2,
          dataOption: dataOptions.boxMedian,
        },
        {
          id: 'value.0.boxMax',
          value: 3,
          dataOption: dataOptions.boxMax,
        },
        {
          id: 'value.0.whiskerMin',
          value: 4,
          dataOption: dataOptions.whiskerMin,
        },
        {
          id: 'value.0.whiskerMax',
          value: 5,
          dataOption: dataOptions.whiskerMax,
        },
      ],
    });
  });

  it('should prepare arearange data point with valid entries', () => {
    const rawPoint = createPointMock('arearange', {
      custom: {
        xValue: [1],
      },
      options: {
        low: 2,
        high: 3,
      },
      series: {
        index: 0,
        options: {
          custom: {
            rawValue: [4],
          },
        },
      },
    } as HighchartsPoint);
    const dataOptions = {
      x: [createDataOptionMock()],
      rangeValues: [[createDataOptionMock(true), createDataOptionMock(true)]],
      breakBy: [createDataOptionMock()],
    } as unknown as RangeChartDataOptionsInternal;

    const { entries } = getDataPoint(rawPoint, dataOptions);

    expect(entries).toMatchObject({
      category: [
        {
          id: 'category.0',
          value: 1,
          dataOption: dataOptions.x[0],
        },
      ],
      value: [
        {
          id: 'value.0.lowerBound',
          value: 2,
          dataOption: dataOptions.rangeValues[0][0],
        },
        {
          id: 'value.0.upperBound',
          value: 3,
          dataOption: dataOptions.rangeValues[0][1],
        },
      ],
      breakBy: [
        {
          id: 'breakBy.0',
          value: 4,
          dataOption: dataOptions.breakBy[0],
        },
      ],
    });
  });

  it('should prepare cartesian data point with valid entries', () => {
    const rawPoint = createPointMock('column', {
      custom: {
        rawValue: 2,
        xValue: [1],
      },
      series: {
        index: 0,
        options: {
          custom: {
            rawValue: [3],
          },
        },
      },
    } as HighchartsPoint);
    const dataOptions = {
      x: [createDataOptionMock()],
      y: [createDataOptionMock(true)],
      breakBy: [createDataOptionMock()],
    } as unknown as CartesianChartDataOptionsInternal;

    const { entries } = getDataPoint(rawPoint, dataOptions);

    expect(entries).toMatchObject({
      category: [
        {
          id: 'category.0',
          value: 1,
          dataOption: dataOptions.x[0],
        },
      ],
      value: [
        {
          id: 'value.0',
          value: 2,
          dataOption: dataOptions.y[0],
        },
      ],
      breakBy: [
        {
          id: 'breakBy.0',
          value: 3,
          dataOption: dataOptions.breakBy[0],
        },
      ],
    });
  });
});
