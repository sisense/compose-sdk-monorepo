/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { useState, useMemo, useEffect, Key, useCallback, ChangeEvent } from 'react';
import RGL, { WidthProvider, Layout } from 'react-grid-layout';
import '../../../../../node_modules/react-grid-layout/css/styles.css';
import {
  generateDashboardLayout,
  cellStyle,
  getWidgetAndDashboardFilters,
} from './helpers/layout-utils';

import * as DM from '../sample-ecommerce.js';

import { Filter, filterFactory } from '@sisense/sdk-data';

import { useGetDashboardModel, useGetDashboardModels } from '@/models/dashboard';
import {
  ChartWidget,
  ChartWidgetProps,
  MemberFilterTile,
  TableWidget,
  TableWidgetProps,
  WidgetModel,
} from '@/index';
import { isTabularWidget } from '@/dashboard-widget/utils';

const LAYOUT_WIDTH = 1000.0;
const LAYOUT_MARGIN = 0;
const CELL_SPACING = 5;

const ReactGridLayout = WidthProvider(RGL);

export const Dashboard = ({ dashboardOid }: { dashboardOid: string }) => {
  const [layout, setLayout] = useState<Layout[]>([]);
  const [yearFilter, setYearFilter] = useState<Filter | null>(
    filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']),
  );
  const [countryFilter, setCountryFilter] = useState<Filter | null>(
    filterFactory.members(DM.Country.Country, []),
  );
  const [genderFilter, setGenderFilter] = useState<Filter | null>(
    filterFactory.members(DM.Commerce.Gender, ['Male', 'Female']),
  );

  const activeFilters = useMemo(() => {
    return [yearFilter, countryFilter, genderFilter] as Filter[];
  }, [yearFilter, countryFilter, genderFilter]);

  const { dashboard, isLoading, isError } = useGetDashboardModel({
    dashboardOid,
    includeWidgets: true,
  });
  const widgetLayout = useMemo(() => dashboard?.layout, [dashboard?.layout]);

  const anyUseWidgetsUseDM = useMemo(
    () => dashboard?.widgets?.some((w) => w.dataSource === DM.DataSource),
    [dashboard],
  );

  const filteredWidgets = useMemo(() => {
    if (dashboard && !isLoading && !isError) {
      return dashboard.widgets
        ?.filter((w: WidgetModel) => w.widgetType !== 'plugin')
        .map((w) => {
          const filterOptOut = {};
          const chartProps = isTabularWidget(w.widgetType)
            ? w.getTableWidgetProps()
            : w.getChartWidgetProps();
          // does not handle filter relations at this time
          return {
            oid: w.oid,
            widgetType: w.widgetType,
            chartProps: {
              ...chartProps,
              filters: getWidgetAndDashboardFilters(
                filterOptOut,
                chartProps.filters,
                w.dataSource === DM.DataSource ? activeFilters : [],
              ),
            },
          };
        });
    } else {
      return undefined;
    }
  }, [dashboard, isLoading, isError, activeFilters]);

  useEffect(() => {
    if (dashboard && !isLoading && !isError && dashboard?.layout) {
      const generateInitialLayout = generateDashboardLayout(
        dashboard?.layout,
        CELL_SPACING,
        LAYOUT_WIDTH,
      );
      setLayout(generateInitialLayout);
    }
  }, [dashboard, isError, isLoading, widgetLayout]);

  const renderGrid = useCallback(
    (
      isLoading: boolean,
      isError: boolean,
      layout: Layout[],
      filteredWidgets: any[] | undefined,
    ) => {
      if (isLoading) return <div>isLoading...</div>;
      if (isError) return <div>isError</div>;
      if (!filteredWidgets) return <div>No widgets</div>;
      if (layout.length < 1) return <div>Loading...</div>;
      return (
        <>
          <div style={{ display: 'flex' }}>
            <div style={{ flexGrow: 1 }}>
              <ReactGridLayout
                layout={layout || []}
                rowHeight={1}
                cols={LAYOUT_WIDTH}
                margin={[CELL_SPACING, LAYOUT_MARGIN]}
              >
                {filteredWidgets.map(
                  (w: {
                    oid: Key | null | undefined;
                    widgetType: string;
                    chartProps: ChartWidgetProps | TableWidgetProps;
                  }) => {
                    if (isTabularWidget(w.widgetType)) {
                      return (
                        <div className={'cell-card'} key={w.oid} style={cellStyle}>
                          <TableWidget key={w.oid} {...(w.chartProps as TableWidgetProps)} />
                        </div>
                      );
                    } else {
                      return (
                        <div className={'cell-card'} key={w.oid} style={cellStyle}>
                          <ChartWidget key={w.oid} {...(w.chartProps as ChartWidgetProps)} />
                        </div>
                      );
                    }
                  },
                )}
              </ReactGridLayout>
            </div>
            <div style={{ width: '200px' }}>
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
                  <MemberFilterTile
                    onChange={setGenderFilter}
                    title="Gender"
                    filter={genderFilter}
                    attribute={DM.Commerce.Gender}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      );
    },
    [anyUseWidgetsUseDM, countryFilter, genderFilter, yearFilter],
  );

  return (
    <div style={{ background: '#EEEEEE', width: '100%', height: '100%' }}>
      {renderGrid(isLoading, isError, layout, filteredWidgets)}
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
      {selectedDashboardOid && (
        <Dashboard key={selectedDashboardOid} dashboardOid={selectedDashboardOid} />
      )}
    </>
  );
};
