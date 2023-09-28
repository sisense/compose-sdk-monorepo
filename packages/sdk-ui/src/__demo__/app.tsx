/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Alert, Tab, Tabs } from '@mui/material';
import { Box } from '@mui/system';
import { ComponentType, Suspense, useState } from 'react';
import { SisenseContextProvider } from '../components/sisense-context/sisense-context-provider';
import { loadAdditionalPages } from './load-additional-pages';
import { ChartsFromExampleApp } from './pages/charts-from-example-app';
import { ECommerceDemo } from './pages/ecommerce-demo';
import { MiscDemo } from './pages/misc-demo';
import { WidgetDemo } from './pages/widget-demo';
import { NumberFormating } from './pages/NumberFormating';
import { DrilldownWidgetDemo } from './pages/drilldown-widget-demo';

// This page is meant to enable faster iterations during development than
// using react-ts-demo or other demo apps that require a built sdk-ui
// Simply add a page to the `pages` array and it will show up in `yarn dev`
// Suggest adding a router or at least sessionStorage var for selectedTabIndex
// if this becomes popular
const pages: ComponentType[] = [
  WidgetDemo,
  NumberFormating,
  ECommerceDemo,
  ChartsFromExampleApp,
  MiscDemo,
  DrilldownWidgetDemo,
  ...loadAdditionalPages(),
];

const {
  VITE_APP_SISENSE_URL,
  VITE_APP_SISENSE_TOKEN,
  VITE_APP_SISENSE_WAT,
  VITE_APP_SISENSE_SSO_ENABLED,
} = import.meta.env;

const sisenseContextProviderProps = () => {
  const baseOptions = {
    url: VITE_APP_SISENSE_URL || '',
    defaultDataSource: 'Sample ECommerce',
  };
  const wat = VITE_APP_SISENSE_WAT;
  const token = VITE_APP_SISENSE_TOKEN;
  const ssoEnabled = VITE_APP_SISENSE_SSO_ENABLED;

  if (ssoEnabled) {
    return { ...baseOptions, ssoEnabled: ssoEnabled?.toLowercase() === 'true' };
  } else if (wat) {
    return { ...baseOptions, wat };
  } else if (token) {
    return { ...baseOptions, token };
  } else {
    return baseOptions;
  }
};

export function App() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const shouldShowAlert = !VITE_APP_SISENSE_URL;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {shouldShowAlert && (
        <Alert severity="warning">
          One or more expected env vars are missing. You may want to check your
          <code>.env.local</code> file.
        </Alert>
      )}
      <SisenseContextProvider {...sisenseContextProviderProps()}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedTabIndex}
            onChange={(e, value: number) => setSelectedTabIndex(value)}
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
