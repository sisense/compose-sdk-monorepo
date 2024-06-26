import { useCallback, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { type Filter } from '@sisense/sdk-data';
import { mergeFilters } from '@/dashboard-widget/utils';
import { ChartDataOptions, WidgetModel } from '../index.js';
import { CommonFiltersOptions } from './types.js';
import { prepareCommonFiltersToWidgetConnectProps } from './common-filters-connector.js';
import { translateWidgetType } from '@/models/index.js';

/** @internal */
export const useCommonFilters = ({
  initialFilters = [],
}: {
  initialFilters?: Filter[];
} = {}) => {
  const [filters, setFilters] = useState<Filter[]>(initialFilters);

  const addFilter = useCallback(
    (newFilter: Filter) => {
      setFilters(mergeFilters(filters, [newFilter]));
    },
    [setFilters, filters],
  );

  const connectToWidgetModel = useCallback(
    (widget: WidgetModel, options: CommonFiltersOptions = {}): WidgetModel => {
      const connectedWidget = cloneDeep(widget);
      const props = prepareCommonFiltersToWidgetConnectProps(
        filters,
        setFilters,
        translateWidgetType(widget.widgetType),
        widget.dataOptions as ChartDataOptions,
        options,
      );

      connectedWidget.highlights = mergeFilters(props.highlights, connectedWidget.highlights);
      connectedWidget.filters = mergeFilters(props.filters as Filter[], connectedWidget.filters);
      if (props.onDataPointClick) {
        connectedWidget.registerComponentDataPointClickHandler?.(props.onDataPointClick);
      }
      if (props.onDataPointsSelected) {
        connectedWidget.registerComponentDataPointsSelectedHandler?.(props.onDataPointsSelected);
      }
      if (props.renderToolbar) {
        connectedWidget.registerComponentRenderToolbarHandler?.(props.renderToolbar);
      }
      return connectedWidget;
    },
    [setFilters, filters],
  );

  return {
    filters,
    setFilters,
    addFilter,
    connectToWidgetModel,
  };
};
