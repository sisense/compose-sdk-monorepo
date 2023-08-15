import { buildCategories, defaultScatterDataValue, groupData } from './scatter_data';
import { ScatterDataTable } from './types';
import { DataTable } from '../chart-data-processor/table_processor';
import { ScatterChartDataOptionsInternal } from '../chart-data-options/types';

describe('Scatter Chart Data', () => {
  const mockData: DataTable = {
    columns: [
      { name: 'col_1', type: 'number', index: 0, direction: 0 },
      { name: 'col_2', type: 'number', index: 1, direction: 0 },
      { name: 'col_3', type: 'string', index: 2, direction: 0 },
      { name: 'col_4', type: 'string', index: 3, direction: 0 },
      { name: 'col_5', type: 'number', index: 4, direction: 0 },
    ],
    rows: [
      [
        {
          displayValue: '7',
        },
        {
          displayValue: '14',
        },
        {
          displayValue: 'S1',
        },
        {
          displayValue: 'S2',
        },
        {
          displayValue: '34',
        },
      ],
    ],
  };

  describe('groupData', () => {
    it('should group data and fill y-axis with default values', () => {
      const dataOptions = {
        x: { name: 'col_1' },
      } as ScatterChartDataOptionsInternal;

      const groupedData = groupData(dataOptions, mockData);

      const expected: ScatterDataTable = [
        {
          xAxis: { displayValue: '7' },
          yAxis: defaultScatterDataValue,
        },
      ];

      expect(groupedData).toMatchObject(expected);
    });

    it('should group data and fill x-axis with default values', () => {
      const dataOptions = {
        y: { name: 'col_1' },
      } as ScatterChartDataOptionsInternal;

      const groupedData = groupData(dataOptions, mockData);

      const expected = [
        {
          xAxis: defaultScatterDataValue,
          yAxis: { displayValue: '7' },
        },
      ];

      expect(groupedData).toMatchObject(expected);
    });

    it('should correct fill x and y axis', () => {
      const dataOptions = {
        x: { name: 'col_1' },
        y: { name: 'col_2' },
      } as ScatterChartDataOptionsInternal;

      const groupedData = groupData(dataOptions, mockData);

      const expected = [
        {
          xAxis: { displayValue: '7' },
          yAxis: { displayValue: '14' },
        },
      ];

      expect(groupedData).toMatchObject(expected);
    });

    it('should correct fill break by / point', () => {
      const dataOptions = {
        breakByPoint: { name: 'col_1' },
      } as ScatterChartDataOptionsInternal;

      const groupedData = groupData(dataOptions, mockData);

      const expected = [
        {
          xAxis: defaultScatterDataValue,
          yAxis: defaultScatterDataValue,
          breakByPoint: { displayValue: '7' },
        },
      ];

      expect(groupedData).toMatchObject(expected);
    });

    it('should correct fill x-axis, y-axis and break by / point', () => {
      const dataOptions = {
        x: { name: 'col_1' },
        y: { name: 'col_2' },
        breakByPoint: { name: 'col_3' },
      } as ScatterChartDataOptionsInternal;

      const groupedData = groupData(dataOptions, mockData);

      const expected = [
        {
          xAxis: { displayValue: '7' },
          yAxis: { displayValue: '14' },
          breakByPoint: { displayValue: 'S1' },
        },
      ];

      expect(groupedData).toMatchObject(expected);
    });

    it('should correct fill break by / color', () => {
      const dataOptions = {
        breakByColor: { name: 'col_1' },
      } as ScatterChartDataOptionsInternal;

      const groupedData = groupData(dataOptions, mockData);

      const expected = [
        {
          xAxis: defaultScatterDataValue,
          yAxis: defaultScatterDataValue,
          breakByColor: { displayValue: '7' },
        },
      ];

      expect(groupedData).toMatchObject(expected);
    });

    it('should correct fill x-axis, y-axis and break by / color', () => {
      const dataOptions = {
        x: { name: 'col_1' },
        y: { name: 'col_2' },
        breakByColor: { name: 'col_3' },
      } as ScatterChartDataOptionsInternal;

      const groupedData = groupData(dataOptions, mockData);

      const expected = [
        {
          xAxis: { displayValue: '7' },
          yAxis: { displayValue: '14' },
          breakByColor: { displayValue: 'S1' },
        },
      ];

      expect(groupedData).toMatchObject(expected);
    });

    it('should correct fill size', () => {
      const dataOptions = {
        size: { name: 'col_5' },
      } as ScatterChartDataOptionsInternal;

      const groupedData = groupData(dataOptions, mockData);

      const expected = [
        {
          xAxis: defaultScatterDataValue,
          yAxis: defaultScatterDataValue,
          size: { displayValue: '34' },
        },
      ];

      expect(groupedData).toMatchObject(expected);
    });

    it('should correct fill x-axis, y-axis, break by / point and size', () => {
      const dataOptions = {
        x: { name: 'col_1' },
        y: { name: 'col_2' },
        breakByPoint: { name: 'col_3' },
        size: { name: 'col_5' },
      } as ScatterChartDataOptionsInternal;

      const groupedData = groupData(dataOptions, mockData);

      const expected = [
        {
          xAxis: { displayValue: '7' },
          yAxis: { displayValue: '14' },
          breakByPoint: { displayValue: 'S1' },
          size: { displayValue: '34' },
        },
      ];

      expect(groupedData).toMatchObject(expected);
    });
  });

  describe('buildCategories', () => {
    it('should return only unique values', () => {
      const data: ScatterDataTable = [
        {
          xAxis: { displayValue: 'test1' },
          yAxis: defaultScatterDataValue,
        },
        {
          xAxis: { displayValue: 'test1' },
          yAxis: defaultScatterDataValue,
        },
        {
          xAxis: { displayValue: 'test2' },
          yAxis: defaultScatterDataValue,
        },
      ];
      const actual = buildCategories(data, 'xAxis');
      const expected = ['test1', 'test2'];
      expect(actual).toStrictEqual(expected);
    });
  });
});
