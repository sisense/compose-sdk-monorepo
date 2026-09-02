import type { Attribute, DataSource, Filter } from '@sisense/sdk-data';

import type { FilterWidgetChangeEvent } from '@/domains/widgets/change-events';
import type { WidgetContainerStyleOptions } from '@/types';

import type { FilterWidgetConfig } from '../widget/widget-config';

/**
 * Height of the filter control, as a step rather than a pixel value.
 * Maps to pixel heights: `xs`=24, `s`=28, `m`=32, `l`=36, `xl`=40.
 *
 * @example
 * ```ts
 * const size: FilterWidgetControlSize = 'l';
 * ```
 *
 * @beta
 */
export type FilterWidgetControlSize = 'xs' | 's' | 'm' | 'l' | 'xl';

/**
 * Corner roundness of the filter control, as a step rather than a pixel value.
 * Maps to pixel radii: `none`=0, `xs`=2, `s`=4, `m`=6, `l`=8, `xl`=20.
 *
 * @example
 * ```ts
 * const cornerRadius: FilterWidgetControlCornerRadius = 'xl';
 * ```
 *
 * @beta
 */
export type FilterWidgetControlCornerRadius = 'none' | 'xs' | 's' | 'm' | 'l' | 'xl';

/**
 * Horizontal placement of the filter control inside the widget.
 *
 * @example
 * ```ts
 * const alignHorizontal: FilterWidgetControlAlignHorizontal = 'center';
 * ```
 *
 * @beta
 */
export type FilterWidgetControlAlignHorizontal = 'left' | 'center' | 'right';

/**
 * Vertical placement of the filter control inside the widget.
 *
 * @example
 * ```ts
 * const alignVertical: FilterWidgetControlAlignVertical = 'middle';
 * ```
 *
 * @beta
 */
export type FilterWidgetControlAlignVertical = 'top' | 'middle' | 'bottom';

/**
 * Styling of the filter control itself — the field the user picks values in — as opposed to
 * the widget container around it.
 *
 * Omitted properties fall back to the dashboard theme, and then to the SDK defaults
 * (`size` and `cornerRadius` `'s'`, left/middle alignment, standard light palette).
 *
 * @example
 * ```tsx
 * <FilterWidget
 *   attribute={DM.Commerce.AgeRange}
 *   styleOptions={{
 *     control: {
 *       primaryText: '#131F29',
 *       background: '#FFFFFF',
 *       accentColor: '#94F5F0',
 *       size: 'l',
 *       cornerRadius: 'm',
 *     },
 *   }}
 * />
 * ```
 *
 * @beta
 */
export type FilterWidgetControlStyleOptions = {
  /** Selected value, chevron, and option text in the open list. */
  primaryText?: string;
  /** Placeholder, search icon, `+N`, disabled and empty copy. */
  secondaryText?: string;
  /** Fill of the control and of the open list. */
  background?: string;
  /** When false, the control has no border. The open list has no border either way. */
  borderEnabled?: boolean;
  /** Border color of the control, when `borderEnabled` is true. */
  borderColor?: string;
  /**
   * Brand / accent for the control's primary action — the date panel's Apply button — and
   * for any selection highlight the design fills with the brand color.
   */
  accentColor?: string;
  /** Height of the control. Rows in the open list stay 30px. @defaultValue 's' (28px) */
  size?: FilterWidgetControlSize;
  /** Corner roundness of the control and of the open list. @defaultValue 's' (4px) */
  cornerRadius?: FilterWidgetControlCornerRadius;
  /** @defaultValue 'left' */
  alignHorizontal?: FilterWidgetControlAlignHorizontal;
  /** @defaultValue 'middle' */
  alignVertical?: FilterWidgetControlAlignVertical;
};

/**
 * Styling of a filter widget: the container, plus the filter control inside it.
 *
 * @example
 * ```tsx
 * <FilterWidget
 *   attribute={DM.Commerce.AgeRange}
 *   styleOptions={{ backgroundColor: '#F4F4F8', control: { size: 'l', cornerRadius: 'm' } }}
 * />
 * ```
 *
 * @beta
 */
export type FilterWidgetStyleOptions = WidgetContainerStyleOptions & {
  /** Styling of the filter control. */
  control?: FilterWidgetControlStyleOptions;
};

/**
 * `FilterWidgetFilterType` selects the rendering type for a filter widget.
 *
 * - `'members'`      — searchable member-select dropdown. Implemented.
 * - `'dateRange'`    — date-range picker. Planned.
 * - `'period'`       — relative-period picker. Planned.
 * - `'numericRange'` — numeric range slider. Planned.
 * - `'condition'`    — string condition builder with optional AND/OR chaining (text attributes only). Implemented.
 *
 * @example
 * The following selects the member-select dropdown rendering:
 * ```ts
 * const filterType: FilterWidgetFilterType = 'members';
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
 * `FilterWidgetProps` configures a filter widget — a compact, dashboard-embeddable
 * control that lets users filter a dashboard by selecting values for a single
 * dimension, without opening the full filter panel.
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
   * `'condition'` renders a string condition control for text attributes.
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
   * Everything that narrows the member list: the widget's own dimension filters, plus any
   * dashboard filters the widget opted in to. Scopes the member query only.
   *
   * @category Data
   */
  parentFilters?: Filter[];
  /**
   * The widget's own dimension filters — the permanent restriction on which members this widget
   * may select, as opposed to the transient dashboard state also present in `parentFilters`.
   *
   * The published filter encodes them, so that selecting all values filters the dashboard by the
   * allowed members rather than by every member of the dimension. Pass the same filters here and
   * in `parentFilters`.
   *
   * @category Data
   */
  dimensionFilters?: Filter[];
  /**
   * Style options for the widget container (look & feel, border, shadow, etc.), and for the
   * filter control inside it under `control`.
   *
   * @category Widget
   */
  styleOptions?: FilterWidgetStyleOptions;
  /**
   * Configuration of the widget.
   *
   * @category Widget
   */
  config?: FilterWidgetConfig;
  /**
   * When true, renders only the dropdown content without the WidgetContainer chrome.
   * Use when the host application already provides its own widget chrome.
   *
   * @internal
   */
  containerless?: boolean;
  /**
   * Calls the provided callback each time the widget finishes rendering with
   * fetched data — on initial load and again whenever it re-enters a ready
   * state after a reload (e.g. dimension change, refetch). Use this to signal
   * to a host application that the widget content is committed to the DOM.
   *
   * @category Widget
   * @internal
   */
  onReady?: () => void;
  /**
   * Hides date granularity levels from the granularity dropdown.
   * Populated automatically by the Dashboard to prevent selecting granularities
   * that already have an active filter on the same date dimension.
   *
   * @sisenseInternal
   */
  excludedDateLevels?: readonly string[];
}
