import Alert from '@mui/material/Alert';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/system/Box';
import { ComponentType, Suspense, useEffect, useState } from 'react';
import { SisenseContextProvider } from '../sisense-context/sisense-context-provider';
import { ChartsFromExampleApp } from './pages/charts-from-example-app';
import { ECommerceDemo } from './pages/ecommerce-demo';
import { MiscDemo } from './pages/misc-demo';
import { WidgetDemo } from './pages/widget-demo';
import { NumberFormatting } from './pages/number-formatting';
import { DrilldownWidgetDemo } from './pages/drilldown-widget-demo';
import { ChartFilterCycle } from './pages/chart-filter-cycle';
import { MuiDataGridDemo } from './pages/mui-data-grid-demo';
import { UseExecuteQueryDemo } from './pages/use-execute-query-demo';
import { ChartTypeSwitchingDemo } from './pages/chart-type-switching';
import { SelectionFilterDemo } from './pages/selection-highlight/selection-filter-demo';
import { TimeseriesCharts } from './pages/timeseries-charts';
import { CriteriaFilterDemo } from './pages/criteria-filter-demo';
import { UseGetWidgetModelDemo } from './pages/use-get-widget-model-demo';
import { PageCrossFiltering } from './pages/cross-filtering-page';
import { RelativeDateFilterDemo } from './pages/relative-date-filter-demo';
import { BoxplotChartDemo } from './pages/boxplot-chart-demo';
import { AreamapChartDemo } from './pages/areamap-demo';
import { ScattermapChartDemo } from './pages/scattermap-demo';
import { AiDemo } from './pages/ai-demo';
import { PivotQueryDemo } from './pages/pivot-query-demo';
import { ComboChartStylingDemo } from './pages/combo-chart-styling';
import { PivotTableDemo } from './pages/pivot-table-demo';
import { QueryCachingDemo } from './pages/query-caching-demo';
import { sisenseContextProviderProps } from './sisense-context-provider-props';
import { UseFetchDemo } from './pages/use-fetch-demo';
import { ChatToCodeDemo } from './pages/chat-to-code-demo';
import { RenderDashboardDemo } from './pages/render-dashboard-demo';
import { UseGetDashboardModelDemo } from './pages/use-get-dashboard-model-demo';
import { withCachingSwitcher } from './pages/helper-components/with-caching-switcher';
import { PieChartHighlightDemo } from './pages/selection-highlight/pie-chart-highlight-demo';
import { DashboardEditAndPluginDemo } from './pages/plugin-demo';

// This page is meant to enable faster iterations during development than
// using react-ts-demo or other demo apps that require a built sdk-ui
// Simply add a page to the `pages` array and it will show up in `yarn dev`
// Suggest adding a router or at least sessionStorage var for selectedTabIndex
// if this becomes popular
const pages: ComponentType[] = [
  withCachingSwitcher(RenderDashboardDemo),
  withCachingSwitcher(DashboardEditAndPluginDemo),
  PieChartHighlightDemo,
  PageCrossFiltering,
  SelectionFilterDemo,
  TimeseriesCharts,
  WidgetDemo,
  NumberFormatting,
  ECommerceDemo,
  ChartsFromExampleApp,
  MiscDemo,
  DrilldownWidgetDemo,
  MuiDataGridDemo,
  ChartFilterCycle,
  CriteriaFilterDemo,
  RelativeDateFilterDemo,
  UseExecuteQueryDemo,
  ChartTypeSwitchingDemo,
  SelectionFilterDemo,
  UseGetWidgetModelDemo,
  UseGetDashboardModelDemo,
  BoxplotChartDemo,
  ScattermapChartDemo,
  AreamapChartDemo,
  AiDemo,
  PivotQueryDemo,
  PivotTableDemo,
  QueryCachingDemo,
  ComboChartStylingDemo,
  ChatToCodeDemo,
  UseFetchDemo,
];

const { VITE_APP_SISENSE_URL } = import.meta.env;

const drawerWidth = 240;

function LeftNav({
  currentItem,
  onSelectItem,
}: {
  currentItem: number;
  onSelectItem: (index: number) => void;
}) {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <List>
        {pages.map((page, i) => (
          <ListItem key={i} disablePadding>
            <ListItemButton onClick={() => onSelectItem(i)} selected={currentItem === i}>
              <ListItemText primary={page.displayName || page.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

const SELECTED_PAGE_INDEX_KEY = 'selectedPageIndex';

export function App() {
  const [selectedPageIndex, setSelectedPageIndex] = useState(
    Math.min(Number(sessionStorage.getItem(SELECTED_PAGE_INDEX_KEY)) || 0, pages.length - 1),
  );

  const shouldShowAlert = !VITE_APP_SISENSE_URL;

  useEffect(() => {
    sessionStorage.setItem(SELECTED_PAGE_INDEX_KEY, selectedPageIndex.toString());
  }, [selectedPageIndex]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {shouldShowAlert && (
        <Alert severity="warning">
          One or more expected env vars are missing. You may want to check your
          <code>.env.local</code> file.
        </Alert>
      )}
      <SisenseContextProvider {...sisenseContextProviderProps}>
        <Box sx={{ display: 'flex', background: '#EEEEEE' }}>
          <LeftNav currentItem={selectedPageIndex} onSelectItem={setSelectedPageIndex} />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {pages.map((Page, i) => (
              <div key={i} hidden={selectedPageIndex !== i}>
                {selectedPageIndex === i && <Page />}
              </div>
            ))}
          </Box>
        </Box>
      </SisenseContextProvider>
    </Suspense>
  );
}
