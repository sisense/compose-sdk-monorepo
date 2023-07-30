import { getAttributes, getMeasures, translateChartDataOptions } from './translate_data_options';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ScatterChartDataOptions,
  IndicatorDataOptions,
  StyledColumn,
  StyledMeasureColumn,
  ChartDataOptions,
  AnyColumn,
  Category,
} from './types';
import { Attribute, Column, Measure, MeasureColumn } from '@sisense/sdk-data';
import { ChartType } from '../types';

const col1: Column = {
  name: 'Years',
  type: 'date',
};
const col2: Column = {
  name: 'Group',
  type: 'string',
};

const col3: Column = {
  name: 'Category',
  type: 'string',
};

const col3Styled: StyledColumn = {
  column: col3,
};

const meas1: MeasureColumn = {
  name: 'Quantity',
  aggregation: 'sum',
};
const meas1Styled: StyledMeasureColumn = {
  column: meas1,
  // Series Styles
  showOnRightAxis: false,
};

const meas2: MeasureColumn = { name: 'Units', aggregation: 'sum' };

const meas2Styled: StyledMeasureColumn = {
  column: meas2,
  // Series Styles
  showOnRightAxis: true,
  color: '#0000FF',
};

const meas3: MeasureColumn = {
  name: 'Unique Users',
  aggregation: 'sum',
};

const cartesianDataOptions: CartesianChartDataOptions = {
  category: [col1, col3Styled],
  value: [meas1Styled],
  breakBy: [col2],
};

const categoricalDataOptions: CategoricalChartDataOptions = {
  category: [col1, col3Styled],
  value: [meas1Styled],
};

const meas1min: MeasureColumn = { ...meas1, aggregation: 'min' };
const meas1max: MeasureColumn = { ...meas1, aggregation: 'max' };
const indicatorDataOptions: IndicatorDataOptions = {
  value: [meas1Styled],
  secondary: [meas2Styled],
  min: [meas1min],
  max: [meas1max],
};

const scatterDataOptions1: ScatterChartDataOptions = {
  x: col1,
  y: meas2Styled,
  breakByPoint: col2,
  breakByColor: meas1,
  size: meas3,
};

const scatterDataOptions2: ScatterChartDataOptions = {
  x: col1,
  y: col2,
  breakByColor: meas2,
  size: meas3,
};

type ConvertableToColumn = Measure | Attribute | Category | AnyColumn;

function verifyColumn(column: ConvertableToColumn, expectedColumn: AnyColumn) {
  // need to verify props separately in order to access inherited properties from the result column
  for (const key in expectedColumn) {
    expect(column[key]).toEqual(expectedColumn[key]);
  }
}

// Verifies Attributes, Measures, Categories as Column items
function verifyColumns(columns: ConvertableToColumn[], expectedColumns: AnyColumn[]) {
  expect(columns).toHaveLength(expectedColumns.length);

  expectedColumns.forEach((expectedColumn, index) => verifyColumn(columns[index], expectedColumn));
}

describe('translate data options', () => {
  describe('getAttributes', () => {
    it('returns correct attributes for cartesian data options', () => {
      const chartType = 'column';
      const chartDataOptions = translateChartDataOptions(chartType, cartesianDataOptions);

      verifyColumns(getAttributes(chartDataOptions, chartType), [col1, col3, col2]);
    });

    it('returns correct attributes for categorical data options', () => {
      const chartType = 'pie';
      const chartDataOptions = translateChartDataOptions(chartType, categoricalDataOptions);
      verifyColumns(getAttributes(chartDataOptions, chartType), [col1, col3]);
    });

    it('returns correct attributes for indicator data options', () => {
      const chartType = 'indicator';
      const chartDataOptions = translateChartDataOptions(chartType, indicatorDataOptions);
      verifyColumns(getAttributes(chartDataOptions, chartType), []);
    });

    it('returns correct attributes for full scatter data options', () => {
      const chartType = 'scatter';
      const chartDataOptions = translateChartDataOptions(chartType, scatterDataOptions1);
      verifyColumns(getAttributes(chartDataOptions, chartType), [col1, col2]);
    });

    it('returns correct attributes for incomplete scatter data options', () => {
      const chartType = 'scatter';
      const chartDataOptions = translateChartDataOptions(chartType, scatterDataOptions2);
      verifyColumns(getAttributes(chartDataOptions, chartType), [col1, col2]);
    });
  });

  describe('getMeasures', () => {
    it('returns correct measures for cartesian data options', () => {
      const chartType = 'bar';
      const chartDataOptions = translateChartDataOptions(chartType, cartesianDataOptions);
      verifyColumns(getMeasures(chartDataOptions, chartType), [meas1]);
    });

    it('returns correct measures for categorical data options', () => {
      const chartType = 'funnel';
      const chartDataOptions = translateChartDataOptions(chartType, categoricalDataOptions);
      verifyColumns(getMeasures(chartDataOptions, chartType), [meas1]);
    });

    it('returns correct measures for indicator data options', () => {
      const chartType = 'indicator';
      const chartDataOptions = translateChartDataOptions(chartType, indicatorDataOptions);
      verifyColumns(getMeasures(chartDataOptions, chartType), [meas1, meas2, meas1min, meas1max]);
    });

    it('returns correct measures for full scatter data options', () => {
      const chartType = 'scatter';
      const chartDataOptions = translateChartDataOptions(chartType, scatterDataOptions1);
      verifyColumns(getMeasures(chartDataOptions, chartType), [meas2, meas1, meas3]);
    });

    it('returns correct measures for incomplete scatter data options', () => {
      const chartType = 'scatter';
      const chartDataOptions = translateChartDataOptions(chartType, scatterDataOptions2);
      verifyColumns(getMeasures(chartDataOptions, chartType), [meas2, meas3]);
    });

    it('returns correct measures when a measure has no aggregation', () => {
      const measUnits: MeasureColumn = {
        name: 'Units',
        aggregation: 'sum',
      };
      const colUnits = { name: 'Units' };

      const chartType = 'scatter';
      const chartDataOptions = translateChartDataOptions(chartType, {
        ...scatterDataOptions2,
        y: colUnits,
      });
      verifyColumns(getMeasures(chartDataOptions, chartType), [meas2, measUnits, meas3]);
    });
  });

  it('Should throw error if unsupported chartType provided', () => {
    let isErrorThrew = false;
    try {
      translateChartDataOptions('test' as ChartType, {} as ChartDataOptions);
    } catch (e) {
      isErrorThrew = true;
    }

    expect(isErrorThrew).toBeTruthy();
  });
});
