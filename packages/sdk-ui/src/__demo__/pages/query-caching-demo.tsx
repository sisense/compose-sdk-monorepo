import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import * as DM from '../sample-ecommerce';
import { measureFactory } from '@sisense/sdk-data';
import {
  useExecuteQuery,
  useQueryCache,
  Table,
  LineChart,
  AreaChart,
  ColumnChart,
  BarChart,
  ExecuteQuery,
  PieChart,
  SisenseContextProvider,
} from '@/index';
import { sisenseContextProviderProps } from '../sisense-context-provider-props';

export function QueryCachingDemo() {
  const [shouldBeMounted, setShouldBeMounted] = useState(true);
  return (
    <div>
      <SisenseContextProvider
        {...{
          ...sisenseContextProviderProps,
          appConfig: {
            ...sisenseContextProviderProps.appConfig,
            queryCacheConfig: { enabled: true },
          },
        }}
      >
        <h1>Query Caching Demo</h1>
        <p>
          This demo shows how the query caching mechanism works. When you mount the component, it
          fetches the data from the server. When you unmount the component and mount it again, the
          data is fetched from the cache.
        </p>

        <div>
          <Button onClick={() => setShouldBeMounted(true)}>Mount</Button>
          <Button onClick={() => setShouldBeMounted(false)}>Unmount</Button>
        </div>
        {shouldBeMounted && (
          <div>
            <ChartsWithIdenticalData />
            <TableBuiltOnExecuteQueryHook />
            <ExecuteQueryComponent />
            <ClearQueryCacheButton />
          </div>
        )}
      </SisenseContextProvider>
    </div>
  );
}

function ChartsWithIdenticalData() {
  return (
    <Paper sx={{ padding: '1em', marginTop: '1em' }}>
      <p>
        All the charts are using the same query options, so only one query is executed and the data
        is shared between all the Charts.
      </p>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <LineChart
            dataOptions={{
              category: [DM.Commerce.Date.Years],
              value: [measureFactory.sum(DM.Commerce.Revenue)],
              breakBy: [DM.Commerce.AgeRange],
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <AreaChart
            dataOptions={{
              category: [DM.Commerce.Date.Years],
              value: [measureFactory.sum(DM.Commerce.Revenue)],
              breakBy: [DM.Commerce.AgeRange],
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <ColumnChart
            dataOptions={{
              category: [DM.Commerce.Date.Years],
              value: [measureFactory.sum(DM.Commerce.Revenue)],
              breakBy: [DM.Commerce.AgeRange],
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <BarChart
            dataOptions={{
              category: [DM.Commerce.Date.Years],
              value: [measureFactory.sum(DM.Commerce.Revenue)],
              breakBy: [DM.Commerce.AgeRange],
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

function TableBuiltOnExecuteQueryHook() {
  const { data, refetch } = useExecuteQuery({
    dataSource: DM.DataSource,
    dimensions: [DM.Commerce.AgeRange],
    measures: [measureFactory.sum(DM.Commerce.Revenue)],
  });
  return (
    <Paper sx={{ padding: '1em', marginTop: '1em' }}>
      <p>This table is built on `useExecuteQuery` hook. </p>
      <p>
        When you click the "Refetch" button, the JAQL query is executed again and the data for table
        is updated in cache.
      </p>
      {data && (
        <Card variant="outlined" sx={{ width: 300, height: 300 }}>
          <Table
            dataSet={data}
            dataOptions={{
              columns: data.columns,
            }}
          />
        </Card>
      )}
      <Button onClick={() => refetch()}>Refetch</Button>
    </Paper>
  );
}

function ExecuteQueryComponent() {
  return (
    <Paper sx={{ padding: '1em', marginTop: '1em' }}>
      <p>ExecuteQuery component + Chart</p>
      <p>
        When you click the "Refetch" button, the JAQL query is executed again and the data for table
        is updated in cache.
      </p>
      <ExecuteQuery
        dataSource={DM.DataSource}
        dimensions={[DM.Commerce.AgeRange]}
        measures={[measureFactory.sum(DM.Commerce.Revenue)]}
      >
        {({ data, isLoading, isError, refetch }) => {
          if (isLoading) {
            return <div>Loading...</div>;
          }
          if (isError) {
            return <div>Error</div>;
          }
          if (data) {
            return (
              <div>
                <PieChart
                  dataSet={data}
                  dataOptions={{
                    category: [DM.Commerce.AgeRange],
                    value: [measureFactory.sum(DM.Commerce.Revenue)],
                  }}
                />
                <Button onClick={() => refetch()}>Refetch</Button>
              </div>
            );
          }
          return null;
        }}
      </ExecuteQuery>
    </Paper>
  );
}

function ClearQueryCacheButton() {
  const queryCache = useQueryCache();
  return queryCache ? (
    <Paper sx={{ padding: '1em', marginTop: '1em' }}>
      <p>
        You can clear all cache by using <code>useQueryCache()</code> hook and{' '}
        <code>queryCache.clear()</code>
      </p>
      <Button
        onClick={() => {
          queryCache.clear();
        }}
      >
        Clear Query Cache
      </Button>
    </Paper>
  ) : null;
}
