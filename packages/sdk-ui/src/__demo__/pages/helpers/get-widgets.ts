export interface Dashboard {
  dashboardOid: string;
  widgetOids: string[];
}

/**
 * Get widgets from environment variable
 */
export const getWidgets = (): Dashboard[] => {
  const { VITE_APP_WIDGETS: widgetListStr } = import.meta.env;

  if (!widgetListStr) return [];

  const dashboards = widgetListStr.split('|');
  return dashboards
    .map((dashWidgetsStr: string) => {
      const [dashId, widgetIdsStr] = dashWidgetsStr.split(':');
      if (!widgetIdsStr) return { Id: '' };
      const widgetIds = widgetIdsStr.split(',');
      return {
        dashboardOid: dashId.trim(),
        widgetOids: widgetIds.map((widgetId) => widgetId.trim()),
      };
    })
    .filter((d: Dashboard) => 'dashboardOid' in d);
};
