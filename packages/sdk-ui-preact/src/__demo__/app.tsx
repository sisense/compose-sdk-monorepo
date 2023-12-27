/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { measureFactory } from '@sisense/sdk-data';
import { ExecuteQuery, SisenseContextProvider } from '@sisense/sdk-ui';
import { useState } from 'preact/hooks';
import './app.css';
import preactLogo from './assets/preact.svg';
import * as DM from './data-model/sample-ecommerce';
import viteLogo from '/vite.svg';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://preactjs.com" target="_blank">
          <img src={preactLogo} class="logo preact" alt="Preact logo" />
        </a>
      </div>
      <h1>Vite + Preact</h1>
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
      </div>
      <SisenseContextProvider
        url="http://"
        username=""
        password=""
        defaultDataSource={'Sample ECommerce'}
      />
      <ExecuteQuery
        dataSource={DM.DataSource}
        dimensions={[DM.Commerce.Date.Years]}
        measures={[measureFactory.sum(DM.Commerce.Cost)]}
        filters={[]}
      >
        {({ data }) => {
          if (!data || !data.rows[0] || !data.rows[0][1]) {
            return;
          }

          const cellText = data.rows[0][1].text ?? data.rows[0][1].data.toString().substring(0, 4);

          return <>{cellText}</>;
        }}
      </ExecuteQuery>
    </>
  );
}
