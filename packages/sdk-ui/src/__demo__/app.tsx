import { Alert, Tab, Tabs } from '@mui/material';
import { Box } from '@mui/system';
import { ComponentType, Suspense, useEffect, useState } from 'react';
import { SisenseContextProvider } from '../components/sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '../props';
import { loadAdditionalPages } from './load-additional-pages';
import { ChartsFromExampleApp } from './pages/charts-from-example-app';
import { ECommerceDemo } from './pages/ecommerce-demo';
import { MiscDemo } from './pages/misc-demo';
import { WidgetDemo } from './pages/widget-demo';

// This page is meant to enable faster iterations during development than
// using react-ts-demo or other demo apps that require a built sdk-ui
// Simply add a page to the `pages` array and it will show up in `yarn dev`
// Suggest adding a router or at least sessionStorage var for selectedTabIndex
// if this becomes popular
const pages: ComponentType[] = [
  WidgetDemo,
  ECommerceDemo,
  ChartsFromExampleApp,
  MiscDemo,
  ...loadAdditionalPages(),
];

const { VITE_APP_SISENSE_URL, VITE_APP_SISENSE_TOKEN } = import.meta.env;

const selectedTabIndexKey = 'selectedTabIndex';

export function App() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    Math.min(Number(sessionStorage.getItem(selectedTabIndexKey)) || 0, pages.length - 1),
  );

  const shouldShowAlert = !VITE_APP_SISENSE_URL || !VITE_APP_SISENSE_TOKEN;

  const sisenseContextProps: SisenseContextProviderProps = {
    url: VITE_APP_SISENSE_URL ?? '',
    token: VITE_APP_SISENSE_TOKEN,
    defaultDataSource: 'Sample ECommerce',
  };

  useEffect(() => {
    sessionStorage.setItem(selectedTabIndexKey, selectedTabIndex.toString());
  }, [selectedTabIndex]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {shouldShowAlert && (
        <Alert severity="warning">
          One or more expected env vars are missing. You may want to check your
          <code>.env.local</code> file.
        </Alert>
      )}
      <SisenseContextProvider {...sisenseContextProps}>
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
