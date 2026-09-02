import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { type Filter, FilterRelations } from '@sisense/sdk-data';
import cloneDeep from 'lodash-es/cloneDeep';

import type { FilterWidgetChangeEvent } from '@/domains/widgets/change-events.js';
import {
  getInternalWidgetType,
  isFilterWidgetProps,
  isTextWidgetProps,
  mergeFilters,
  registerDataPointClickHandler,
  registerDataPointContextMenuHandler,
  registerDataPointsSelectedHandler,
} from '@/domains/widgets/components/widget-by-id/utils.js';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { withHeaderItems } from '@/domains/widgets/helpers/header-items-utils.js';
import { BeforeMenuOpenHandler, OpenMenuFn } from '@/infra/contexts/menu-provider/types.js';
import { getFiltersArray } from '@/shared/utils/filter-relations.js';
import { isSameAttribute } from '@/shared/utils/filters.js';

import { createClearSelectionButtonItem } from './clear-selection-button.js';
import { prepareCommonFiltersConnectionProps } from './common-filters-connector.js';
import { connectFilterWidgetToProps } from './filter-widget-connector.js';
import { CommonFiltersOptions } from './types.js';
import { useConvertFilterRelations } from './use-convert-filter-relations.js';
import { getWidgetDataOptionsWithDrilldown } from './utils.js';

type ConnectToWidgetPropsOptions = CommonFiltersOptions & {
  filterWidgetOptions?: { filterId: string };
  setFilterWidgetOptions?: (opts: { filterId: string }) => void;
};

/** @internal */
export const useCommonFilters = ({
  initialFilters: initialCommonFiltersOrFilterRelations = [],
  openMenu,
  onBeforeMenuOpen,
  onFiltersChange,
}: {
  initialFilters?: Filter[] | FilterRelations;
  openMenu?: OpenMenuFn;
  onBeforeMenuOpen?: BeforeMenuOpenHandler;
  onFiltersChange?: (filters: Filter[] | FilterRelations) => void;
} = {}) => {
  const { t: translate } = useTranslation();

  const {
    filtersOrFilterRelations: commonFiltersOrFilterRelations,
    regularFilters: regularCommonFilters,
    addFilter: addCommonFilter,
    setFiltersOrFilterRelations: setCommonFiltersOrFilterRelations,
    setFilters: setCommonFilters,
    applyRelationsToOtherFilters,
  } = useConvertFilterRelations(initialCommonFiltersOrFilterRelations, onFiltersChange);

  const connectToWidgetProps = useCallback(
    (widgetProps: WidgetProps, options: ConnectToWidgetPropsOptions = {}): WidgetProps => {
      // Text widgets do not support filters, highlights, and data options
      if (isTextWidgetProps(widgetProps)) {
        return widgetProps;
      }

      // FilterWidget: IS a filter source — inject its current filter state and
      // wrap the unified `onChange` so `filter/changed` events write back to
      // common filters. Every event is ALSO forwarded to the widget's original
      // onChange (the change-detection / rename / user chain), keeping the
      // single-channel widget contract intact. Does NOT receive highlights.
      // Dashboard filters join `parentFilters` only when the widget opted in
      // (ignoreFilters.all === false); the widget's own attribute is excluded —
      // self-filtering would collapse the dropdown to the current selection.
      if (isFilterWidgetProps(widgetProps)) {
        const { filter, onChange: updateCommonFilter } = connectFilterWidgetToProps({
          filters: regularCommonFilters,
          setFilters: setCommonFilters,
          link: options.filterWidgetOptions,
          setLink: options.setFilterWidgetOptions ?? (() => {}),
        })(widgetProps);
        const originalOnChange = widgetProps.onChange;
        const dashboardParentFilters =
          options.ignoreFilters?.all === false
            ? regularCommonFilters.filter(
                (commonFilter) =>
                  !options.ignoreFilters?.ids?.includes(commonFilter.config.guid) &&
                  !isSameAttribute(commonFilter.attribute, widgetProps.attribute),
              )
            : [];
        return {
          ...widgetProps,
          filter,
          ...(dashboardParentFilters.length
            ? {
                parentFilters: [...(widgetProps.parentFilters ?? []), ...dashboardParentFilters],
              }
            : {}),
          onChange: (event: FilterWidgetChangeEvent) => {
            if (event.type === 'filter/changed') {
              updateCommonFilter(event.payload.filter);
            }
            originalOnChange?.(event);
          },
          onBeforeMenuOpen,
        };
      }

      const widgetType = getInternalWidgetType(widgetProps);

      const initialWidgetProps = widgetProps;
      const connectedWidgetProps = cloneDeep(widgetProps);
      const dataOptions = getWidgetDataOptionsWithDrilldown(widgetProps);

      const commonFiltersConnectionProps = prepareCommonFiltersConnectionProps(
        regularCommonFilters,
        setCommonFilters,
        widgetType,
        dataOptions,
        options,
        translate,
        openMenu,
      );

      connectedWidgetProps.highlights = mergeFilters(
        commonFiltersConnectionProps.highlights,
        initialWidgetProps.highlights,
      );

      connectedWidgetProps.onBeforeMenuOpen = onBeforeMenuOpen;

      connectedWidgetProps.filters = applyRelationsToOtherFilters(
        mergeFilters(
          commonFiltersConnectionProps.filters,
          getFiltersArray(initialWidgetProps.filters),
        ),
      );

      if (commonFiltersConnectionProps.onDataPointClick) {
        registerDataPointClickHandler(
          connectedWidgetProps,
          commonFiltersConnectionProps.onDataPointClick,
        );
      }
      if (commonFiltersConnectionProps.onDataPointsSelected) {
        registerDataPointsSelectedHandler(
          connectedWidgetProps,
          commonFiltersConnectionProps.onDataPointsSelected,
        );
      }
      if (commonFiltersConnectionProps.onDataPointContextMenu) {
        registerDataPointContextMenuHandler(
          connectedWidgetProps,
          commonFiltersConnectionProps.onDataPointContextMenu,
        );
      }
      const { clearSelection } = commonFiltersConnectionProps;
      return clearSelection
        ? withHeaderItems([createClearSelectionButtonItem(clearSelection)])(connectedWidgetProps)
        : connectedWidgetProps;
    },
    [
      regularCommonFilters,
      setCommonFilters,
      translate,
      openMenu,
      onBeforeMenuOpen,
      applyRelationsToOtherFilters,
    ],
  );

  return {
    filters: commonFiltersOrFilterRelations,
    setFilters: setCommonFiltersOrFilterRelations,
    addFilter: addCommonFilter,
    connectToWidgetProps,
  };
};
