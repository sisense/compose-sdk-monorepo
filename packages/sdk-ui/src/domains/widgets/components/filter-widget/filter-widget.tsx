import { type FunctionComponent, useEffect, useRef } from 'react';

import { getDataSourceName } from '@sisense/sdk-data';

import { useTrackWidgetInit } from '@/domains/widgets/hooks/use-track-widget-init';
import { useWidgetHeaderManagement } from '@/domains/widgets/hooks/use-widget-header-management';
import { getWidgetEntityId } from '@/domains/widgets/hooks/widget-entity-id';
import {
  getFilterWidgetName,
  getWidgetTitle,
} from '@/domains/widgets/hooks/widget-tracking-adapters';
import { WidgetContainer } from '@/domains/widgets/shared/widget-container/widget-container.js';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';

import type { WidgetChangeEvent } from '../../change-events';
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
 *
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
    isMultiselect,
  } = props;

  const { headerConfig, titleEditor } = useWidgetHeaderManagement({
    title: title || attribute.name,
    headerConfig: config?.header,
    // Same widening cast as ChartWidget/PivotTableWidget — the hook only emits
    // title/changed, which is a member of FilterWidgetChangeEvent.
    onChange: onChange as (event: WidgetChangeEvent) => void,
  });

  useTrackWidgetInit({
    widgetType: 'filter',
    widgetName: getFilterWidgetName(),
    widgetTitle: getWidgetTitle(props),
    entityId: getWidgetEntityId(props, 'filter', getFilterWidgetName()),
  });

  // Persist the attribute name as the widget title when the user has not set one,
  // so the auto-title is saved (via the same title/changed channel as a manual
  // rename) instead of only being displayed as a fallback. Emitted once per
  // attribute; re-emits only if the attribute changes while the title is still unset.
  const defaultedTitleForAttributeRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      !title &&
      attribute.name &&
      onChange &&
      defaultedTitleForAttributeRef.current !== attribute.name
    ) {
      defaultedTitleForAttributeRef.current = attribute.name;
      onChange({ type: 'title/changed', payload: { title: attribute.name } });
    }
  }, [title, attribute.name, onChange]);

  const dropdown = (
    <FilterWidgetDropdown
      attribute={attribute}
      dataSource={dataSource}
      title={title}
      filter={filter}
      onFilterUpdate={(newFilter) =>
        onChange?.({ type: 'filter/changed', payload: { filter: newFilter } })
      }
      parentFilters={parentFilters}
      isMultiselect={isMultiselect}
      onDateLevelChange={(newAttribute) =>
        onChange?.({ type: 'dateLevel/changed', payload: { attribute: newAttribute } })
      }
    />
  );

  // In Fusion-hosted contexts (non-CSDK dashboard, widget editor), the host provides
  // the widget chrome. Skip WidgetContainer to avoid height-collapse and double chrome.
  if (containerless) return dropdown;

  return (
    <WidgetContainer
      title={title || attribute.name}
      styleOptions={{
        ...styleOptions,
        header: {
          ...styleOptions?.header,
          // Hide the default info button: it surfaces datasource/refresh actions
          // that do not apply to a filter control (no query result to refresh).
          // A consumer-supplied renderToolbar still runs, but receives an EMPTY
          // default toolbar so it cannot re-surface the broken info button.
          // The toolbar menu (e.g. Delete) renders separately either way.
          renderToolbar: (onRefresh) =>
            styleOptions?.header?.renderToolbar?.(onRefresh, <></>) ?? <></>,
        },
      }}
      headerConfig={headerConfig}
      titleEditor={titleEditor}
      dataSetName={dataSource ? getDataSourceName(dataSource) : undefined}
    >
      {dropdown}
    </WidgetContainer>
  );
});
