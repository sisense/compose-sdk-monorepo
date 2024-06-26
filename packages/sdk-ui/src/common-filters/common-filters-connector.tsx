import merge from 'ts-deepmerge';
import { type Filter } from '@sisense/sdk-data';
import { mergeFilters } from '@/dashboard-widget/utils';
import { WidgetHeaderClearSelectionButton } from './widget-header-clear-selection-button';
import {
  ChartDataOptions,
  ChartWidgetProps,
  DataPoint,
  PivotTableDataOptions,
  RenderToolbarHandler,
} from '../index.js';
import {
  clearCommonFilter,
  getAllowedFilters,
  isIncludeAllFilter,
  isSameAttribute,
} from './utils.js';
import { CommonFiltersApplyMode, CommonFiltersOptions } from './types.js';
import {
  createCommonFiltersOverSelections,
  getSelectableWidgetAttributes,
  getWidgetSelections,
} from './selection-utils';
import { WidgetTypeInternal } from '@/models/widget/types';

type CommonFiltersToWidgetConnectProps = Pick<
  ChartWidgetProps,
  'filters' | 'highlights' | 'onDataPointClick' | 'onDataPointsSelected'
> & {
  renderToolbar: RenderToolbarHandler;
};

const defaultCommonFiltersOptions: CommonFiltersOptions = {
  applyMode: CommonFiltersApplyMode.HIGHLIGHT,
  shouldAffectFilters: true,
  ignoreFilters: {
    all: false,
    ids: [],
  },
};

function normalizeCommonFiltersOptions(
  widgetType: WidgetTypeInternal,
  options: CommonFiltersOptions,
) {
  if (widgetType === 'table') {
    return {
      applyMode: CommonFiltersApplyMode.FILTER,
      shouldAffectFilters: false,
      ignoreFilters: merge(defaultCommonFiltersOptions.ignoreFilters!, options.ignoreFilters || {}),
    };
  }
  return merge(defaultCommonFiltersOptions, options);
}

export function prepareCommonFiltersToWidgetConnectProps(
  filters: Filter[],
  setFilters: (filters: Filter[]) => void,
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
  options: CommonFiltersOptions,
) {
  const props = {} as CommonFiltersToWidgetConnectProps;
  const normalizedOptions = normalizeCommonFiltersOptions(widgetType, options);
  const enabledFilters = filters.filter((f) => !f.disabled);
  const allowedFilters = getAllowedFilters(enabledFilters, normalizedOptions.ignoreFilters);
  const selectableAttributes = getSelectableWidgetAttributes(widgetType, dataOptions);

  if (normalizedOptions?.applyMode === 'highlight') {
    props.highlights = allowedFilters;
  } else {
    props.filters = allowedFilters;
  }

  if (normalizedOptions.shouldAffectFilters && selectableAttributes.length) {
    // registers "onDataPointClick" handler
    props.onDataPointClick = (point: DataPoint, nativeEvent: PointerEvent) => {
      const selections = getWidgetSelections(widgetType, dataOptions, [point], nativeEvent);
      const selectedFilters = createCommonFiltersOverSelections(selections, filters);
      setFilters(mergeFilters(filters, selectedFilters));
    };
    // registers "onDataPointsSelected" handler
    props.onDataPointsSelected = (points: DataPoint[], nativeEvent: MouseEvent | PointerEvent) => {
      const selections = getWidgetSelections(widgetType, dataOptions, points, nativeEvent);
      const selectedFilters = createCommonFiltersOverSelections(selections, filters);
      setFilters(mergeFilters(filters, selectedFilters));
    };

    // registers "renderToolbar" handler
    const selectedFilters = enabledFilters.filter((f) =>
      selectableAttributes?.some((a) => isSameAttribute(f.attribute, a) && !isIncludeAllFilter(f)),
    );
    const hasSelection = !!selectedFilters.length;
    const clearSelection = () => {
      const deselectedFilters = selectedFilters.map(clearCommonFilter);
      setFilters(mergeFilters(filters, deselectedFilters));
    };

    if (hasSelection) {
      props.renderToolbar = (onRefresh, defaultToolbar) => {
        const key = selectableAttributes.map(({ expression }) => expression).join(';');
        return (
          <div key={key} style={{ display: 'flex' }}>
            <WidgetHeaderClearSelectionButton onClick={clearSelection} />
            {defaultToolbar}
          </div>
        );
      };
    }
  }

  return props;
}
