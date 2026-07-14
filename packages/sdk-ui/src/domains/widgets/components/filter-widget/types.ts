import type { Attribute, DataSource, Filter } from '@sisense/sdk-data';

import type { FilterWidgetChangeEvent } from '@/domains/widgets/change-events';
import type { WidgetContainerStyleOptions } from '@/types';

import type { WidgetConfig } from '../widget/types';

/**
 * Rendering type for the FilterWidget.
 *
 * - `'members'`      — searchable member-select dropdown. Implemented.
 * - `'dateRange'`    — date-range picker. Planned.
 * - `'period'`       — relative-period picker. Planned.
 * - `'numericRange'` — numeric range slider. Planned.
 * - `'condition'`    — conditional / formula filter builder. Planned.
 *
 * @example
 * ```tsx
 * <FilterWidget attribute={DM.Commerce.Country} filterType="members" />
 * ```
 *
 * @beta
 */
export type FilterWidgetFilterType =
  | 'members'
  | 'dateRange'
  | 'period'
  | 'numericRange'
  | 'condition';

/**
 * Human-readable UI labels for each {@link FilterWidgetFilterType}.
 * Use these when rendering a type selector in a design panel or settings UI.
 *
 * @example
 * ```tsx
 * filterWidgetFilterTypeLabels['members'] // → 'List'
 * filterWidgetFilterTypeLabels['dateRange'] // → 'Date Range'
 * ```
 *
 * @alpha
 */
export const filterWidgetFilterTypeLabels: Record<FilterWidgetFilterType, string> = {
  members: 'List',
  dateRange: 'Date Range',
  period: 'Period',
  numericRange: 'Numeric Range',
  condition: 'Condition',
};

/**
 * Props for the FilterWidget component.
 *
 * @example
 * ```tsx
 * const [filter, setFilter] = useState<Filter | null>(null);
 *
 * return (
 *   <FilterWidget
 *     attribute={DM.Commerce.Country}
 *     title="Country"
 *     isMultiselect={true}
 *     filter={filter}
 *     onChange={(event) => {
 *       if (event.type === 'filter/changed') {
 *         setFilter(event.payload.filter);
 *       }
 *     }}
 *   />
 * );
 * ```
 *
 * @beta
 */
export interface FilterWidgetProps {
  /**
   * Attribute (dimension) to filter on. A query fetches all members for selection.
   *
   * @category Data
   */
  attribute: Attribute;
  /**
   * Data source the query runs against.
   *
   * If not specified, the query will use the `defaultDataSource` specified in the
   * parent Sisense Context.
   *
   * @category Data
   */
  dataSource?: DataSource;
  /**
   * Widget title. Auto-populated from `attribute.name` if not set.
   *
   * @category Widget
   */
  title?: string;
  /**
   * How the filter is rendered. Defaults to `'members'` (searchable member-select dropdown).
   * Additional types will be added as they are implemented.
   *
   * @defaultValue 'members'
   * @category Widget
   */
  filterType?: FilterWidgetFilterType;
  /**
   * If true, the dropdown allows selecting multiple members.
   *
   * @defaultValue true
   * @category Widget
   */
  isMultiselect?: boolean;
  /**
   * Current filter state. Injected automatically when placed inside a Dashboard.
   * For standalone use, pass explicitly.
   *
   * @category Data
   */
  filter?: Filter | null;
  /**
   * Called when a widget change event occurs — the unified widget change
   * channel (same pattern as ChartWidget / PivotTableWidget):
   *
   * - `'filter/changed'` — the user changed the filter selection
   * - `'dateLevel/changed'` — the user picked a different date granularity
   * - `'title/changed'` — the widget title was renamed inline
   *
   * Injected automatically when placed inside a Dashboard.
   *
   * @example
   * ```tsx
   * onChange={(event) => {
   *   if (event.type === 'filter/changed') {
   *     setFilter(event.payload.filter);
   *   }
   * }}
   * ```
   * @internal
   */
  onChange?: (event: FilterWidgetChangeEvent) => void;
  /**
   * Parent filters for cascading behavior. Out of scope for phase 1.
   *
   * @category Data
   */
  parentFilters?: Filter[];
  /**
   * Style options for the widget container (look & feel, border, shadow, etc.).
   *
   * Note: the default header toolbar (info button with datasource/refresh) is
   * always hidden for this widget — those actions do not apply to a filter
   * control. A custom `header.renderToolbar` is still invoked, but receives an
   * empty default toolbar.
   *
   * @category Widget
   */
  styleOptions?: WidgetContainerStyleOptions;
  /**
   * Widget configuration (e.g. header toolbar menu).
   *
   * @internal
   */
  config?: WidgetConfig;
  /**
   * When true, renders only the dropdown content without the WidgetContainer chrome.
   * Use in contexts where the host (Fusion dashboard, widget editor) provides its own chrome.
   *
   * @internal
   */
  containerless?: boolean;
}
