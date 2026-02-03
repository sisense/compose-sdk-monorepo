import { TFunction } from '@sisense/sdk-common';
import { Attribute, type Filter, isMembersFilter, MembersFilter } from '@sisense/sdk-data';
import partition from 'lodash-es/partition';
import merge from 'ts-deepmerge';

import { PivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/types';
import { mergeFilters } from '@/domains/widgets/components/widget-by-id/utils';
import { WidgetTypeInternal } from '@/domains/widgets/widget-model/types';
import { MenuIds } from '@/infra/contexts/menu-provider/menu-ids';
import { OpenMenuFn } from '@/infra/contexts/menu-provider/types';
import { ChartWidgetProps } from '@/props';
import { clearMembersFilter, isIncludeAllFilter, isSameAttribute } from '@/shared/utils/filters';
import { ChartDataOptions, DataPoint, RenderToolbarHandler } from '@/types';

import { withCascadingFiltersConversion } from './cascading-utils.js';
import {
  createCommonFiltersOverSelections,
  getSelectableWidgetAttributes,
  getSelectMenuItem,
  getWidgetSelections,
  getWidgetSelectionsTitleMenuItem,
} from './selection-utils.js';
import {
  CommonFiltersApplyMode,
  CommonFiltersOptions,
  CompleteCommonFiltersOptions,
  PureFilter,
} from './types.js';
import { getAllowedFilters } from './utils.js';
import { WidgetHeaderClearSelectionButton } from './widget-header-clear-selection-button.js';

type CommonFiltersConnectionProps = Pick<
  ChartWidgetProps,
  'highlights' | 'onDataPointClick' | 'onDataPointsSelected' | 'onDataPointContextMenu'
> & {
  filters: Filter[];
  renderToolbar: RenderToolbarHandler;
};

const defaultCommonFiltersOptions: CompleteCommonFiltersOptions = {
  applyMode: CommonFiltersApplyMode.HIGHLIGHT,
  shouldAffectFilters: true,
  ignoreFilters: {
    all: false,
    ids: [],
  },
  forceApplyBackgroundFilters: true,
};

function normalizeCommonFiltersOptions(
  widgetType: WidgetTypeInternal,
  options: CommonFiltersOptions,
): CompleteCommonFiltersOptions {
  if (widgetType === 'table') {
    return {
      applyMode: CommonFiltersApplyMode.FILTER,
      shouldAffectFilters: false,
      ignoreFilters: merge(defaultCommonFiltersOptions.ignoreFilters, options.ignoreFilters || {}),
    } as CompleteCommonFiltersOptions;
  }
  return merge(defaultCommonFiltersOptions, options) as CompleteCommonFiltersOptions;
}

/**
 * Prepares common filters for connection to widget props
 *
 * @param filters - Pure filters (non-cascading)
 * @param setFilters - Function to set updated pure filters (non-cascading)
 */
export function prepareCommonFiltersConnectionProps(
  commonFilters: Filter[],
  updateCommonFilters: (filters: Filter[]) => void,
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
  options: CommonFiltersOptions,
  translate: TFunction,
  openMenu?: OpenMenuFn,
): CommonFiltersConnectionProps {
  const props = {} as CommonFiltersConnectionProps;
  const normalizedOptions = normalizeCommonFiltersOptions(widgetType, options);

  // convert cascading filters to pure filters and vice versa
  const { pureFilters, updateFilters, pureFiltersIgnoringRules } = withCascadingFiltersConversion(
    commonFilters,
    updateCommonFilters,
    normalizedOptions.ignoreFilters || {},
  );

  // filters that are not disabled
  const enabledFilters = pureFilters.filter((f) => !f.config.disabled);
  // filters that are not ignored
  const allowedFilters = getAllowedFilters(enabledFilters, pureFiltersIgnoringRules);

  const selectableAttributes = getSelectableWidgetAttributes(widgetType, dataOptions);
  const shouldWidgetAffectFilters =
    normalizedOptions.shouldAffectFilters && selectableAttributes.length;

  const [sliceFilters, highlightFilters] = splitToSliceAndHighlightFilters(
    allowedFilters,
    selectableAttributes,
    normalizedOptions.applyMode,
  );

  // applies all background filters as slice filters ignoring "disabled" state and "ignoreFilters" rules
  const sliceFiltersWithAppliedBackgrounds = normalizedOptions.forceApplyBackgroundFilters
    ? mergeFilters(getBackgroundFilters(pureFilters), sliceFilters)
    : sliceFilters;

  props.filters = sliceFiltersWithAppliedBackgrounds;
  props.highlights = highlightFilters;

  // registers "onDataPointsSelected" handler
  props.onDataPointsSelected = (points: DataPoint[], nativeEvent: MouseEvent) => {
    const itemSections = [];

    if (shouldWidgetAffectFilters) {
      const widgetSelectionsTitleMenuItem = getWidgetSelectionsTitleMenuItem(
        widgetType,
        dataOptions,
        points,
      );

      if (widgetSelectionsTitleMenuItem) {
        itemSections.push(widgetSelectionsTitleMenuItem);
      }

      const selections = getWidgetSelections(widgetType, dataOptions, points);
      const { filters: selectedFilters, isSelection } = createCommonFiltersOverSelections(
        selections,
        pureFilters,
        true,
      );
      const selectMenuTitle = isSelection
        ? translate('commonFilter.selectMenuItem')
        : translate('commonFilter.unselectMenuItem');
      const selectMenuItem = getSelectMenuItem(selectMenuTitle, () => {
        updateFilters(mergeFilters(pureFilters, selectedFilters));
      });
      itemSections.push(selectMenuItem);
    }

    if (itemSections.length) {
      openMenu?.({
        id: MenuIds.WIDGET_POINTS_CROSSFILTERING,
        position: {
          left: nativeEvent.clientX,
          top: nativeEvent.clientY,
        },
        itemSections,
      });
    }
  };

  // registers "onDataPointContextMenu" handler
  props.onDataPointContextMenu = (point: DataPoint, nativeEvent: PointerEvent) => {
    const itemSections = [];

    if (shouldWidgetAffectFilters) {
      const widgetSelectionsTitleMenuItem = getWidgetSelectionsTitleMenuItem(
        widgetType,
        dataOptions,
        [point],
      );

      if (widgetSelectionsTitleMenuItem) {
        itemSections.push(widgetSelectionsTitleMenuItem);
      }

      const selections = getWidgetSelections(widgetType, dataOptions, [point]);
      if (!selections.length) {
        return;
      }

      const { filters: selectedFilters, isSelection } = createCommonFiltersOverSelections(
        selections,
        pureFilters,
        true,
      );
      const selectMenuTitle = isSelection
        ? translate('commonFilter.selectMenuItem')
        : translate('commonFilter.unselectMenuItem');
      const selectMenuItem = getSelectMenuItem(selectMenuTitle, () => {
        updateFilters(mergeFilters(pureFilters, selectedFilters));
      });
      itemSections.push(selectMenuItem);
    }

    if (itemSections.length) {
      openMenu?.({
        id: MenuIds.WIDGET_POINTS_CROSSFILTERING,
        position: {
          left: nativeEvent.clientX,
          top: nativeEvent.clientY,
        },
        itemSections,
      });
    }
  };

  if (shouldWidgetAffectFilters) {
    // registers "onDataPointClick" handler
    props.onDataPointClick = (point: DataPoint) => {
      const selections = getWidgetSelections(widgetType, dataOptions, [point]);
      const { filters: selectedFilters } = createCommonFiltersOverSelections(
        selections,
        pureFilters,
      );
      updateFilters(mergeFilters(pureFilters, selectedFilters));
    };

    // registers "renderToolbar" handler
    const selectedFilters = enabledFilters.filter((f) =>
      selectableAttributes?.some(
        (a) =>
          isMembersFilter(f) &&
          isSameAttribute(f.attribute, a) &&
          !isIncludeAllFilter(f) &&
          !f.config.locked,
      ),
    );
    const hasSelection = !!selectedFilters.length;
    const clearSelection = () => {
      const deselectedFilters = selectedFilters.map(clearMembersFilter);
      updateFilters(mergeFilters(pureFilters, deselectedFilters));
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

function getBackgroundFilters(filters: PureFilter[]): PureFilter[] {
  return filters
    .map((filter) => (filter as MembersFilter).config?.backgroundFilter)
    .filter((filter) => !!filter) as MembersFilter[];
}

function splitToSliceAndHighlightFilters(
  filters: PureFilter[],
  selectableAttributes: Attribute[],
  applyMode: `${CommonFiltersApplyMode}`,
): [PureFilter[], PureFilter[]] {
  if (applyMode === CommonFiltersApplyMode.HIGHLIGHT) {
    const [sliceFilters, highlightFilters] = partition(filters, (filter) =>
      selectableAttributes.every((attribute) => !isSameAttribute(attribute, filter.attribute)),
    );
    // "Include all" filters shouldn't be applied as highlights.
    // This can cause weird interference with slice filters on a JAQL server side
    const nonIncludeAllHighlightFilters = highlightFilters.filter(
      (filter) => !isIncludeAllFilter(filter),
    );
    return [sliceFilters, nonIncludeAllHighlightFilters];
  }
  return [filters, []];
}
