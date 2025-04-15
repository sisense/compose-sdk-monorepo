import { useGetDashboardModelInternal, useGetWidgetModelInternal } from '@/models';
import { DashboardModel, WidgetModel } from '@/models';

/**
 * Custom hook for fetching a dashboard model and a widget model.
 *
 * @returns
 */
export function useGetDashboardModelAndWidgetModel({
  widgetOid,
  dashboardOid,
  shouldLoadFullDashboard = false,
}: {
  widgetOid: string;
  dashboardOid: string;
  shouldLoadFullDashboard?: boolean;
}): {
  dashboardModel: DashboardModel | null;
  widgetModel: WidgetModel | null;
} {
  const { dashboard: dashboardModel } = useGetDashboardModelInternal({
    enabled: shouldLoadFullDashboard,
    dashboardOid,
    includeWidgets: true,
    includeFilters: true,
  });

  const { widget: singleWidgetModel } = useGetWidgetModelInternal({
    enabled: !shouldLoadFullDashboard,
    widgetOid,
    dashboardOid,
  });
  let widgetModel: WidgetModel | null = null;

  if (shouldLoadFullDashboard && dashboardModel) {
    const widgetFromDashboardModel = dashboardModel.widgets.find((w) => w.oid === widgetOid);
    widgetModel = widgetFromDashboardModel ?? null;
  } else {
    widgetModel = singleWidgetModel ?? null;
  }
  return {
    widgetModel,
    dashboardModel: dashboardModel ?? null,
  };
}
