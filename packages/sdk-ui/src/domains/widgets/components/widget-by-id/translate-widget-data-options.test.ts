/* eslint-disable vitest/expect-expect */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BaseJaql,
  DimensionalAttribute,
  DimensionalBaseMeasure,
  DimensionalCalculatedMeasure,
  FilterJaql,
  JaqlSortDirection,
  PivotJaql,
} from '@sisense/sdk-data';
import isObject from 'lodash-es/isObject';

import {
  AnyColumn,
  BoxplotChartDataOptions,
  PivotTableDataOptions,
  StyledColumn,
  StyledMeasureColumn,
  TableDataOptions,
} from '../../../../domains/visualizations/core/chart-data-options/types.js';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  IndicatorChartDataOptions,
  ScatterChartDataOptions,
} from '../../../../types.js';
import { jaqlMock } from './__mocks__/jaql-mock.js';
import {
  createDataColumn,
  createDataOptionsFromPanels,
  createPanelItem,
  extractDataOptions,
} from './translate-widget-data-options.js';
import { BoxplotWidgetStyle, CurrencyPosition, PanelItem } from './types.js';
import { Panel, WidgetStyle } from './types.js';

const styleMock = {} as WidgetStyle;

function convertToDimensionalModel(
  column: AnyColumn,
): DimensionalAttribute | DimensionalBaseMeasure | DimensionalCalculatedMeasure {
  return ('column' in column ? column.column : column) as
    | DimensionalAttribute
    | DimensionalBaseMeasure
    | DimensionalCalculatedMeasure;
}

function getSortTypeFromJaqlSort(jaqlSort?: `${JaqlSortDirection}`) {
  if (jaqlSort === JaqlSortDirection.ASC) {
    return 'sortAsc';
  } else if (jaqlSort === JaqlSortDirection.DESC) {
    return 'sortDesc';
  } else {
    return 'sortNone';
  }
}

function getSortTypeFromPanelItem(panelItem: PanelItem) {
  const panelSort = panelItem.jaql.sort ?? panelItem.categoriesSorting;
  const pivotSort = (panelItem.jaql as PivotJaql).sortDetails;

  if (isObject(pivotSort)) {
    return {
      direction: getSortTypeFromJaqlSort(pivotSort?.dir),
    };
  }

  return getSortTypeFromJaqlSort(panelSort);
}

function compareBaseJaqls(sourceJaql: BaseJaql | FilterJaql, targetJaql: BaseJaql | FilterJaql) {
  expect(sourceJaql.dim).toEqual(targetJaql.dim);
  expect(sourceJaql.level).toEqual(targetJaql.level);
  expect(sourceJaql.agg).toEqual(targetJaql.agg);
  expect(sourceJaql.title).toEqual(targetJaql.title);
  expect(sourceJaql.sort).toEqual(targetJaql.sort);
  if ('filter' in sourceJaql || 'filter' in targetJaql) {
    expect((sourceJaql as FilterJaql).filter).toEqual((targetJaql as FilterJaql).filter);
  }
}

export function verifyColumn(column: AnyColumn, panelItem: PanelItem) {
  const model = convertToDimensionalModel(column);
  const panelJaql = panelItem.jaql;
  const { jaql } = model.jaql();
  const isFormulaJaql = 'formula' in panelJaql;

  if ('sortType' in column) {
    const expectedSortType = getSortTypeFromPanelItem(panelItem);
    expect(column.sortType).toEqual(expectedSortType);
  }

  if ('chartType' in column) {
    expect(column.chartType).toEqual(panelItem.singleSeriesType);
  }

  if (isFormulaJaql) {
    expect(jaql.formula).toEqual(panelJaql.formula);

    Object.keys(panelJaql.context || {}).forEach((jaqlContextKey) =>
      compareBaseJaqls(
        panelJaql.context![jaqlContextKey] as BaseJaql,
        jaql.context[jaqlContextKey],
      ),
    );
  } else {
    compareBaseJaqls(jaql, panelJaql);
  }
}
describe('utils for widget data options translation', () => {
  describe('translate widget data options', () => {
    describe('extractDataOptions', () => {
      it('should extract data options for table chart correctly', () => {
        const panels = [
          {
            name: 'columns',
            items: [
              {
                jaql: {
                  table: 'Commerce',
                  column: 'Gender',
                  dim: '[Commerce.Gender]',
                  datatype: 'text',
                  title: 'Gender',
                },
              },
            ],
          },
        ] as Panel[];

        const tableDataOptions = extractDataOptions(
          'tablewidget',
          panels,
          styleMock,
        ) as TableDataOptions;

        expect(
          (tableDataOptions.columns[0] as StyledColumn).column instanceof DimensionalAttribute,
        ).toBeTruthy();
        verifyColumn(tableDataOptions.columns[0], panels[0].items[0]);
      });

      it('should return correct data options for cartesian chart', () => {
        const {
          // eslint-disable-next-line no-unused-vars
          sort,
          ...costAggregatedWithoutSort
        } = jaqlMock.costAggregated;
        const panels: Panel[] = [
          {
            name: 'categories',
            items: [
              {
                jaql: jaqlMock.category,
              },
            ],
          },
          {
            name: 'values',
            items: [
              {
                jaql: costAggregatedWithoutSort,
                categoriesSorting: JaqlSortDirection.DESC,
              },
            ],
          },
          {
            name: 'break by',
            items: [
              {
                jaql: jaqlMock.ageRange,
              },
            ],
          },
        ];

        const dataOptions = extractDataOptions('chart/column', panels, styleMock);
        const { category, value, breakBy } = dataOptions as CartesianChartDataOptions;

        verifyColumn(category[0], panels[0].items[0]);
        verifyColumn(value[0], panels[1].items[0]);
        verifyColumn(breakBy[0], panels[2].items[0]);
      });

      it('should return correct data options for cartesian chart with multiple values', () => {
        const panels: Panel[] = [
          {
            name: 'x-axis',
            items: [
              {
                jaql: jaqlMock.category,
              },
            ],
          },
          {
            name: 'values',
            items: [
              {
                jaql: jaqlMock.costAggregated,
                singleSeriesType: 'line',
              },
              {
                jaql: jaqlMock.formula,
                singleSeriesType: 'area',
                y2: true,
              },
            ],
          },
          {
            name: 'break by',
            items: [],
          },
        ];

        const dataOptions = extractDataOptions('chart/area', panels, styleMock);
        const { category, value } = dataOptions as CartesianChartDataOptions;

        verifyColumn(category[0], panels[0].items[0]);
        verifyColumn(value[0], panels[1].items[0]);
        verifyColumn(value[1], panels[1].items[1]);
      });

      it('should return correct data options for categorical chart', () => {
        const panels: Panel[] = [
          {
            name: 'categories',
            items: [
              {
                jaql: jaqlMock.date,
              },
            ],
          },
          {
            name: 'values',
            items: [
              {
                jaql: jaqlMock.costAggregated,
              },
            ],
          },
        ];

        const dataOptions = extractDataOptions('chart/pie', panels, styleMock);
        const { category, value } = dataOptions as CategoricalChartDataOptions;

        verifyColumn(category[0], panels[0].items[0]);
        verifyColumn(value[0], panels[1].items[0]);
      });

      it('should return correct data options for indicator', () => {
        const panels: Panel[] = [
          {
            name: 'value',
            items: [
              {
                jaql: jaqlMock.costAggregated,
              },
            ],
          },
          {
            name: 'secondary',
            items: [
              {
                jaql: jaqlMock.formula,
              },
            ],
          },
          {
            name: 'min',
            items: [
              {
                jaql: jaqlMock.constant1,
              },
            ],
          },
          {
            name: 'max',
            items: [
              {
                jaql: jaqlMock.constant2,
              },
            ],
          },
        ];

        const dataOptions = extractDataOptions('indicator', panels, styleMock);
        const { value, secondary, min, max } = dataOptions as IndicatorChartDataOptions;

        verifyColumn(value![0], panels[0].items[0]);
        verifyColumn(secondary![0], panels[1].items[0]);
        verifyColumn(min![0], panels[2].items[0]);
        verifyColumn(max![0], panels[3].items[0]);
      });

      it('should return correct data options for scatter chart', () => {
        const panels: Panel[] = [
          {
            name: 'x-axis',
            items: [
              {
                jaql: jaqlMock.date,
              },
            ],
          },
          {
            name: 'y-axis',
            items: [
              {
                jaql: jaqlMock.costAggregated,
              },
            ],
          },
          {
            name: 'point',
            items: [
              {
                jaql: jaqlMock.ageRange,
              },
            ],
          },
          {
            name: 'Break By / Color',
            items: [
              {
                jaql: jaqlMock.formula,
              },
            ],
          },
          {
            name: 'size',
            items: [
              {
                jaql: jaqlMock.costAggregated,
              },
            ],
          },
        ];

        const dataOptions = extractDataOptions('chart/scatter', panels, styleMock);
        const { x, y, breakByPoint, breakByColor, size } = dataOptions as ScatterChartDataOptions;

        verifyColumn(x!, panels[0].items[0]);
        verifyColumn(y!, panels[1].items[0]);
        verifyColumn(breakByPoint!, panels[2].items[0]);
        verifyColumn(breakByColor!, panels[3].items[0]);
        verifyColumn(size!, panels[4].items[0]);
      });

      it('should return correct data options for boxplot chart', () => {
        const panels: Panel[] = [
          {
            name: 'category',
            items: [
              {
                jaql: jaqlMock.date,
              },
            ],
          },
          {
            name: 'value',
            items: [
              {
                jaql: jaqlMock.cost,
              },
            ],
          },
        ];
        const style = {
          outliers: {
            enabled: true,
          },
        } as BoxplotWidgetStyle;

        const dataOptions = extractDataOptions('chart/boxplot', panels, style);
        const { category, value } = dataOptions as BoxplotChartDataOptions;

        verifyColumn(category[0]!, panels[0].items[0]);
        verifyColumn(value[0]!, panels[1].items[0]);
      });

      it('should return correct data options for chart with "measured value" formula', () => {
        const panels: Panel[] = [
          {
            name: 'categories',
            items: [
              {
                jaql: jaqlMock.category,
              },
            ],
          },
          {
            name: 'values',
            items: [
              {
                jaql: {
                  formula: '([Total Cost], [Age Range Filter])',
                  title: 'Measured Value',
                  context: {
                    '[Total Cost]': jaqlMock.costAggregated,
                    '[Age Range Filter]': {
                      ...jaqlMock.ageRange,
                      filter: {
                        members: ['0-18', '19-24'],
                      },
                    },
                  },
                },
              },
            ],
          },
        ];

        const dataOptions = extractDataOptions('chart/column', panels, styleMock);
        const { category, value } = dataOptions as CartesianChartDataOptions;

        verifyColumn(category[0], panels[0].items[0]);
        verifyColumn(value[0], panels[1].items[0]);
      });

      it('should apply numberFormat for count aggregation on text dimensions', () => {
        const panels: Panel[] = [
          {
            name: 'values',
            items: [
              {
                jaql: {
                  table: 'Commerce',
                  column: 'Brand',
                  dim: '[Commerce.Brand]',
                  datatype: 'text',
                  agg: 'count',
                  title: '# of unique Brand',
                },
                format: {
                  mask: {
                    abbreviations: {
                      t: false,
                      b: false,
                      m: false,
                      k: true,
                    },
                  },
                },
              },
            ],
          },
        ];

        const dataOptions = extractDataOptions('chart/column', panels, styleMock);
        const { value } = dataOptions as CartesianChartDataOptions;

        console.log('value', value);

        expect(value[0]).toHaveProperty('numberFormatConfig');
        expect((value[0] as StyledMeasureColumn).numberFormatConfig?.kilo).toBe(true);
      });

      it('should return correct data options for pivot table', () => {
        const panels: Panel[] = [
          {
            name: 'rows',
            items: [
              {
                jaql: {
                  ...jaqlMock.date,
                  sort: undefined,
                  sortDetails: {
                    dir: 'asc',
                  } as PivotJaql['sortDetails'],
                },
              },
            ],
          },
          {
            name: 'columns',
            items: [
              {
                jaql: {
                  ...jaqlMock.date,
                  sort: undefined,
                },
              },
            ],
          },
          {
            name: 'values',
            items: [
              {
                jaql: {
                  ...jaqlMock.cost,
                  sort: undefined,
                },
              },
            ],
          },
        ];
        const style = {
          rowsGrandTotal: true,
          columnsGrandTotal: true,
        };

        const dataOptions = extractDataOptions('pivot2', panels, style);
        const { rows, columns, values } = dataOptions as PivotTableDataOptions;

        verifyColumn(rows![0], panels[0].items[0]);
        verifyColumn(columns![0], panels[1].items[0]);
        verifyColumn(values![0], panels[2].items[0]);
      });
    });
  });

  describe('translate widget custom data options from customPanels', () => {
    describe('createDataOptionsFromPanels', () => {
      it('should extract data options for table chart correctly', () => {
        const panels = [
          {
            name: 'columns',
            items: [
              {
                jaql: {
                  table: 'Commerce',
                  column: 'Gender',
                  dim: '[Commerce.Gender]',
                  datatype: 'text',
                  title: 'Gender',
                },
              },
            ],
          },
        ] as Panel[];

        const dataOptions: any = createDataOptionsFromPanels(panels, ['red', 'blue', 'green']);

        expect(
          (dataOptions.columns[0] as StyledColumn).column instanceof DimensionalAttribute,
        ).toBeTruthy();
        verifyColumn(dataOptions.columns[0], panels[0].items[0]);
      });

      it('should return correct data options for cartesian chart', () => {
        const {
          // eslint-disable-next-line no-unused-vars
          sort,
          ...costAggregatedWithoutSort
        } = jaqlMock.costAggregated;
        const panels: Panel[] = [
          {
            name: 'categories',
            items: [
              {
                jaql: jaqlMock.category,
              },
            ],
          },
          {
            name: 'values',
            items: [
              {
                jaql: costAggregatedWithoutSort,
                categoriesSorting: JaqlSortDirection.DESC,
              },
            ],
          },
          {
            name: 'break by',
            items: [
              {
                jaql: jaqlMock.ageRange,
              },
            ],
          },
        ];

        const dataOptions: any = createDataOptionsFromPanels(panels, ['red', 'blue', 'green']);
        verifyColumn(dataOptions.categories[0], panels[0].items[0]);
        verifyColumn(dataOptions.values[0], panels[1].items[0]);
        verifyColumn(dataOptions.breakBy[0], panels[2].items[0]);
      });
    });
  });

  describe('createPanelItem', () => {
    const paletteColors = ['red', 'blue', 'green'];

    it('round-trips attribute column with sort, isColored, subtotals, width, continuous, color, panel', () => {
      const panelItem: PanelItem = {
        jaql: {
          ...jaqlMock.category,
          sort: 'desc',
        },
        format: {
          subtotal: true,
          width: 120,
          continuous: true,
          color: { type: 'color', color: '#ff0000' },
        },
        isColored: true,
        panel: 'columns',
      };

      const styledColumn = createDataColumn(panelItem, paletteColors) as StyledColumn;
      const roundTripped = createPanelItem(styledColumn);

      expect(roundTripped.jaql.sort).toBe('desc');
      expect(roundTripped.isColored).toBe(true);
      expect(roundTripped.format?.subtotal).toBe(true);
      expect(roundTripped.format?.width).toBe(120);
      expect(roundTripped.format?.continuous).toBe(true);
      expect(roundTripped.format?.color).toBeDefined();
      expect(roundTripped.panel).toBe('columns');
    });

    it('round-trips measure column with sort, number format, singleSeriesType, subtotalAgg, dataBars, dataBarsColor, width', () => {
      const panelItem: PanelItem = {
        jaql: {
          ...jaqlMock.costAggregated,
          datatype: 'numeric',
          sort: 'asc',
          subtotalAgg: 'sum',
        },
        panel: 'measures',
        y2: true,
        singleSeriesType: 'line',
        format: {
          mask: {
            abbreviations: { k: true, m: false, b: false, t: false },
            decimals: 'auto',
          },
          databars: true,
          colorSecond: { type: 'color', color: '#00ff00' },
          width: 100,
        },
      };

      const styledMeasure = createDataColumn(panelItem, paletteColors) as StyledMeasureColumn;
      const roundTripped = createPanelItem(styledMeasure);

      expect(roundTripped.jaql.sort).toBe('asc');
      expect(roundTripped.panel).toBe('measures');
      expect(roundTripped.y2).toBe(true);
      expect(roundTripped.singleSeriesType).toBe('line');
      expect((roundTripped.jaql as { subtotalAgg?: string }).subtotalAgg).toBe('sum');
      expect(roundTripped.format?.databars).toBe(true);
      expect(roundTripped.format?.colorSecond).toBeDefined();
      expect(roundTripped.format?.width).toBe(100);
      expect(roundTripped.format?.mask).toMatchObject({
        abbreviations: { k: true, m: false, b: false, t: false },
        decimals: 'auto',
      });
    });

    it('does not write sort when sortType is sortNone', () => {
      const panelItem: PanelItem = {
        jaql: { ...jaqlMock.category },
      };
      delete (panelItem.jaql as BaseJaql).sort;

      const styledColumn = createDataColumn(panelItem, paletteColors) as StyledColumn;
      const roundTripped = createPanelItem(styledColumn);

      expect(roundTripped.jaql.sort).toBeUndefined();
    });

    it('restores currency number format', () => {
      const panelItem: PanelItem = {
        jaql: { ...jaqlMock.costAggregated, datatype: 'numeric' },
        panel: 'measures',
        format: {
          mask: {
            currency: { symbol: '$', position: CurrencyPosition.PRE },
            decimals: 2,
          },
        },
      };

      const styledMeasure = createDataColumn(panelItem, paletteColors) as StyledMeasureColumn;
      const roundTripped = createPanelItem(styledMeasure);

      expect(roundTripped.format?.mask).toMatchObject({
        currency: { symbol: '$', position: CurrencyPosition.PRE },
        decimals: 2,
      });
    });

    it('restores percent number format', () => {
      const panelItem: PanelItem = {
        jaql: { ...jaqlMock.costAggregated, datatype: 'numeric' },
        panel: 'measures',
        format: {
          mask: {
            percent: true,
            type: 'percent',
            decimals: 1,
          },
        },
      };

      const styledMeasure = createDataColumn(panelItem, paletteColors) as StyledMeasureColumn;
      const roundTripped = createPanelItem(styledMeasure);

      expect(roundTripped.format?.mask).toMatchObject({
        percent: true,
        type: 'percent',
        decimals: 1,
      });
    });
  });
});
