import type { Data, QueryResultData } from '@sisense/sdk-data';
import { boxWhiskerProcessResult } from './boxplot-utils';
import { isObject } from 'lodash';

const fullDataSet: Data = {
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

const boxWhiskerDataSet: Data = {
  columns: fullDataSet.columns.slice(0, 7),
  rows: fullDataSet.rows.map((row) => row.slice(0, 7)),
};

const outliersDataSet: Data = {
  columns: [fullDataSet.columns[0], fullDataSet.columns[7]],
  rows: fullDataSet.rows.reduce((splittedRows: Data['rows'], row: Data['rows'][number]) => {
    const category = row[0];
    const combinedOutlierPoints = row[7] as string;
    return [
      ...splittedRows,
      ...combinedOutlierPoints
        .split(',')
        .map((outlierValue) => [category, parseFloat(outlierValue)]),
    ];
  }, []),
};

// forces having cells in dataset
function normalizeDataset(dataset: Data) {
  return {
    ...dataset,
    rows: dataset.rows.map((row) =>
      row.map((value) => (isObject(value) ? value : { data: value })),
    ),
  };
}

describe('Boxplot Utils', () => {
  describe('boxWhiskerProcessResult', () => {
    it('should combine "boxWhisker" and "outliers" data into single dataset', () => {
      const result = boxWhiskerProcessResult(
        normalizeDataset(boxWhiskerDataSet) as QueryResultData,
        normalizeDataset(outliersDataSet) as QueryResultData,
      );

      expect(result).toEqual(normalizeDataset(fullDataSet));
    });
  });
});
