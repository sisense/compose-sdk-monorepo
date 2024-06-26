import { DashboardProps } from '@/dashboard/types';
import { DashboardContainer } from '@/dashboard/components/dashboard-container';
import { useEffect, useMemo, useState } from 'react';
import { isSupportedWidgetTypeByDashboard } from '@/dashboard/utils';
import { WidgetModel } from '@/models';
import { useCommonFilters } from '@/common-filters/use-common-filters';

/**
 * React component that renders a dashboard
 * Include inside logic of applying common filters to widgets
 *
 * @internal
 */
export const Dashboard = ({
  title,
  layout,
  widgets,
  filters,
  defaultDataSource,
  widgetFilterOptions,
}: DashboardProps) => {
  const {
    filters: commonFilters,
    setFilters,
    connectToWidgetModel,
  } = useCommonFilters({ initialFilters: filters });
  const [innerWidgets, setInnerWidgets] = useState<WidgetModel[]>(widgets);

  const widgetsWithCommonFilters = useMemo(() => {
    return innerWidgets
      .filter((widget) => isSupportedWidgetTypeByDashboard(widget.widgetType))
      .map((widget) => connectToWidgetModel(widget, widgetFilterOptions?.[widget.oid]));
  }, [innerWidgets, widgetFilterOptions, connectToWidgetModel]);

  useEffect(() => {
    setFilters(filters);
  }, [filters, setFilters]);

  useEffect(() => {
    setInnerWidgets(widgets);
  }, [widgets]);

  return (
    <DashboardContainer
      title={title}
      layout={layout}
      widgets={widgetsWithCommonFilters}
      defaultDataSource={defaultDataSource}
      filters={commonFilters}
      onFiltersChange={setFilters}
    />
  );
};
