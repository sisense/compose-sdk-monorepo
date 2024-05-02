import { useState, useCallback, ChangeEvent, useMemo } from 'react';
import { Filter, FilterRelations, NumericFilter, filterFactory } from '@sisense/sdk-data';
import { ContentPanel } from '@/content-panel';
import { CriteriaFilterTile, MemberFilterTile } from '@/filters';
import { useGetDashboardModel, useGetDashboardModels, WidgetModel } from '@/models';
import * as DM from '@/__demo__/sample-ecommerce';
import cloneDeep from 'lodash/cloneDeep';

const getWidgetAndDashboardFilters = (
  optOut: { [key: string]: boolean },
  widgetFilters: Filter[] | FilterRelations | undefined,
  dashboardFilters: Filter[],
) => {
  return dashboardFilters
    .filter((f) => !optOut[f.attribute.name])
    .concat((widgetFilters as Filter[]) || []);
};

export const Dashboard = ({ dashboardOid }: { dashboardOid: string }) => {
  const [yearFilter, setYearFilter] = useState<Filter | null>(
    filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']),
  );
  const [countryFilter, setCountryFilter] = useState<Filter | null>(
    filterFactory.members(DM.Country.Country, []),
  );
  const [revenueFilter, setRevenueFilter] = useState<Filter | null>(
    filterFactory.greaterThan(DM.Commerce.Revenue, 0),
  );

  const activeFilters = useMemo(() => {
    return [yearFilter, countryFilter, revenueFilter] as Filter[];
  }, [yearFilter, countryFilter, revenueFilter]);

  const { dashboard, isLoading, isError } = useGetDashboardModel({
    dashboardOid,
    includeWidgets: true,
  });

  const anyUseWidgetsUseDM = useMemo(
    () => dashboard?.widgets?.some((w) => w.dataSource === DM.DataSource),
    [dashboard],
  );

  const filteredWidgets = useMemo(() => {
    if (dashboard && !isLoading && !isError) {
      return dashboard.widgets
        ?.filter((w: WidgetModel) => w.widgetType !== 'plugin')
        .map((w): WidgetModel => {
          const filterOptOut = {};
          // does not handle filter relations at this time
          const widgetClone = cloneDeep(w);
          widgetClone.filters = getWidgetAndDashboardFilters(
            filterOptOut,
            w.filters,
            w.dataSource === DM.DataSource ? activeFilters : [],
          );
          return widgetClone;
        });
    } else {
      return undefined;
    }
  }, [dashboard, isLoading, isError, activeFilters]);

  if (isLoading) return <div>isLoading...</div>;
  if (isError) return <div>isError</div>;

  if (!dashboard.layout) return <div>no layout to render</div>;
  if (!filteredWidgets) return <div>no widgets to render</div>;

  return (
    <div className="csdk-flex">
      <div className="csdk-flex-auto">
        <ContentPanel layout={dashboard.layout} widgets={filteredWidgets} />
      </div>
      <div className="csdk-w-[200px]">
        <div>Filters</div>
        {anyUseWidgetsUseDM && (
          <div>
            <MemberFilterTile
              onChange={setCountryFilter}
              title="Countries"
              filter={countryFilter}
              attribute={DM.Country.Country}
            />
            <MemberFilterTile
              onChange={setYearFilter}
              title="Years"
              filter={yearFilter}
              attribute={DM.Commerce.Date.Years}
            />
            <CriteriaFilterTile
              onUpdate={setRevenueFilter}
              title="Revenue"
              filter={revenueFilter as NumericFilter}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const RenderDashboardDemo = () => {
  const { dashboards, isLoading, isError } = useGetDashboardModels({});

  const [selectedDashboardOid, setSelectedDashboardOid] = useState<string | undefined>();

  const handleDashboardChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDashboardOid(event.target.value);
  }, []);

  if (!dashboards || isLoading || isError) return <div>Loading</div>;

  return (
    <>
      <div className="csdk-flex csdk-items-center csdk-gap-x-2">
        <label htmlFor="selectDashboard">Select Dashboard:</label>
        <select
          id="selectDashboard"
          value={selectedDashboardOid}
          onChange={handleDashboardChange}
          style={{ border: '1px solid grey', borderRadius: '5px' }}
        >
          <option key={'0'} value={undefined}></option>
          {dashboards.map((dashboard) => {
            return (
              <option key={dashboard.oid} value={dashboard.oid}>
                {dashboard.title}
              </option>
            );
          })}
        </select>
      </div>
      {selectedDashboardOid && (
        <Dashboard key={selectedDashboardOid} dashboardOid={selectedDashboardOid} />
      )}
    </>
  );
};
