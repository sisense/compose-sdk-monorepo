import React, { useEffect, useMemo, useState, type FunctionComponent } from 'react';
import { ChartWidget } from '../widgets/chart-widget';
import { TableWidget } from '../widgets/table-widget';
import { extractWidgetProps } from './translate-widget';
import { WidgetDto } from './types';
import { DashboardWidgetProps } from '../props';

import { useSisenseContext } from '../sisense-context/sisense-context';
import { useThemeContext } from '../theme-provider';
import { asSisenseComponent } from '../decorators/as-sisense-component';
import { mergeFiltersByStrategy } from './utils';
import { useGetApi } from '../api/rest-api';

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
  customContextErrorMessageKey: 'errors.dashboardWidgetNoSisenseContext',
})((props) => {
  const [error, setError] = useState<Error>();
  const api = useGetApi();

  if (error) {
    throw error;
  }

  const { widgetOid, dashboardOid, ...restProps } = props;
  const { themeSettings } = useThemeContext();

  const [fetchedWidget, setFetchedWidget] = useState<WidgetDto>();

  const { isInitialized, app } = useSisenseContext();

  useEffect(() => {
    api
      .getWidget(widgetOid, dashboardOid)
      .then(setFetchedWidget)
      .catch((asyncError: Error) => {
        // set error state to trigger rerender and throw synchronous error
        setError(asyncError);
      });
  }, [widgetOid, dashboardOid, app, isInitialized, api]);

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
