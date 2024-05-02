import { useCallback, useEffect, useState } from 'react';
import { useSisenseContext } from '../../../sisense-context/sisense-context.js';
import { TranslatableError } from '../../../translation/translatable-error.js';

type DashboardShapes = { oid: string; title: string }[];
type Dashboard = { oid: string; widgets: Widget[]; title: string };
type Widget = { oid: string; title: string };

/**
 * Tries to find widget by title in 'Sample - Ecommerce' dashboard on the Sisense instance.
 */
export const useWidgetFromSampleEcommerceDashboard = (widgetTitle: string) => {
  const { isInitialized, app } = useSisenseContext();
  if (!isInitialized) {
    throw new TranslatableError('errors.executeQueryNoSisenseContext');
  }
  const [dashboard, setDashboard] = useState<Dashboard | undefined>(undefined);
  const [widget, setWidget] = useState<Widget | undefined>(undefined);
  const [isSearchingForWidget, setIsSearchingForWidget] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const loadWidgetId = useCallback(async () => {
    setIsSearchingForWidget(true);
    setWidget(undefined);
    setDashboard(undefined);
    try {
      const allDashboardShapes = await app!.httpClient.get<DashboardShapes>('/api/dashboards');
      const sampleEcommerceDashboardShape = allDashboardShapes.find(
        (dashboardShape) => dashboardShape.title === 'Sample - Ecommerce',
      );
      if (!sampleEcommerceDashboardShape) {
        throw new Error(
          '"Sample - Ecommerce" dashboard not found. Create default "Sample - Ecommerce" dashboard from the Sisense UI.',
        );
      }
      const dashboard = await app!.httpClient.get<Dashboard>(
        `/api/dashboards/${sampleEcommerceDashboardShape.oid}`,
      );
      setDashboard(dashboard);
      const requestedWidget = dashboard.widgets.find((widget) => widget.title === widgetTitle);
      if (!requestedWidget) {
        throw new Error(
          `${widgetTitle} widget not found in 'Sample - Ecommerce' dashboard.
          Verify that widget with this title is present on the default 'Sample - Ecommerce'
          and recreate default 'Sample - Ecommerce' dashboard from the Sisense UI.`,
        );
      }
      setWidget(requestedWidget);
      setIsSearchingForWidget(false);
    } catch (err) {
      setError(err as Error);
    }
  }, [app, widgetTitle]);

  useEffect(() => {
    if (app && app.httpClient) {
      loadWidgetId();
    }
  }, [app, loadWidgetId]);

  return {
    widgetOid: widget?.oid,
    widgetTitle: widget?.title,
    dashboardOid: dashboard?.oid,
    dashboardTitle: dashboard?.title,
    isSearchingForWidget,
    error,
  };
};
