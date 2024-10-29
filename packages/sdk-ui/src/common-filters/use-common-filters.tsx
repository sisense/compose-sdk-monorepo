import { useCallback, useMemo } from 'react';
import cloneDeep from 'lodash-es/cloneDeep';
import last from 'lodash-es/last';
import { type Filter } from '@sisense/sdk-data';
import {
  isTextWidgetProps,
  mergeFilters,
  registerDataPointClickHandler,
  registerDataPointContextMenuHandler,
  registerDataPointsSelectedHandler,
  registerRenderToolbarHandler,
  translateWidgetTypeInternal,
} from '@/dashboard-widget/utils';
import { CommonFiltersOptions } from './types.js';
import { prepareCommonFiltersToWidgetConnectProps } from './common-filters-connector.js';
import { WidgetProps } from '@/props.js';
import { BeforeMenuOpenHandler, OpenMenuFn } from '@/common/components/menu/types.js';
import { useTranslation } from 'react-i18next';
import { applyDrilldownDimension } from '@/widgets/common/drilldown-utils.js';
import { useSyncedState } from '@/common/hooks/use-synced-state';

/** @internal */
export const useCommonFilters = ({
  initialFilters,
  openMenu,
  onBeforeMenuOpen,
  onFiltersChange,
}: {
  initialFilters?: Filter[];
  openMenu?: OpenMenuFn;
  onBeforeMenuOpen?: BeforeMenuOpenHandler;
  onFiltersChange?: (filters: Filter[]) => void;
} = {}) => {
  const { t: translate } = useTranslation();
  const [filters, setFilters] = useSyncedState<Filter[]>(
    useMemo(() => initialFilters ?? [], [initialFilters]),
    {
      onLocalStateChange: onFiltersChange,
    },
  );

  const addFilter = useCallback(
    (newFilter: Filter) => {
      setFilters(mergeFilters(filters, [newFilter]));
    },
    [setFilters, filters],
  );

  const connectToWidgetProps = useCallback(
    (widget: WidgetProps, options: CommonFiltersOptions = {}): WidgetProps => {
      // Text widgets do not support filters, highlights, and data options
      if (isTextWidgetProps(widget)) {
        return widget;
      }

      const widgetType = translateWidgetTypeInternal(widget);

      const connectedWidget = cloneDeep(widget);
      const hasDrilldownSelection =
        'drilldownOptions' in widget && widget.drilldownOptions?.drilldownSelections?.length;
      const dataOptions = hasDrilldownSelection
        ? applyDrilldownDimension(
            widget.chartType,
            widget.dataOptions,
            last(widget.drilldownOptions!.drilldownSelections)!.nextDimension,
          )
        : widget.dataOptions;

      const props = prepareCommonFiltersToWidgetConnectProps(
        filters,
        setFilters,
        widgetType,
        dataOptions,
        options,
        translate,
        openMenu,
      );

      connectedWidget.highlights = mergeFilters(props.highlights, connectedWidget.highlights);

      connectedWidget.filters = mergeFilters(
        props.filters as Filter[],
        connectedWidget.filters as Filter[],
      );

      connectedWidget.onBeforeMenuOpen = onBeforeMenuOpen;

      if (props.onDataPointClick) {
        registerDataPointClickHandler(connectedWidget, props.onDataPointClick);
      }
      if (props.onDataPointsSelected) {
        registerDataPointsSelectedHandler(connectedWidget, props.onDataPointsSelected);
      }
      if (props.onDataPointContextMenu) {
        registerDataPointContextMenuHandler(connectedWidget, props.onDataPointContextMenu);
      }
      if (props.renderToolbar) {
        registerRenderToolbarHandler(connectedWidget, props.renderToolbar);
      }
      return connectedWidget;
    },
    [setFilters, filters, openMenu, onBeforeMenuOpen, translate],
  );

  return {
    filters,
    setFilters,
    addFilter,
    connectToWidgetProps,
  };
};
