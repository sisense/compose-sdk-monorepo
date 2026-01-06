import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { type Filter, FilterRelations } from '@sisense/sdk-data';
import cloneDeep from 'lodash-es/cloneDeep';

import { BeforeMenuOpenHandler, OpenMenuFn } from '@/common/components/menu/types.js';
import { WidgetProps } from '@/props.js';
import { getFiltersArray } from '@/utils/filter-relations.js';
import {
  getInternalWidgetType,
  isTextWidgetProps,
  mergeFilters,
  registerDataPointClickHandler,
  registerDataPointContextMenuHandler,
  registerDataPointsSelectedHandler,
  registerRenderToolbarHandler,
} from '@/widget-by-id/utils.js';

import { prepareCommonFiltersConnectionProps } from './common-filters-connector.js';
import { CommonFiltersOptions } from './types.js';
import { useConvertFilterRelations } from './use-convert-filter-relations.js';
import { getWidgetDataOptionsWithDrilldown } from './utils.js';

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
    (widgetProps: WidgetProps, options: CommonFiltersOptions = {}): WidgetProps => {
      // Text widgets do not support filters, highlights, and data options
      if (isTextWidgetProps(widgetProps)) {
        return widgetProps;
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
      if (commonFiltersConnectionProps.renderToolbar) {
        registerRenderToolbarHandler(
          connectedWidgetProps,
          commonFiltersConnectionProps.renderToolbar,
        );
      }
      return connectedWidgetProps;
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
