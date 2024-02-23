import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
