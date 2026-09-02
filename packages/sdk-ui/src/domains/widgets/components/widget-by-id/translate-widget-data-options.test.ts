/* eslint-disable vitest/expect-expect */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BaseJaql,
  DimensionalAttribute,
  DimensionalBaseMeasure,
  DimensionalCalculatedAttribute,
  DimensionalCalculatedMeasure,
  FilterJaql,
  JaqlSortDirection,
  MetadataTypes,
  PivotJaql,
} from '@sisense/sdk-data';
import { measureFactory } from '@sisense/sdk-data';
import isObject from 'lodash-es/isObject';

import { Commerce } from '../../../../__test-helpers__/sample-ecommerce';
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
  KpiChartDataOptions,
  SankeyChartDataOptions,
  ScatterChartDataOptions,
} from '../../../../types.js';
import { toSankeyPanels } from '../../widget-model/widget-model-translator/to-widget-dto-panels.js';
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

      it('should take table column width from style.tableState.colResize over format.width', () => {
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
                // a stale width that should be overridden by tableState.colResize
                format: { width: 999 },
              },
            ],
          },
        ] as Panel[];
        const style = {
          tableState: {
            colResize: { columns: ['150.5px'] },
          },
        } as WidgetStyle;

        const tableDataOptions = extractDataOptions(
          'tablewidget',
          panels,
          style,
        ) as TableDataOptions;

        expect((tableDataOptions.columns[0] as StyledColumn).width).toBe(151);
      });

      it('should map colResize widths positionally across multiple columns', () => {
        const panels = [
          {
            name: 'columns',
            items: [
              {
                jaql: { dim: '[Commerce.Brand]', datatype: 'text', title: 'Brand' },
              },
              {
                jaql: { dim: '[Commerce.Category]', datatype: 'text', title: 'Category' },
              },
            ],
          },
        ] as Panel[];
        const style = {
          tableState: {
            colResize: { columns: ['100px', '200px'] },
          },
        } as WidgetStyle;

        const tableDataOptions = extractDataOptions(
          'tablewidget',
          panels,
          style,
        ) as TableDataOptions;

        expect((tableDataOptions.columns[0] as StyledColumn).width).toBe(100); // Brand
        expect((tableDataOptions.columns[1] as StyledColumn).width).toBe(200); // Category
      });

      it('should map colResize widths for enabled columns when a middle panel item is disabled', () => {
        const panels = [
          {
            name: 'columns',
            items: [
              {
                jaql: { dim: '[Commerce.Brand]', datatype: 'text', title: 'Brand' },
                format: { width: 50 },
              },
              {
                disabled: true,
                jaql: { dim: '[Commerce.Category]', datatype: 'text', title: 'Category' },
                format: { width: 999 },
              },
              {
                jaql: { dim: '[Commerce.Age Range]', datatype: 'text', title: 'Age Range' },
                format: { width: 80 },
              },
            ],
          },
        ] as Panel[];
        const style = {
          tableState: {
            colResize: { columns: ['100px', '200px'] },
          },
        } as WidgetStyle;

        const tableDataOptions = extractDataOptions(
          'tablewidget',
          panels,
          style,
        ) as TableDataOptions;

        expect(tableDataOptions.columns).toHaveLength(2);
        expect((tableDataOptions.columns[0] as StyledColumn).width).toBe(100);
        expect((tableDataOptions.columns[1] as StyledColumn).width).toBe(200);
      });

      it('should fall back to format.width for enabled columns when colResize includes a disabled column', () => {
        const panels = [
          {
            name: 'columns',
            items: [
              {
                jaql: { dim: '[Commerce.Brand]', datatype: 'text', title: 'Brand' },
                format: { width: 120 },
              },
              {
                disabled: true,
                jaql: { dim: '[Commerce.Category]', datatype: 'text', title: 'Category' },
              },
              {
                jaql: { dim: '[Commerce.Age Range]', datatype: 'text', title: 'Age Range' },
                format: { width: 80 },
              },
            ],
          },
        ] as Panel[];
        const style = {
          tableState: {
            // stale: still lists the disabled middle column
            colResize: { columns: ['100px', '150px', '200px'] },
          },
        } as WidgetStyle;

        const tableDataOptions = extractDataOptions(
          'tablewidget',
          panels,
          style,
        ) as TableDataOptions;

        expect(tableDataOptions.columns).toHaveLength(2);
        expect((tableDataOptions.columns[0] as StyledColumn).width).toBe(120);
        expect((tableDataOptions.columns[1] as StyledColumn).width).toBe(80);
      });

      it('should apply colResize width to a formula column', () => {
        const panels = [
          {
            name: 'columns',
            items: [
              { jaql: { dim: '[Category.Category]', datatype: 'text', title: 'Category' } },
              { jaql: { dim: '[Commerce.Age Range]', datatype: 'text', title: 'Age Range' } },
              {
                jaql: {
                  dim: '[Commerce.Quantity]',
                  datatype: 'numeric',
                  agg: 'sum',
                  title: 'Total Quantity',
                },
              },
              { jaql: jaqlMock.formula, format: { width: 999 } },
            ],
          },
        ] as Panel[];
        const style = {
          tableState: {
            colResize: { columns: ['158.047px', '116.75px', '136.25px', '397.25px'] },
          },
        } as WidgetStyle;

        const tableDataOptions = extractDataOptions(
          'tablewidget',
          panels,
          style,
        ) as TableDataOptions;

        expect((tableDataOptions.columns[0] as StyledColumn).width).toBe(158);
        expect((tableDataOptions.columns[1] as StyledColumn).width).toBe(117);
        expect((tableDataOptions.columns[2] as StyledMeasureColumn).width).toBe(136);
        expect((tableDataOptions.columns[3] as StyledMeasureColumn).width).toBe(397); // formula column
      });

      it('should fall back to format.width when style.tableState is absent', () => {
        const panels = [
          {
            name: 'columns',
            items: [
              {
                jaql: {
                  dim: '[Commerce.Gender]',
                  datatype: 'text',
                  title: 'Gender',
                },
                format: { width: 120 },
              },
            ],
          },
        ] as Panel[];

        const tableDataOptions = extractDataOptions(
          'tablewidget',
          panels,
          styleMock,
        ) as TableDataOptions;

        expect((tableDataOptions.columns[0] as StyledColumn).width).toBe(120);
      });

      it('should fall back to format.width when colResize column count does not equal the visible column count', () => {
        const panels = [
          {
            name: 'columns',
            items: [
              {
                jaql: { dim: '[Commerce.Gender]', datatype: 'text', title: 'Gender' },
                format: { width: 120 },
              },
              {
                jaql: { dim: '[Commerce.Age Range]', datatype: 'text', title: 'Age Range' },
              },
            ],
          },
        ] as Panel[];
        const style = {
          tableState: {
            colResize: { columns: ['150px'] }, // only 1 entry for 2 visible columns
          },
        } as WidgetStyle;

        const tableDataOptions = extractDataOptions(
          'tablewidget',
          panels,
          style,
        ) as TableDataOptions;

        expect((tableDataOptions.columns[0] as StyledColumn).width).toBe(120);
        expect((tableDataOptions.columns[1] as StyledColumn).width).toBeUndefined();
      });

      it('should fall back to format.width when colResize entry is malformed, negative, or zero', () => {
        const panels = [
          {
            name: 'columns',
            items: [
              {
                jaql: { dim: '[Commerce.Gender]', datatype: 'text', title: 'Gender' },
                format: { width: 120 },
              },
              {
                jaql: { dim: '[Commerce.Age Range]', datatype: 'text', title: 'Age Range' },
                format: { width: 80 },
              },
              {
                jaql: { dim: '[Commerce.Brand]', datatype: 'text', title: 'Brand' },
              },
            ],
          },
        ] as Panel[];
        const style = {
          tableState: {
            colResize: { columns: ['invalid', '-50px', '0px'] },
          },
        } as WidgetStyle;

        const tableDataOptions = extractDataOptions(
          'tablewidget',
          panels,
          style,
        ) as TableDataOptions;

        expect((tableDataOptions.columns[0] as StyledColumn).width).toBe(120);
        expect((tableDataOptions.columns[1] as StyledColumn).width).toBe(80);
        expect((tableDataOptions.columns[2] as StyledColumn).width).toBeUndefined();
      });

      it('should apply valid colResize widths and fall back for invalid entries in the same array', () => {
        const panels = [
          {
            name: 'columns',
            items: [
              {
                jaql: { dim: '[Commerce.Gender]', datatype: 'text', title: 'Gender' },
                format: { width: 120 },
              },
              {
                jaql: { dim: '[Commerce.Age Range]', datatype: 'text', title: 'Age Range' },
                format: { width: 80 },
              },
            ],
          },
        ] as Panel[];
        const style = {
          tableState: {
            colResize: { columns: ['150px', 'not-a-number'] },
          },
        } as WidgetStyle;

        const tableDataOptions = extractDataOptions(
          'tablewidget',
          panels,
          style,
        ) as TableDataOptions;

        expect((tableDataOptions.columns[0] as StyledColumn).width).toBe(150);
        expect((tableDataOptions.columns[1] as StyledColumn).width).toBe(80);
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

      describe('calculated dimension (calculated_dimension)', () => {
        it('routes a calculated_dimension item to a dimension column, never a measure', () => {
          const panelItem: PanelItem = {
            jaql: jaqlMock.calculatedDimension,
            panel: 'rows',
          };

          const column = createDataColumn(panelItem) as StyledColumn;

          expect(column.column instanceof DimensionalCalculatedAttribute).toBe(true);
          expect(MetadataTypes.isCalculatedAttribute(column.column)).toBe(true);
          expect(MetadataTypes.isMeasure(column.column)).toBe(false);

          const { jaql } = (column.column as DimensionalCalculatedAttribute).jaql();
          expect(jaql.type).toBe('calculated_dimension');
          expect(jaql.formula).toBe(jaqlMock.calculatedDimension.formula);
          expect(Object.keys(jaql.context)).toEqual(['[844DC-5D4]']);
        });

        it('places a Fusion calculated_dimension as a chart category, leaving measures intact', () => {
          const panels: Panel[] = [
            { name: 'categories', items: [{ jaql: jaqlMock.calculatedDimension }] },
            { name: 'values', items: [{ jaql: jaqlMock.costAggregated }] },
            { name: 'break by', items: [] },
          ];

          const { category, value } = extractDataOptions(
            'chart/column',
            panels,
            styleMock,
          ) as CartesianChartDataOptions;

          expect(category).toHaveLength(1);
          expect(
            (category[0] as StyledColumn).column instanceof DimensionalCalculatedAttribute,
          ).toBe(true);
          expect(MetadataTypes.isCalculatedAttribute((category[0] as StyledColumn).column)).toBe(
            true,
          );
          expect(value).toHaveLength(1);
          expect((value[0] as StyledMeasureColumn).column instanceof DimensionalBaseMeasure).toBe(
            true,
          );
        });
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

      it('should select the first item of the value and category panels for kpi', () => {
        const panels: Panel[] = [
          {
            name: 'value',
            items: [
              {
                jaql: jaqlMock.costAggregated,
              },
              {
                jaql: jaqlMock.formula,
              },
            ],
          },
          {
            name: 'category',
            items: [
              {
                jaql: jaqlMock.date,
              },
              {
                jaql: jaqlMock.category,
              },
            ],
          },
        ];

        const dataOptions = extractDataOptions('kpi', panels, styleMock);
        const { value, category } = dataOptions as KpiChartDataOptions;

        verifyColumn(value, panels[0].items[0]);
        verifyColumn(category!, panels[1].items[0]);
      });

      it('should omit category from kpi data options when the panel is empty', () => {
        const panels: Panel[] = [
          {
            name: 'value',
            items: [
              {
                jaql: jaqlMock.costAggregated,
              },
            ],
          },
          { name: 'category', items: [] },
        ];

        const dataOptions = extractDataOptions('kpi', panels, styleMock);
        const { value, category } = dataOptions as KpiChartDataOptions;

        verifyColumn(value, panels[0].items[0]);
        expect(category).toBeUndefined();
      });

      it('should return a target comparison for the kpi/goal subtype', () => {
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'target', items: [{ jaql: jaqlMock.formula }] },
        ];

        const dataOptions = extractDataOptions('kpi', panels, styleMock, undefined, 'kpi/goal');
        const { comparison } = dataOptions as KpiChartDataOptions;

        expect(comparison?.type).toBe('target');
        if (comparison?.type === 'target' && typeof comparison.target !== 'number') {
          verifyColumn(comparison.target, panels[1].items[0]);
        }
      });

      it('should return a delta comparison for the kpi/trend subtype', () => {
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'comparisonValue', items: [{ jaql: jaqlMock.formula }] },
        ];

        const dataOptions = extractDataOptions('kpi', panels, styleMock, undefined, 'kpi/trend');
        const { comparison } = dataOptions as KpiChartDataOptions;

        expect(comparison?.type).toBe('delta');
        if (comparison?.type === 'delta') {
          verifyColumn(comparison.value, panels[1].items[0]);
        }
      });

      it('should omit comparison for kpi/goal when the target panel is empty', () => {
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'target', items: [] },
        ];

        const dataOptions = extractDataOptions('kpi', panels, styleMock, undefined, 'kpi/goal');
        const { comparison } = dataOptions as KpiChartDataOptions;

        expect(comparison).toBeUndefined();
      });

      it('should omit comparison for kpi/trend when the comparisonValue panel is empty', () => {
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'comparisonValue', items: [] },
        ];

        const dataOptions = extractDataOptions('kpi', panels, styleMock, undefined, 'kpi/trend');
        const { comparison } = dataOptions as KpiChartDataOptions;

        expect(comparison).toBeUndefined();
      });

      it('should return a plain value comparison for the kpi/value subtype', () => {
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'comparisonValue', items: [{ jaql: jaqlMock.formula }] },
        ];

        const dataOptions = extractDataOptions('kpi', panels, styleMock, undefined, 'kpi/value');
        const { comparison } = dataOptions as KpiChartDataOptions;

        expect(comparison?.type).toBe('value');
        if (comparison?.type === 'value') {
          verifyColumn(comparison.value, panels[1].items[0]);
        }
      });

      it('should read the same panel for kpi/trend and kpi/value, differing only in type', () => {
        // Sharing `comparisonValue` is what lets a user switch between the two subtypes without
        // re-picking the measure, so the two readings must stay in step.
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'comparisonValue', items: [{ jaql: jaqlMock.formula }] },
        ];

        const asTrend = extractDataOptions('kpi', panels, styleMock, undefined, 'kpi/trend');
        const asValue = extractDataOptions('kpi', panels, styleMock, undefined, 'kpi/value');
        const trendComparison = (asTrend as KpiChartDataOptions).comparison;
        const valueComparison = (asValue as KpiChartDataOptions).comparison;

        expect(trendComparison?.type).toBe('delta');
        expect(valueComparison?.type).toBe('value');
        // Compared whole rather than narrowing to `.value` first: the claim is that the two
        // readings differ *only* in the discriminant, which this states directly — and it
        // needs no type guard, so the assertion can never be skipped.
        expect(trendComparison).toEqual({ ...valueComparison, type: 'delta' });
      });

      it('should omit comparison for kpi/value when the comparisonValue panel is empty', () => {
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'comparisonValue', items: [] },
        ];

        const dataOptions = extractDataOptions('kpi', panels, styleMock, undefined, 'kpi/value');

        expect((dataOptions as KpiChartDataOptions).comparison).toBeUndefined();
      });

      it('should return a previous-period comparison for the kpi/previous-period subtype', () => {
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'category', items: [{ jaql: jaqlMock.date }] },
        ];

        const dataOptions = extractDataOptions(
          'kpi',
          panels,
          styleMock,
          undefined,
          'kpi/previous-period',
        );
        const { comparison } = dataOptions as KpiChartDataOptions;

        expect(comparison).toEqual({ type: 'previous-period' });
      });

      it('should keep the previous-period comparison when the category panel is empty', () => {
        // The baseline comes from the category, but an empty panel is not an error here: the
        // data layer resolves the comparison to nothing and the card falls back to a plain
        // value, so the subtype stays intact rather than being silently rewritten.
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'category', items: [] },
        ];

        const dataOptions = extractDataOptions(
          'kpi',
          panels,
          styleMock,
          undefined,
          'kpi/previous-period',
        );
        const { category, comparison } = dataOptions as KpiChartDataOptions;

        expect(category).toBeUndefined();
        expect(comparison).toEqual({ type: 'previous-period' });
      });

      it('should ignore comparison panels for the kpi/previous-period subtype', () => {
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'category', items: [{ jaql: jaqlMock.date }] },
          { name: 'target', items: [{ jaql: jaqlMock.formula }] },
          { name: 'comparisonValue', items: [{ jaql: jaqlMock.formula }] },
        ];

        const dataOptions = extractDataOptions(
          'kpi',
          panels,
          styleMock,
          undefined,
          'kpi/previous-period',
        );
        const { comparison } = dataOptions as KpiChartDataOptions;

        expect(comparison).toEqual({ type: 'previous-period' });
      });

      it('should read valueMode from the widget style', () => {
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'category', items: [{ jaql: jaqlMock.date }] },
        ];
        const style = { valueMode: 'total' } as WidgetStyle;

        const dataOptions = extractDataOptions('kpi', panels, style, undefined, 'kpi/standard');

        expect((dataOptions as KpiChartDataOptions).valueMode).toBe('total');
      });

      it('should omit valueMode when the widget style does not set it', () => {
        // Left unset rather than defaulted to 'last' here, so the chart's own default applies.
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'category', items: [{ jaql: jaqlMock.date }] },
        ];

        const dataOptions = extractDataOptions('kpi', panels, styleMock, undefined, 'kpi/standard');

        expect('valueMode' in (dataOptions as KpiChartDataOptions)).toBe(false);
      });

      it('should omit comparison for the kpi/standard subtype regardless of panels', () => {
        const panels: Panel[] = [
          { name: 'value', items: [{ jaql: jaqlMock.costAggregated }] },
          { name: 'target', items: [{ jaql: jaqlMock.formula }] },
        ];

        const dataOptions = extractDataOptions('kpi', panels, styleMock, undefined, 'kpi/standard');
        const { comparison } = dataOptions as KpiChartDataOptions;

        expect(comparison).toBeUndefined();
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

      it('should return sankey seriesToColorMap for multi-column hand-picked colors', () => {
        const sumRevenue = measureFactory.sum(Commerce.Revenue, 'Total Revenue');
        const originalDataOptions: SankeyChartDataOptions = {
          category: [Commerce.AgeRange, Commerce.Condition],
          value: sumRevenue,
          seriesToColorMap: {
            AgeRange: { '65+': '#ff0000', '0-18': '#00ff00' },
            Condition: { New: '#0000ff' },
          },
        };
        const panels = toSankeyPanels(originalDataOptions);

        const dataOptions = extractDataOptions(
          'sankey',
          panels,
          styleMock,
        ) as SankeyChartDataOptions;

        expect(dataOptions.seriesToColorMap).toEqual(originalDataOptions.seriesToColorMap);
      });

      it('should return sankey seriesToColorMap for flat hand-picked colors', () => {
        const sumRevenue = measureFactory.sum(Commerce.Revenue, 'Total Revenue');
        const originalDataOptions: SankeyChartDataOptions = {
          category: [Commerce.AgeRange, Commerce.Condition],
          value: sumRevenue,
          seriesToColorMap: {
            '65+': '#ff0000',
            New: '#0000ff',
          },
        };
        const panels = toSankeyPanels(originalDataOptions);

        const dataOptions = extractDataOptions(
          'sankey',
          panels,
          styleMock,
        ) as SankeyChartDataOptions;

        expect(dataOptions.seriesToColorMap).toEqual(originalDataOptions.seriesToColorMap);
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
