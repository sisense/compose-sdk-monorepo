import { PointClickEventObject } from '@sisense/sisense-charts';
import { translateColumnToAttribure } from '@/chart-data-options/utils';
import {
  isAreamap,
  isBoxplot,
  isCartesian,
  isCategorical,
  isScatter,
  isScattermap,
} from '@/chart-options-processor/translations/types';
import { Column, Attribute, Filter } from '@sisense/sdk-data';
import uniq from 'lodash/uniq';
import isUndefined from 'lodash/isUndefined';
import {
  AreamapChartDataOptions,
  AreamapDataPoint,
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  ChartDataPoint,
  DataPoint,
  isMeasureColumn,
  PivotTableDataOptions,
  ScatterChartDataOptions,
  ScatterDataPoint,
  ScattermapChartDataOptions,
  ScattermapDataPoint,
  StyledColumn,
} from '../index.js';
import { ScatterCustomPointOptions } from '@/chart-options-processor/translations/scatter-tooltip.js';
import {
  clearCommonFilter,
  createCommonFilter,
  getFilterByAttribute,
  isEqualMembersFilters,
} from './utils.js';
import { WidgetTypeInternal } from '@/models/widget/types.js';

type WidgetSelection = {
  attribute: Attribute;
  values: (string | number)[];
};

type AnyDataPoint = ChartDataPoint | ScattermapDataPoint;

function prepareSelectionValues<P extends AnyDataPoint>(
  points: P[],
  convertPointToValueFn: (point: P, index: number) => string | number,
) {
  const validPoints = points.filter((point) => {
    const isValidDataPoint = 'value' in point && !isUndefined(point.value);
    const isValidScatterDataPoint =
      ('x' in point && !isUndefined(point.x)) || ('y' in point && !isUndefined(point.y));
    const isValiedBoxplotDataPoint = 'boxMedian' in point && !isUndefined(point.boxMedian);
    const isValidGeoDataPoint = 'geoName' in point && !isUndefined(point.geoName);

    return (
      isValidDataPoint || isValidScatterDataPoint || isValiedBoxplotDataPoint || isValidGeoDataPoint
    );
  });

  const values = validPoints.map(convertPointToValueFn);

  return uniq(values);
}

function getCartesianChartSelections(
  dataOptions: CartesianChartDataOptions,
  points: DataPoint[],
): WidgetSelection[] {
  const attributes = dataOptions.category.map(translateColumnToAttribure);
  return attributes.map((attribute, index) => {
    return {
      attribute,
      values: prepareSelectionValues(points, (point) =>
        index === 0 ? point.categoryValue! : point.categoryDisplayValue!,
      ),
    };
  });
}

function getBoxplotChartSelections(
  dataOptions: CartesianChartDataOptions,
  points: Array<DataPoint | ScatterDataPoint>,
  nativeEvent: MouseEvent | PointerEvent,
): WidgetSelection[] {
  const attribute = dataOptions.category.map(translateColumnToAttribure)[0];
  // todo: replace usage of 'nativeEvent' after 'point' will be improved
  const event = nativeEvent as PointClickEventObject;

  if (attribute) {
    return [
      {
        attribute,
        values: prepareSelectionValues(points, (point) => {
          const isScatterDataPoint = 'x' in point;
          return isScatterDataPoint
            ? event.point.series.xAxis.categories[point.x!]
            : (point as DataPoint).categoryValue;
        }),
      },
    ];
  }

  return [];
}

function getTreemapChartSelections(
  dataOptions: CategoricalChartDataOptions,
  points: DataPoint[],
  nativeEvent: MouseEvent | PointerEvent,
): WidgetSelection[] {
  // todo: replace usage of 'nativeEvent' after 'points' will be improved
  const event = nativeEvent as PointClickEventObject;
  const { level: pointLevel } = event.point.options.custom as { level: number };
  const pointLevelIndex = pointLevel - 1;
  const attributes = dataOptions.category.map(translateColumnToAttribure);
  return attributes.map((attribute, index) => ({
    attribute: attribute,
    // select only current level and deselect all other levels
    values: pointLevelIndex === index ? [event.point.name] : [],
  }));
}

function getScatterChartSelections(
  dataOptions: ScatterChartDataOptions,
  points: ScatterDataPoint[],
  nativeEvent: MouseEvent | PointerEvent,
): WidgetSelection[] {
  const selections: WidgetSelection[] = [];
  // todo: replace usage of 'nativeEvent' after extending 'points'
  const event = nativeEvent as PointClickEventObject;
  const isMultiSelectionEvent = event.type === 'mouseup';

  // todo: add multi-selection support after extending 'points'
  if (isMultiSelectionEvent) {
    console.warn('No cross-filtering support for multi-selection in scatter chart');
    return selections;
  }

  if (dataOptions.x && !isMeasureColumn(dataOptions.x)) {
    selections.push({
      attribute: translateColumnToAttribure(dataOptions.x),
      values: [(event.point.options.custom as ScatterCustomPointOptions).maskedX],
    });
  }

  if (dataOptions.y && !isMeasureColumn(dataOptions.y)) {
    selections.push({
      attribute: translateColumnToAttribure(dataOptions.y),
      values: [(event.point.options.custom as ScatterCustomPointOptions).maskedY],
    });
  }

  if (dataOptions.breakByColor && !isMeasureColumn(dataOptions.breakByColor)) {
    selections.push({
      attribute: translateColumnToAttribure(dataOptions.breakByColor),
      values: [(event.point.options.custom as ScatterCustomPointOptions).maskedBreakByColor!],
    });
  }

  if (dataOptions.breakByPoint) {
    selections.push({
      attribute: translateColumnToAttribure(dataOptions.breakByPoint),
      values: [(event.point.options.custom as ScatterCustomPointOptions).maskedBreakByPoint!],
    });
  }

  return selections;
}

function getScattermapChartSelections(
  dataOptions: ScattermapChartDataOptions,
  points: ScattermapDataPoint[],
): WidgetSelection[] {
  const attributes = dataOptions.geo.map(translateColumnToAttribure);
  return attributes.map((attribute, index) => {
    return {
      attribute,
      values: prepareSelectionValues(points, (point) => point.categories[index]),
    };
  });
}

function getAreamapChartSelections(
  dataOptions: AreamapChartDataOptions,
  points: AreamapDataPoint[],
): WidgetSelection[] {
  const attributes = dataOptions.geo.map(translateColumnToAttribure);

  return attributes.map((attribute) => {
    return {
      attribute,
      values: prepareSelectionValues(points, (point) => point.geoName),
    };
  });
}

export function getWidgetSelections(
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
  points: Array<DataPoint | ScatterDataPoint | ScattermapDataPoint | AreamapDataPoint>,
  nativeEvent: MouseEvent | PointerEvent,
) {
  if (widgetType === 'plugin') {
    // no plugins support
    return [];
  } else if (widgetType === 'pivot') {
    // todo: add pivot support after extending pivot with click/select handlers
    return [];
  } else if (widgetType === 'treemap' || widgetType === 'sunburst') {
    return getTreemapChartSelections(
      dataOptions as CategoricalChartDataOptions,
      points as DataPoint[],
      nativeEvent,
    );
  } else if (isCartesian(widgetType) || widgetType === 'pie' || widgetType === 'funnel') {
    return getCartesianChartSelections(
      dataOptions as CartesianChartDataOptions,
      points as DataPoint[],
    );
  } else if (isBoxplot(widgetType)) {
    return getBoxplotChartSelections(
      dataOptions as CartesianChartDataOptions,
      points as Array<DataPoint | ScatterDataPoint>,
      nativeEvent,
    );
  } else if (isScatter(widgetType)) {
    return getScatterChartSelections(
      dataOptions as ScatterChartDataOptions,
      points as ScatterDataPoint[],
      nativeEvent,
    );
  } else if (isScattermap(widgetType)) {
    return getScattermapChartSelections(
      dataOptions as ScattermapChartDataOptions,
      points as ScattermapDataPoint[],
    );
  } else if (isAreamap(widgetType)) {
    return getAreamapChartSelections(
      dataOptions as AreamapChartDataOptions,
      points as AreamapDataPoint[],
    );
  }

  return [];
}

export function getSelectableWidgetAttributes(
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
) {
  let targetDataOptions: (Column | StyledColumn)[] = [];

  if (widgetType === 'plugin') {
    targetDataOptions = [];
  } else if (widgetType === 'pivot') {
    targetDataOptions = [
      ...((dataOptions as PivotTableDataOptions).rows || []),
      ...((dataOptions as PivotTableDataOptions).columns || []),
    ];
  } else if (isCartesian(widgetType) || isCategorical(widgetType) || isBoxplot(widgetType)) {
    targetDataOptions = [...(dataOptions as CartesianChartDataOptions).category];
  } else if (isScatter(widgetType)) {
    targetDataOptions = [
      (dataOptions as ScatterChartDataOptions).x,
      (dataOptions as ScatterChartDataOptions).y,
      (dataOptions as ScatterChartDataOptions).breakByPoint,
      (dataOptions as ScatterChartDataOptions).breakByColor,
    ].filter((a): a is Column | StyledColumn => !!(a && !isMeasureColumn(a)));
  } else if (isScattermap(widgetType) || isAreamap(widgetType)) {
    targetDataOptions = [...(dataOptions as ScattermapChartDataOptions).geo];
  }

  return targetDataOptions.map(translateColumnToAttribure);
}

export function createCommonFiltersOverSelections(
  selections: WidgetSelection[],
  filters: Filter[],
) {
  let selectedFilters = selections.map(({ attribute, values }) =>
    createCommonFilter(attribute, values, filters),
  );

  const enabledFilters = filters.filter((f) => !f.disabled);
  const isAlreadySelectedFilters = selectedFilters.every((filter) => {
    const existingFilter = getFilterByAttribute(enabledFilters, filter.attribute);
    return existingFilter && isEqualMembersFilters(filter, existingFilter);
  });

  if (isAlreadySelectedFilters) {
    selectedFilters = selectedFilters.map(clearCommonFilter);
  }

  return selectedFilters;
}
