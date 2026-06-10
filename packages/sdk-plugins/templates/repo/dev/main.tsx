import './index.css';
import plugin from '@plugin';
import { devPreviewProps } from '@plugin/dev-preview-props.js';
import { DevApp } from '@sisense/sdk-plugins-dev';
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DevApp
      url={import.meta.env.VITE_APP_SISENSE_URL}
      token={import.meta.env.VITE_APP_SISENSE_TOKEN}
      plugin={plugin}
      devPreviewProps={devPreviewProps}
    />
  </React.StrictMode>
);
