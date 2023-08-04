import React, { useEffect, useMemo, useState, type FunctionComponent } from 'react';
import unionBy from 'lodash/unionBy';
import { ChartWidget } from '../widgets/ChartWidget';
import { TableWidget } from '../widgets/TableWidget';
import { extractWidgetProps } from './translate_widget';
import { fetchWidget } from './fetch_widget';
import { WidgetDto } from './types';
import { DashboardWidgetProps } from '../props';
import { useSisenseContext } from '../components/SisenseContextProvider';
import { useThemeContext } from '../components/ThemeProvider';
import { translation } from '../locales/en';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { TrackingContextProvider, useTrackComponentInit } from '../useTrackComponentInit';

/**
 * @internal
 */
export const UnwrappedDashboardWidget: FunctionComponent<DashboardWidgetProps> = (props) => {
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

  const filters = unionBy(
    fetchedProps?.filters,
    restProps.filters,
    // TODO: remove fallback on 'filter.jaql()' after removing temporal 'jaql()' workaround from filter translation layer
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (filter) => filter.attribute?.expression ?? filter.jaql().jaql.dim,
  );

  if (!fetchedProps) {
    return null;
  }
  return widgetType === 'table' ? (
    <TableWidget {...fetchedProps} {...restProps} filters={filters} />
  ) : (
    <ChartWidget
      {...fetchedProps}
      {...restProps}
      filters={filters}
      drilldownOptions={{
        ...fetchedProps.drilldownOptions,
        ...props.drilldownOptions,
      }}
    />
  );
};

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
export const DashboardWidget: FunctionComponent<DashboardWidgetProps> = (props) => {
  const displayName = 'DashboardWidget';
  useTrackComponentInit(displayName, props);

  return (
    <TrackingContextProvider>
      <ErrorBoundary componentName={displayName}>
        <UnwrappedDashboardWidget {...props} />
      </ErrorBoundary>
    </TrackingContextProvider>
  );
};
