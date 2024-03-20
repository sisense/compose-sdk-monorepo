import React from 'react';
import { getWidgets } from '@/__demo__/pages/helpers/get-widgets';
import { useGetDashboardModel, useGetDashboardModels } from '@/models';
import { DashboardWidget } from '@/dashboard-widget/dashboard-widget';

export function UseGetDashboardModelSingleDemo() {
  const dashboards = getWidgets();

  const dashboardOid = dashboards[0].dashboardOid || '';

  const { dashboard, isLoading, isError, error } = useGetDashboardModel({
    dashboardOid,
    includeWidgets: true,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error: {error?.message}</div>;
  }
  if (dashboard) {
    return (
      <div>
        {`Dashboard Title - ${dashboard.title}`}
        {dashboard.widgets?.map((widget) => (
          <DashboardWidget key={widget.oid} widgetOid={widget.oid} dashboardOid={dashboard.oid} />
        ))}
      </div>
    );
  }
  return null;
}

function UseGetDashboardModelPluralDemo() {
  const { dashboards, isLoading, isError, error } = useGetDashboardModels({
    includeWidgets: true,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>{error?.message}</div>;
  }
  if (dashboards) {
    return (
      <div>
        {`Total Dashboards: ${dashboards.length}`}
        {dashboards.map((dashboard) =>
          dashboard.widgets?.map((widget) => (
            <DashboardWidget key={widget.oid} widgetOid={widget.oid} dashboardOid={dashboard.oid} />
          )),
        )}
      </div>
    );
  }
  return null;
}

export function UseGetDashboardModelDemo() {
  return (
    <div>
      <UseGetDashboardModelSingleDemo />
      <UseGetDashboardModelPluralDemo />
    </div>
  );
}
