/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Alert, Tab, Tabs } from '@mui/material';
import { Box } from '@mui/system';
import { ComponentType, Suspense, useEffect, useState } from 'react';
import { SisenseContextProvider } from '../sisense-context/sisense-context-provider';
import { loadAdditionalPages } from './load-additional-pages';
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

// This page is meant to enable faster iterations during development than
// using react-ts-demo or other demo apps that require a built sdk-ui
// Simply add a page to the `pages` array and it will show up in `yarn dev`
// Suggest adding a router or at least sessionStorage var for selectedTabIndex
// if this becomes popular
const pages: ComponentType[] = [
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
  UseExecuteQueryDemo,
  ChartTypeSwitchingDemo,
  SelectionFilterDemo,
  ...loadAdditionalPages(),
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

const SELECTED_TAB_INDEX_KEY = 'selectedTabIndex';

export function App() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    Math.min(Number(sessionStorage.getItem(SELECTED_TAB_INDEX_KEY)) || 0, pages.length - 1),
  );

  const shouldShowAlert = !VITE_APP_SISENSE_URL;

  useEffect(() => {
    sessionStorage.setItem(SELECTED_TAB_INDEX_KEY, selectedTabIndex.toString());
  }, [selectedTabIndex]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {shouldShowAlert && (
        <Alert severity="warning">
          One or more expected env vars are missing. You may want to check your
          <code>.env.local</code> file.
        </Alert>
      )}
      <SisenseContextProvider {...sisenseContextProviderProps}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedTabIndex}
            onChange={(e, value: number) => setSelectedTabIndex(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {pages.map((page, i) => (
              <Tab key={i} label={page.name || `Page${i}`} sx={{ textTransform: 'none' }} />
            ))}
          </Tabs>
        </Box>
        {pages.map((Page, i) => (
          <div key={i} hidden={selectedTabIndex !== i}>
            {selectedTabIndex === i && (
              <Box sx={{ p: 3 }}>
                <Page />
              </Box>
            )}
          </div>
        ))}
      </SisenseContextProvider>
    </Suspense>
  );
}
