/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import {
  DimensionalAttribute,
  DimensionalBaseMeasure,
  DimensionalCalculatedMeasure,
  SortDirection,
  FilterJaql,
  BaseJaql,
} from '@sisense/sdk-data';
import { ChartWidgetExtractedProps, extractWidgetProps } from './translate-widget';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  IndicatorDataOptions,
  ScatterChartDataOptions,
} from '../types';
import { DatetimeMask, PanelItem, WidgetDto } from './types';
import { jaqlMock } from './__mocks__/jaql-mock';
import { AnyColumn } from '../chart-data-options/types';

const widgetMock = {
  datasource: {
    title: 'Some Datasource',
  } as WidgetDto['datasource'],
  style: {},
} as WidgetDto;

function convertToDimensionalModel(
  column: AnyColumn,
): DimensionalAttribute | DimensionalBaseMeasure | DimensionalCalculatedMeasure {
  return ('column' in column ? column.column : column) as
    | DimensionalAttribute
    | DimensionalBaseMeasure
    | DimensionalCalculatedMeasure;
}

function getSortTypeFromPanelItem(panelItem: PanelItem) {
  const panelSort = panelItem.jaql.sort ?? panelItem.categoriesSorting;

  if (panelSort === SortDirection.ASC) {
    return 'sortAsc';
  } else if (panelSort === SortDirection.DESC) {
    return 'sortDesc';
  } else {
    return 'sortNone';
  }
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

function verifyColumn(column: AnyColumn, panelItem: PanelItem) {
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

describe('translate widget', () => {
  describe('extractWidgetProps', () => {
    it('should returns correct data options for cartesian chart', () => {
      // eslint-disable-next-line no-unused-vars
      const { sort, ...costAggregatedWithoutSort } = jaqlMock.costAggregated;
      const widget: WidgetDto = {
        ...widgetMock,
        type: 'chart/column',
        metadata: {
          panels: [
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
                  categoriesSorting: SortDirection.DESC,
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
          ],
        },
      };
      const { dataOptions } = extractWidgetProps(widget).props;
      const { category, value, breakBy } = dataOptions as CartesianChartDataOptions;

      verifyColumn(category[0], widget.metadata.panels[0].items[0]);
      verifyColumn(value[0], widget.metadata.panels[1].items[0]);
      verifyColumn(breakBy[0], widget.metadata.panels[2].items[0]);
    });

    it('should returns correct data options for cartesian chart with multiple values', () => {
      const widget: WidgetDto = {
        ...widgetMock,
        type: 'chart/area',
        metadata: {
          panels: [
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
          ],
        },
      };
      const { dataOptions } = extractWidgetProps(widget).props;
      const { category, value } = dataOptions as CartesianChartDataOptions;

      verifyColumn(category[0], widget.metadata.panels[0].items[0]);
      verifyColumn(value[0], widget.metadata.panels[1].items[0]);
      verifyColumn(value[1], widget.metadata.panels[1].items[1]);
    });

    it('should returns correct data options for cartesian chart with drilldown', () => {
      const widget: WidgetDto = {
        ...widgetMock,
        type: 'chart/column',
        metadata: {
          panels: [
            {
              name: 'categories',
              items: [
                {
                  jaql: jaqlMock.ageRange,
                  parent: {
                    jaql: jaqlMock.category,
                    parent: {
                      format: { mask: { years: 'yyyy' } as DatetimeMask },
                      jaql: jaqlMock.date,
                    },
                    through: {
                      jaql: { ...jaqlMock.date, filter: { members: ['2010-01-01T00:00:00'] } },
                    },
                  },
                  through: {
                    jaql: {
                      ...jaqlMock.category,
                      filter: { members: ['Cell Phones', 'Digital Cameras'] },
                    },
                  },
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
          ],
        },
      };
      const { dataOptions, drilldownOptions } = (
        extractWidgetProps(widget) as ChartWidgetExtractedProps
      ).props;
      const { category } = dataOptions as CartesianChartDataOptions;

      verifyColumn(category[0], widget.metadata.panels[0].items[0].parent!.parent!);
      verifyColumn(drilldownOptions?.drilldownDimensions![1]!, widget.metadata.panels[0].items[0]);
      verifyColumn(
        drilldownOptions?.drilldownDimensions![0]!,
        widget.metadata.panels[0].items[0].parent!,
      );

      verifyColumn(
        drilldownOptions?.drilldownSelections![1].nextDimension!,
        widget.metadata.panels[0].items[0],
      );
      verifyColumn(
        drilldownOptions?.drilldownSelections![0].nextDimension!,
        widget.metadata.panels[0].items[0].parent!,
      );
      expect(drilldownOptions?.drilldownSelections![1].points).toEqual([
        { categoryValue: 'Cell Phones' },
        { categoryValue: 'Digital Cameras' },
      ]);

      expect(drilldownOptions?.drilldownSelections![0].points).toEqual([
        { categoryValue: '2010-01-01T00:00:00', categoryDisplayValue: '2010' },
      ]);
    });

    it('should returns correct data options for categorical chart', () => {
      const widget: WidgetDto = {
        ...widgetMock,
        type: 'chart/pie',
        metadata: {
          panels: [
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
          ],
        },
      };
      const { dataOptions } = extractWidgetProps(widget).props;
      const { category, value } = dataOptions as CategoricalChartDataOptions;

      verifyColumn(category[0], widget.metadata.panels[0].items[0]);
      verifyColumn(value[0], widget.metadata.panels[1].items[0]);
    });

    it('should returns correct data options for indicator', () => {
      const widget: WidgetDto = {
        ...widgetMock,
        type: 'indicator',
        metadata: {
          panels: [
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
          ],
        },
      };
      const { dataOptions } = extractWidgetProps(widget).props;
      const { value, secondary, min, max } = dataOptions as IndicatorDataOptions;

      verifyColumn(value![0], widget.metadata.panels[0].items[0]);
      verifyColumn(secondary![0], widget.metadata.panels[1].items[0]);
      verifyColumn(min![0], widget.metadata.panels[2].items[0]);
      verifyColumn(max![0], widget.metadata.panels[3].items[0]);
    });

    it('should returns correct data options for scatter chart', () => {
      const widget: WidgetDto = {
        ...widgetMock,
        type: 'chart/scatter',
        metadata: {
          panels: [
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
          ],
        },
      };
      const { dataOptions } = extractWidgetProps(widget).props;

      const { x, y, breakByPoint, breakByColor, size } = dataOptions as ScatterChartDataOptions;

      verifyColumn(x!, widget.metadata.panels[0].items[0]);
      verifyColumn(y!, widget.metadata.panels[1].items[0]);
      verifyColumn(breakByPoint!, widget.metadata.panels[2].items[0]);
      verifyColumn(breakByColor!, widget.metadata.panels[3].items[0]);
      verifyColumn(size!, widget.metadata.panels[4].items[0]);
    });

    it('should throw an error for unsupported widget type', () => {
      const widget = {
        type: 'unsupported-type',
      } as WidgetDto;

      expect(() => {
        extractWidgetProps(widget);
      }).toThrow("Can't extract props for unsupported widget type - unsupported-type");
    });

    it('should returns correct data options for chart with "measured value" formula', () => {
      const widget: WidgetDto = {
        ...widgetMock,
        type: 'chart/column',
        metadata: {
          panels: [
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
          ],
        },
      };
      const { dataOptions } = extractWidgetProps(widget).props;
      const { category, value } = dataOptions as CartesianChartDataOptions;

      verifyColumn(category[0], widget.metadata.panels[0].items[0]);
      verifyColumn(value[0], widget.metadata.panels[1].items[0]);
    });
  });
});
