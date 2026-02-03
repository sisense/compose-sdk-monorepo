import type { DashboardDto } from '@/infra/api/types/dashboard-dto';

export const getWidgetIdsFromDashboard = (dashboard: DashboardDto): string[] => {
  const widgetIds: string[] = [];

  const extractWidgetIds = (obj: any) => {
    if (Array.isArray(obj)) {
      obj.forEach(extractWidgetIds);
    } else if (typeof obj === 'object' && obj !== null) {
      if (obj.widgetid) {
        widgetIds.push(obj.widgetid);
      }
      Object.values(obj).forEach(extractWidgetIds);
    }
  };

  extractWidgetIds(dashboard.layout);
  return widgetIds;
};
