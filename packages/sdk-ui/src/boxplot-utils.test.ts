import { createAttribute, Measure, type Data, type QueryResultData } from '@sisense/sdk-data';
import { boxWhiskerProcessResult, executeBoxplotQuery } from './boxplot-utils.js';
import { isObject } from 'lodash';
import { executePivotQueryMock } from './query/__mocks__/execute-query';
import { Value, type ClientApplication } from './index.js';

vi.mock('./query/execute-query');

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

    it('should combine unsorted "boxWhisker" and "outliers" data into single dataset based on data options', () => {
      const reverseDatasetColumnsOrder = (dataset: Data) => {
        return {
          columns: dataset.columns.slice().reverse(),
          rows: dataset.rows.map((row) => row.slice().reverse()),
        };
      };
      const result = boxWhiskerProcessResult(
        reverseDatasetColumnsOrder(normalizeDataset(boxWhiskerDataSet)) as QueryResultData,
        reverseDatasetColumnsOrder(normalizeDataset(outliersDataSet)) as QueryResultData,
        {
          category: [fullDataSet.columns[0]],
          value: fullDataSet.columns.slice(1, 7),
          outliers: [fullDataSet.columns[7]],
          valueTitle: 'Test data',
        },
      );

      // sort result dataset in order to compare it with original dataset
      const normalizedResult = reverseDatasetColumnsOrder({
        columns: [result.columns[7], ...result.columns.slice(0, 7)],
        rows: result.rows.map((row) => [row[7], ...row.slice(0, 7)]),
      });

      expect(normalizedResult).toEqual(normalizeDataset(fullDataSet));
    });

    it('should return original "boxWhisker" data in case of incorrect "outliers" configuration specified in data options', () => {
      const result = boxWhiskerProcessResult(
        normalizeDataset(boxWhiskerDataSet) as QueryResultData,
        normalizeDataset(outliersDataSet) as QueryResultData,
        {
          category: [fullDataSet.columns[0]],
          value: fullDataSet.columns.slice(1, 7),
          outliers: [
            {
              name: 'Incorrect "outliers" column',
              type: 'number',
            },
          ],
          valueTitle: 'Test data',
        },
      );

      expect(result).toEqual(normalizeDataset(boxWhiskerDataSet));
    });

    it('should combine "boxWhisker" and "outliers" data into single dataset in case of no categories', () => {
      const withoutCategoryColumn = (dataset: Data) => {
        const notTruncatedCategoryName = dataset.rows[0][0];
        return {
          columns: dataset.columns.slice(1),
          rows: dataset.rows
            .filter((row) => row[0] === notTruncatedCategoryName)
            .map((row) => row.slice(1)),
        };
      };
      const result = boxWhiskerProcessResult(
        normalizeDataset(withoutCategoryColumn(boxWhiskerDataSet)) as QueryResultData,
        normalizeDataset(withoutCategoryColumn(outliersDataSet)) as QueryResultData,
        {
          category: [],
          value: fullDataSet.columns.slice(1, 7),
          outliers: [fullDataSet.columns[7]],
          valueTitle: 'Test data',
        },
      );

      expect(result).toEqual(normalizeDataset(withoutCategoryColumn(fullDataSet)));
    });
  });

  describe('executeBoxplotQuery', () => {
    beforeEach(() => {
      executePivotQueryMock.mockClear();
    });

    it('should return only "boxWhisker" data (no "outliers" data)', async () => {
      executePivotQueryMock.mockResolvedValueOnce(normalizeDataset(boxWhiskerDataSet));

      const result = await executeBoxplotQuery(
        {
          app: {} as ClientApplication,
          chartDataOptions: {
            category: fullDataSet.columns[0],
            boxMin: fullDataSet.columns[1] as unknown as Value,
            boxMedian: fullDataSet.columns[2] as unknown as Value,
            boxMax: fullDataSet.columns[3] as unknown as Value,
            whiskerMin: fullDataSet.columns[4] as unknown as Value,
            whiskerMax: fullDataSet.columns[5] as unknown as Value,
            outliersCount: fullDataSet.columns[6] as unknown as Value,
            valueTitle: 'Test data',
          },
          dataSource: 'Dummy datasource',
          attributes: [createAttribute(fullDataSet.columns[0])],
          measures: fullDataSet.columns.slice(1, 7) as Measure[],
          filters: [],
          highlights: [],
        },
        executePivotQueryMock,
      );

      expect(result).toEqual(normalizeDataset(boxWhiskerDataSet));
    });

    it('should return combined "boxWhisker" and "outliers" data', async () => {
      executePivotQueryMock.mockResolvedValueOnce(normalizeDataset(boxWhiskerDataSet));
      executePivotQueryMock.mockResolvedValueOnce(normalizeDataset(outliersDataSet));

      const result = await executeBoxplotQuery(
        {
          app: {} as ClientApplication,
          chartDataOptions: {
            category: fullDataSet.columns[0],
            boxMin: fullDataSet.columns[1] as unknown as Value,
            boxMedian: fullDataSet.columns[2] as unknown as Value,
            boxMax: fullDataSet.columns[3] as unknown as Value,
            whiskerMin: fullDataSet.columns[4] as unknown as Value,
            whiskerMax: fullDataSet.columns[5] as unknown as Value,
            outliersCount: fullDataSet.columns[6] as unknown as Value,
            outliers: fullDataSet.columns[7],
            valueTitle: 'Test data',
          },
          dataSource: 'Dummy datasource',
          attributes: [
            createAttribute(fullDataSet.columns[0]),
            createAttribute(fullDataSet.columns[7]),
          ],
          measures: fullDataSet.columns.slice(1, 7) as Measure[],
          filters: [],
          highlights: [],
        },
        executePivotQueryMock,
      );

      expect(result).toEqual(normalizeDataset(fullDataSet));
    });
  });
});
