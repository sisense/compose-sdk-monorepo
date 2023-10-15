import React, { useEffect, useMemo, useState, type FunctionComponent } from 'react';
import { ChartWidget } from '../widgets/chart-widget';
import { TableWidget } from '../widgets/table-widget';
import { extractWidgetProps } from './translate-widget';
import { fetchWidget } from './fetch-widget';
import { WidgetDto } from './types';
import { DashboardWidgetProps } from '../props';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { useThemeContext } from '../theme-provider';
import { translation } from '../locales/en';
import { asSisenseComponent } from '../decorators/as-sisense-component';
import { mergeFiltersByStrategy } from './utils';

/**
 * The Dashboard Widget component, which is a thin wrapper on the {@link ChartWidget} component,
 * used to render a widget created in the Sisense instance.
 *
 * @example
 * The example below renders a dashboard widget with the specified widget and dashboard OIDs.
 * ```tsx
 * <DashboardWidget
 *   widgetOid={'64473e07dac1920034bce77f'}
 *   dashboardOid={'6441e728dac1920034bce737'}
 * />
 * ```
 */
export const DashboardWidget: FunctionComponent<DashboardWidgetProps> = asSisenseComponent({
  componentName: 'DashboardWidget',
})((props) => {
  const [error, setError] = useState<Error>();
  if (error) {
    throw error;
  }

  const { widgetOid, dashboardOid, ...restProps } = props;
  const { themeSettings } = useThemeContext();

  const [fetchedWidget, setFetchedWidget] = useState<WidgetDto>();

  const { isInitialized, app } = useSisenseContext();

  useEffect(() => {
    if (!isInitialized) {
      setError(new Error(translation.errors.dashboardWidgetNoSisenseContext));
    }

    if (!app) {
      return;
    }

    void fetchWidget(widgetOid, dashboardOid, app)
      .then(setFetchedWidget)
      .catch((asyncError: Error) => {
        // set error state to trigger rerender and throw synchronous error
        setError(asyncError);
      });
  }, [widgetOid, dashboardOid, app, isInitialized]);

  const { type: widgetType, props: fetchedProps } = useMemo(
    () =>
      fetchedWidget
        ? { ...extractWidgetProps(fetchedWidget, themeSettings), themeSettings }
        : { type: null, props: null },
    [fetchedWidget, themeSettings],
  );

  const filters = mergeFiltersByStrategy(
    fetchedProps?.filters,
    restProps.filters,
    restProps.filtersMergeStrategy,
  );

  if (!fetchedProps) {
    return null;
  }
  return widgetType === 'table' ? (
    <TableWidget
      {...fetchedProps}
      {...restProps}
      filters={filters}
      styleOptions={{
        ...fetchedProps.styleOptions,
        ...props.styleOptions,
      }}
    />
  ) : (
    <ChartWidget
      {...fetchedProps}
      {...restProps}
      filters={filters}
      drilldownOptions={{
        ...fetchedProps.drilldownOptions,
        ...props.drilldownOptions,
      }}
      styleOptions={{
        ...fetchedProps.styleOptions,
        ...props.styleOptions,
      }}
    />
  );
});
