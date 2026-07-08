import { DataSource } from '@sisense/sdk-data';

import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { ContextfulTransformer } from '@/shared/utils/utility-types/transformer';

import { DashboardConfig, WidgetsPanelColumnLayout } from './types.js';

export const getDividerStyle = (color: string, width: number) => `${width}px solid ${color}`;

// Emit the `toolbar.visible` deprecation notice at most once per session, so consumers get a
// migration signal without flooding the console on every render (see the deprecation policy in
// CONTRIBUTING.md).
let hasWarnedToolbarVisibleDeprecated = false;

const warnToolbarVisibleDeprecated = (): void => {
  if (hasWarnedToolbarVisibleDeprecated) {
    return;
  }
  hasWarnedToolbarVisibleDeprecated = true;
  console.warn(
    '`DashboardConfig.toolbar` is deprecated and will be removed in a future major version. ' +
      'Use `DashboardConfig.header.visible` instead.',
  );
};

/**
 * Resolves whether the dashboard header is visible from a dashboard config.
 *
 * The header is visible unless explicitly disabled. `header.visible` takes precedence; the
 * deprecated `toolbar.visible` is honored as a fallback for backward compatibility (and emits a
 * one-time deprecation warning when it is the value in effect).
 *
 * @param config - The dashboard config to resolve header visibility from.
 * @returns Whether the dashboard header should be rendered.
 */
export const isDashboardHeaderVisible = (config?: DashboardConfig): boolean => {
  const headerVisible = config?.header?.visible;
  if (headerVisible !== undefined) {
    return headerVisible !== false;
  }
  // `toolbar.visible` is deprecated in favor of `header.visible`; keep honoring it as a fallback
  // until it is removed.
  const toolbarVisible = config?.toolbar?.visible;
  if (toolbarVisible !== undefined) {
    warnToolbarVisibleDeprecated();
  }
  return toolbarVisible !== false;
};

/**
 * Gets the default layout for a set of widgets.
 *
 * Widgets are laid out in a single column vertically.
 *
 * @param widgets - The widgets to create a layout for.
 * @returns The default layout for the widgets.
 */
export const getDefaultWidgetsPanelLayout = (widgets: WidgetProps[]): WidgetsPanelColumnLayout => {
  return {
    columns: [
      {
        widthPercentage: 100,
        rows: widgets.map((widget) => ({
          cells: [{ widthPercentage: 100, widgetId: widget.id }],
        })),
      },
    ],
  };
};

/**
 * Contextful transformer that returns a copy of the layout with a new full-width row holding
 * `widgetId` appended to the end of the first column (a column is created if the layout has none).
 *
 * @param widgetId - The id of the widget to append.
 * @returns A transformer over a widgets-panel layout.
 */
export const withWidgetAppendedToPanelLayout: ContextfulTransformer<
  WidgetsPanelColumnLayout,
  string
> = (widgetId) => (layout) => {
  const newRow = {
    cells: [{ widthPercentage: 100, widgetId }],
  };
  if (layout.columns.length === 0) {
    return { columns: [{ widthPercentage: 100, rows: [newRow] }] };
  }
  return {
    ...layout,
    columns: layout.columns.map((column, index) =>
      index === 0 ? { ...column, rows: [...column.rows, newRow] } : column,
    ),
  };
};

/**
 * Contextful transformer that resolves the data source for a widget being added to a dashboard.
 *
 * Keeps the widget's own `dataSource` when present; otherwise fills it from the first defined
 * fallback (e.g. the dashboard default, then the app default). Text widgets, which have no data
 * source, are returned unchanged.
 *
 * @param fallbackDataSources - Ordered fallback data sources; the first defined one is used.
 * @returns A transformer over a widget that resolves its `dataSource`.
 */
export const withResolvedWidgetDataSource: ContextfulTransformer<
  WidgetProps,
  Array<DataSource | undefined>
> = (fallbackDataSources) => (widget) => {
  // Text widgets are not data-driven and carry no data source.
  if (widget.widgetType === 'text') {
    return widget;
  }
  if (widget.dataSource) {
    return widget;
  }
  const fallbackDataSource = fallbackDataSources.find(Boolean);
  return fallbackDataSource ? { ...widget, dataSource: fallbackDataSource } : widget;
};

/**
 * With optionally disabled auto height.
 *
 * @param widgetProps - The widget props to disable the auto height for.
 * @param shouldDisable - Whether to disable the auto height.
 * @returns The widget props with the auto height disabled if applicable.
 */
export const withOptionallyDisabledAutoHeight = (
  widgetProps: WidgetProps,
  shouldDisable: boolean,
): WidgetProps => {
  if (
    widgetProps.widgetType === 'pivot' &&
    widgetProps.styleOptions?.isAutoHeight &&
    shouldDisable
  ) {
    return {
      ...widgetProps,
      styleOptions: { ...widgetProps.styleOptions, isAutoHeight: false },
    };
  }
  return widgetProps;
};

/**
 * Checks if all widgets have auto height and supports dynamic height.
 *
 * @param widgetProps - The widget props to check for auto height.
 * @returns True if all widgets have auto height, false otherwise.
 */
export const checkForAutoHeight = (widgetProps: WidgetProps[]): boolean => {
  return widgetProps.every((w) => w.widgetType === 'pivot' && w.styleOptions?.isAutoHeight);
};
