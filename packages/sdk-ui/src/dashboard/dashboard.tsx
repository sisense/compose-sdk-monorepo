import { DashboardProps } from '@/dashboard/types';
import { DashboardContainer } from '@/dashboard/components/dashboard-container';
import { useEffect, useMemo, useState } from 'react';
import { Filter } from '@sisense/sdk-data';
import { isSupportedWidgetTypeByDashboard, addFiltersToWidget } from '@/dashboard/utils';
import { WidgetModel } from '@/models';

/**
 * React component that renders a dashboard
 * Include inside logic of applying common filters to widgets
 *
 * @internal
 */
export const Dashboard = ({ title, layout, widgets, filters }: DashboardProps) => {
  const [innerFilters, setInnerFilters] = useState<Filter[]>(filters);
  const [innerWidgets, setInnerWidgets] = useState<WidgetModel[]>(widgets);

  const widgetsWithCommonFilters = useMemo(() => {
    return innerWidgets
      .filter((widget) => isSupportedWidgetTypeByDashboard(widget.widgetType))
      .map((widget) => addFiltersToWidget(widget, innerFilters));
  }, [innerWidgets, innerFilters]);

  useEffect(() => {
    setInnerFilters(filters);
  }, [filters]);

  useEffect(() => {
    setInnerWidgets(widgets);
  }, [widgets]);

  return (
    <DashboardContainer
      title={title}
      layout={layout}
      widgets={widgetsWithCommonFilters}
      filters={innerFilters}
      onFiltersChange={setInnerFilters}
    />
  );
};
