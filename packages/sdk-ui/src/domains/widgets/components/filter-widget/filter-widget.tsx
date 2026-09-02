import { type FunctionComponent, useEffect, useMemo, useRef } from 'react';

import { getDataSourceName } from '@sisense/sdk-data';

import { useTrackWidgetInit } from '@/domains/widgets/hooks/use-track-widget-init';
import { getWidgetEntityId } from '@/domains/widgets/hooks/widget-entity-id';
import {
  getFilterWidgetName,
  getWidgetTitle,
} from '@/domains/widgets/hooks/widget-tracking-adapters';
import { WidgetContainer } from '@/domains/widgets/shared/widget-container/widget-container.js';
import { useWidgetHeaderMenu } from '@/domains/widgets/shared/widget-header/features/use-widget-header-menu';
import { useWidgetHeaderTitle } from '@/domains/widgets/shared/widget-header/features/use-widget-header-title';
import { ThemeProvider, useThemeContext } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';

import { FilterWidgetDropdown } from './filter-widget-dropdown';
import type { FilterWidgetProps } from './types';

/**
 * Widget component that renders as a compact searchable dropdown and drives
 * a dashboard-level filter for the configured dimension.
 *
 * When placed inside a {@link Dashboard} component, the `filter` and `onChange`
 * props are injected automatically. For standalone use, pass them explicitly.
 *
 * Filter values are NOT affected by other dashboard filters — the member list
 * always shows all available values for the dimension.
 * @example
 * ```tsx
 * const [filter, setFilter] = useState<Filter | null>(null);
 *
 * return (
 *   <FilterWidget
 *     attribute={DM.Commerce.Country}
 *     filter={filter}
 *     onChange={(event) => {
 *       if (event.type === 'filter/changed') {
 *         setFilter(event.payload.filter);
 *       }
 *     }}
 *   />
 * );
 * ```
 * @param props - Filter widget props
 * @returns Filter widget component
 * @group Filter Widgets
 * @alpha
 */
export const FilterWidget: FunctionComponent<FilterWidgetProps> = asSisenseComponent({
  componentName: 'FilterWidget',
})((props) => {
  const {
    attribute,
    dataSource,
    title,
    styleOptions,
    config,
    containerless = false,
    filter = null,
    onChange,
    parentFilters,
    dimensionFilters,
    isMultiselect,
    filterType,
    onReady,
    excludedDateLevels,
  } = props;

  /* Split once: the control's own styling goes to the control, and the rest — the widget
     chrome — to the container, which has no use for `control`. */
  const { control: controlStyleOptions, ...containerStyleOptions } = styleOptions ?? {};

  /* A filter widget's chrome is the theme's filter panel colour, so it reads as the filters it
     belongs with rather than as an ordinary widget. Defaulted here rather than in
     WidgetContainer, whose `unset` is the right default for every other widget type. */
  const { themeSettings } = useThemeContext();
  const filterPanelBackground = themeSettings.filter.panel.backgroundColor;

  const headerConfigWithTitle = useWidgetHeaderTitle(config?.header, {
    title: title || attribute.name,
    styleOptions: styleOptions?.header,
    onChange,
  });

  const fullHeaderConfig = useWidgetHeaderMenu(headerConfigWithTitle);

  useTrackWidgetInit({
    widgetType: 'filter',
    widgetName: getFilterWidgetName(),
    widgetTitle: getWidgetTitle(props),
    entityId: getWidgetEntityId(props, 'filter', getFilterWidgetName()),
  });

  // Persist the attribute name as the widget title when the user has not set one,
  // so the auto-title is saved (via the same title/changed channel as a manual
  // rename) instead of only being displayed as a fallback. Emitted once per
  // DIMENSION, and re-emitted only if the dimension changes while the title is still
  // unset — picking a different field renames an unnamed widget, but choosing a
  // different date level on a widget that already has its name does not. The level is
  // part of the attribute's name (`Years in Date`), so keying this on the name renamed
  // the widget, and its linked filter tile with it, on every granularity change.
  const defaultedTitleForDimensionRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      !title &&
      attribute.name &&
      onChange &&
      defaultedTitleForDimensionRef.current !== attribute.expression
    ) {
      defaultedTitleForDimensionRef.current = attribute.expression;
      onChange({ type: 'title/changed', payload: { title: attribute.name } });
    }
  }, [title, attribute.name, attribute.expression, onChange]);

  const dropdown = (
    <FilterWidgetDropdown
      attribute={attribute}
      dataSource={dataSource}
      filter={filter}
      filterType={filterType}
      onFilterUpdate={(newFilter) =>
        onChange?.({ type: 'filter/changed', payload: { filter: newFilter } })
      }
      parentFilters={parentFilters}
      dimensionFilters={dimensionFilters}
      isMultiselect={isMultiselect}
      onDateLevelChange={(newAttribute) =>
        onChange?.({ type: 'dateLevel/changed', payload: { attribute: newAttribute } })
      }
      onReady={onReady}
      excludedDateLevels={excludedDateLevels}
      controlStyleOptions={controlStyleOptions}
    />
  );

  // In host-embedded contexts (non-CSDK dashboard, widget editor), the host provides
  // the widget chrome. Skip WidgetContainer to avoid height-collapse and double chrome.
  if (containerless) return dropdown;

  return (
    <WidgetContainer
      styleOptions={{
        ...containerStyleOptions,
        // `??`, so a background chosen in Widget Style still wins over the theme's.
        backgroundColor: containerStyleOptions.backgroundColor ?? filterPanelBackground,
        header: {
          ...containerStyleOptions.header,
          backgroundColor: containerStyleOptions.header?.backgroundColor ?? filterPanelBackground,
        },
      }}
      headerConfig={fullHeaderConfig}
    >
      {/* WidgetContainer republishes its own background as `chart.backgroundColor` for its
          content, which is right for a chart — the plot sits on the card. A filter control is
          not: its background is the Filter Style `Background` token, whose default is the
          widget background role. Restore that here so painting the chrome with the filter
          panel colour does not drag the control's default along with it. */}
      <ThemeProvider theme={{ chart: { backgroundColor: themeSettings.chart.backgroundColor } }}>
        {dropdown}
      </ThemeProvider>
    </WidgetContainer>
  );
});
