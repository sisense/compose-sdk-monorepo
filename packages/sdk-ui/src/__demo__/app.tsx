import { Alert, Tab, Tabs } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { SisenseContextProvider } from '../components/SisenseContextProvider';
import { SisenseContextProviderProps } from '../props';
import { ChartsFromExampleApp } from './pages/ChartsFromExampleApp';
import { ECommerceDemo } from './pages/ECommerceDemo';
import { MiscDemo } from './pages/MiscDemo';
import { WidgetDemo } from './pages/WidgetDemo';

// This page is meant to enable faster iterations during development than
// using react-ts-demo or other demo apps that require a built sdk-ui
// Simply add a page to the `pages` array and it will show up in `yarn dev`
// Suggest adding a router or at least sessionStorage var for selectedTabIndex
// if this becomes popular
const pages = [WidgetDemo, ECommerceDemo, ChartsFromExampleApp, MiscDemo];

const { VITE_APP_SISENSE_URL, VITE_APP_SISENSE_USERNAME, VITE_APP_SISENSE_PASSWORD } = import.meta
  .env;

export function App() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const shouldShowAlert =
    !VITE_APP_SISENSE_URL || !VITE_APP_SISENSE_USERNAME || !VITE_APP_SISENSE_PASSWORD;

  const sisenseContextProps: SisenseContextProviderProps = {
    url: VITE_APP_SISENSE_URL ?? '',
    username: VITE_APP_SISENSE_USERNAME,
    password: VITE_APP_SISENSE_PASSWORD,
    defaultDataSource: 'Sample ECommerce',
  };

  return (
    <>
      {shouldShowAlert && (
        <Alert severity="warning">
          One or more expected env vars are missing. You may want to check your
          <code>.env.local</code> file.
        </Alert>
      )}
      <SisenseContextProvider {...sisenseContextProps}>
        <div style={{ width: '100vw', height: '100vh' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={selectedTabIndex}
              onChange={(e, value: number) => setSelectedTabIndex(value)}
            >
              {pages.map((page, i) => (
                <Tab key={i} label={page.name} sx={{ textTransform: 'none' }} />
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
        </div>
      </SisenseContextProvider>
    </>
  );
}
