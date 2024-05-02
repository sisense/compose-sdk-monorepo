import { useState, useMemo, useEffect, Key, useCallback, ChangeEvent } from 'react';
import RGL, { WidthProvider, Layout } from 'react-grid-layout';
import '../../../../../node_modules/react-grid-layout/css/styles.css';
import {
  generateDashboardLayout,
  cellStyle,
  getWidgetAndDashboardFilters,
} from './compose-sdk-layout-utils';
import { Layout as ColumnLayout } from '@/models';

import * as DM from '../sample-ecommerce.js';

import { Filter, filterFactory } from '@sisense/sdk-data';

import { useGetDashboardModel, useGetDashboardModels } from '@/models/dashboard';
import {
  ChartWidget,
  ChartWidgetProps,
  MemberFilterTile,
  WidgetModel,
  useThemeContext,
} from '@/index';
import { histogramPlugin } from './histogram-plugin';
import { WidgetHeader } from '@/widgets/common/widget-header';
import { PencilIcon } from '@/filters/components/icons';
import { LineDesignPanel } from './design-panels/examples/line-design-panel';
import Button from '@mui/material/Button';

const LAYOUT_WIDTH = 1000.0;
const LAYOUT_MARGIN = 0;
const CELL_SPACING = 5;

const ReactGridLayout = WidthProvider(RGL);

type FilteredPlugin = {
  oid: Key | null | undefined;
  pluginType: string;
  chartPluginProps: any;
  title?: string;
  description?: string;
  dataSource?: string;
};

type WidgetPlugin = {
  pluginType: string;
  Plugin: any;
  createChartProps: any;
};

const PluginService: { [key: string]: WidgetPlugin } = {
  histogramwidget: histogramPlugin,
  composeSdkHistogram: histogramPlugin,
};

const Dashboard = ({ dashboardOid }: { dashboardOid: string }) => {
  const { themeSettings } = useThemeContext();

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

  const { dashboard, isLoading, isError } = useGetDashboardModel({
    dashboardOid: dashboardOid,
    includeWidgets: true,
  });

  const anyUseWidgetsUseDM = useMemo(
    () => dashboard?.widgets?.some((w) => w.dataSource === DM.DataSource),
    [dashboard],
  );

  const activeFilters = useMemo(() => {
    return anyUseWidgetsUseDM ? ([yearFilter, countryFilter, genderFilter] as Filter[]) : [];
  }, [yearFilter, countryFilter, genderFilter, anyUseWidgetsUseDM]);

  const widgetLayout = useMemo(() => dashboard?.layout || {}, [dashboard?.layout]);

  const filteredWidgets = useMemo(() => {
    if (dashboard && !isLoading && !isError) {
      return dashboard.widgets
        ?.filter((w: WidgetModel) => w.widgetType !== 'plugin')
        .map((w) => {
          //TODO handle filter opt out
          const filterOptOut = {};
          const chartProps = w.getChartWidgetProps();
          // does not handle filter relations at this time
          return {
            oid: w.oid,
            chartWidgetProps: {
              ...chartProps,
              filters: getWidgetAndDashboardFilters(
                filterOptOut,
                chartProps.filters,
                activeFilters,
              ),
            },
          };
        });
    } else {
      return undefined;
    }
  }, [dashboard, isLoading, isError, activeFilters]);

  const filteredPlugins = useMemo(() => {
    if (dashboard && !isLoading && !isError) {
      return dashboard.widgets
        ?.filter((w: WidgetModel) => w.widgetType === 'plugin')
        .map((w) => {
          const plugin = PluginService[w.pluginType];
          if (!plugin) {
            console.error(`Unknown plugin type: ${w.pluginType}`);
            return {
              oid: w.oid,
              pluginType: 'w.pluginType',
              chartPluginProps: undefined,
            };
          }
          const filterOptOut = {};
          const filters = getWidgetAndDashboardFilters(filterOptOut, w.filters, activeFilters);
          return {
            oid: w.oid,
            pluginType: w.pluginType,
            title: w.title,
            chartPluginProps: plugin.createChartProps(
              w,
              themeSettings.palette.variantColors,
              filters,
            ),
          };
        });
    } else {
      return [];
    }
  }, [dashboard, isLoading, isError, themeSettings.palette.variantColors, activeFilters]);

  useEffect(() => {
    if (dashboard && !isLoading && !isError) {
      const generateInitialLayout = generateDashboardLayout(
        widgetLayout as ColumnLayout,
        CELL_SPACING,
        LAYOUT_WIDTH,
      );
      setLayout(generateInitialLayout);
    }
  }, [dashboard, isError, isLoading, widgetLayout]);
  const [editingWidget, setEditingWidget] = useState<any | null>(null);

  const renderGrid = (
    isLoading: boolean,
    isError: boolean,
    layout: Layout[],
    filteredWidgets: any[] | undefined,
  ) => {
    if (isLoading) return <div>isLoading...</div>;
    if (isError) return <div>isError</div>;
    if (!filteredWidgets) return <div>No widgets</div>;
    if (!(layout.length > 0)) return <div>Loading...</div>;
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
                  chartWidgetProps: JSX.IntrinsicAttributes & ChartWidgetProps;
                }) => {
                  const isLineChart = w.chartWidgetProps.chartType === 'line';
                  return (
                    <div
                      className={'cell-card'}
                      key={w.oid}
                      style={{
                        ...cellStyle,
                        border: editingWidget?.oid === w.oid ? '1px solid green' : undefined,
                      }}
                    >
                      {!editingWidget && isLineChart && (
                        <div
                          style={{ position: 'absolute', top: 0, right: '50px' }}
                          onClick={() => setEditingWidget(w)}
                        >
                          <PencilIcon />
                        </div>
                      )}

                      <ChartWidget key={w.oid} {...w.chartWidgetProps} />
                    </div>
                  );
                },
              )}
              {(filteredPlugins || []).map((w: FilteredPlugin) => {
                const plugin = PluginService[w.pluginType];
                if (plugin) {
                  return (
                    <div className={'cell-card'} key={w.oid} style={cellStyle}>
                      <WidgetHeader
                        key={`header-${w.oid}`}
                        title={w.title}
                        description={w.description}
                        dataSetName={w.dataSource}
                        onRefresh={() => console.log('DEBUG refesh')}
                      />
                      <div key={`chart-${w.oid}`} style={{ marginBottom: '50px' }}>
                        <plugin.Plugin key={`plugin-${w.oid}`} {...w.chartPluginProps} />
                      </div>
                    </div>
                  );
                } else {
                  return <div>Unknown plugin</div>;
                }
              })}
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
        {editingWidget && (
          <div
            style={{
              zIndex: 9999,
              position: 'absolute',
              background: 'rgb(255, 203, 5)',
              top: '10px',
              right: '0px',
            }}
          >
            <Button
              style={{ color: 'rgb(58, 67, 86)', borderColor: 'gray' }}
              variant={'outlined'}
              size={'small'}
              fullWidth
              onClick={() => {
                setEditingWidget(null);
              }}
            >
              Close
            </Button>
            <LineDesignPanel
              dataOptions={editingWidget.chartWidgetProps.dataOptions}
              styleOptions={editingWidget.chartWidgetProps.styleOptions}
              onChange={(name: string, value: any) => {
                editingWidget.chartWidgetProps.styleOptions[name] = value;
                console.log('DEBUG editingWidget', editingWidget);
                setEditingWidget({ ...editingWidget });
              }}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div style={{ background: '#EEEEEE', width: '100%', height: '100%' }}>
      {renderGrid(isLoading, isError, layout, filteredWidgets)}
    </div>
  );
};

export const DashboardEditAndPluginDemo = () => {
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
