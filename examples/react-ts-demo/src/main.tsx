import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.scss';
import App from './App';
import { SisenseContextProvider } from '@sisense/sdk-ui';

const url = import.meta.env.VITE_APP_SISENSE_URL ?? 'http://10.50.78.113:30845/';
const username = (import.meta.env.VITE_APP_SISENSE_USERNAME as string) ?? 'admin@sisense.com';
const password = (import.meta.env.VITE_APP_SISENSE_PASSWORD as string) ?? 'sisense';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SisenseContextProvider
      url={url}
      username={username}
      password={password}
      defaultDataSource={'Sample ECommerce'}
    >
      <App />
    </SisenseContextProvider>
  </React.StrictMode>,
);
