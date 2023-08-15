import { useMemo, useState } from 'react';
import { Chart, DateRangeFilterTile } from '@sisense/sdk-ui';
import * as DM from '../data-model/sample-ecommerce';
import { filters, Filter, measures } from '@sisense/sdk-data';
import type { CartesianChartDataOptions } from '@sisense/sdk-ui';

export const DateRangeFiltersPage = () => {
  const [dateRangeFilter, setDateRangeFilter] = useState<Filter>(
    filters.dateRange(DM.Commerce.Date.Years),
  );
  const dataOptions: CartesianChartDataOptions = useMemo(() => {
    return {
      category: [DM.Commerce.Date.Months],
      value: [measures.sum(DM.Commerce.Revenue)],
      breakBy: [DM.Commerce.AgeRange],
    };
  }, []);

  return (
    <>
      <h1>
        <b>{'Date range Filtering with ComposeSDK'}</b>
      </h1>
      <aside style={{ padding: '8px' }}>
        <DateRangeFilterTile
          title="Date Range"
          attribute={DM.Commerce.Date.Years}
          filter={dateRangeFilter}
          onChange={(filter: Filter) => {
            setDateRangeFilter(filter);
          }}
        />
      </aside>
      <main>
        <Chart
          chartType={'column'}
          dataSet={DM.DataSource}
          filters={[dateRangeFilter]}
          dataOptions={dataOptions}
        />
      </main>
    </>
  );
};