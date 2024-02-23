import { Alert, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Box } from '@mui/system';
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

// This page is meant to enable faster iterations during development than
// using react-ts-demo or other demo apps that require a built sdk-ui
// Simply add a page to the `pages` array and it will show up in `yarn dev`
// Suggest adding a router or at least sessionStorage var for selectedTabIndex
// if this becomes popular
const pages: ComponentType[] = [
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
  BoxplotChartDemo,
  ScattermapChartDemo,
  AreamapChartDemo,
  AiDemo,
  PivotQueryDemo,
  ComboChartStylingDemo,
  PivotTableDemo,
];

const {
  VITE_APP_SISENSE_URL,
  VITE_APP_SISENSE_TOKEN,
  VITE_APP_SISENSE_WAT,
  VITE_APP_SISENSE_SSO_ENABLED,
} = import.meta.env;

const sisenseContextProviderProps = (() => {
  const baseOptions = {
    url: VITE_APP_SISENSE_URL || '',
    defaultDataSource: 'Sample ECommerce',
  };
  const wat = VITE_APP_SISENSE_WAT;
  const token = VITE_APP_SISENSE_TOKEN;
  const ssoEnabled = VITE_APP_SISENSE_SSO_ENABLED;

  if (ssoEnabled && ssoEnabled?.toLowerCase() === 'true') {
    return { ...baseOptions, ssoEnabled: true };
  } else if (wat) {
    return { ...baseOptions, wat };
  } else if (token) {
    return { ...baseOptions, token };
  } else {
    return baseOptions;
  }
})();

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
              <ListItemText primary={page.name} />
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
        <Box sx={{ display: 'flex' }}>
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
