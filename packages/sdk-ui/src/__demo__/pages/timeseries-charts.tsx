import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as Ecom from '../sample-ecommerce-autogenerated.js';
import { useState } from 'react';
import { useExecuteQuery } from '../../query-execution/index.js';
import { Chart } from '../../chart';

export const TimeseriesCharts = () => {
  const { data, isLoading, isError } = useExecuteQuery({
    dataSource: Ecom.DataSource,
    dimensions: [Ecom.Commerce.Date.Months],
    measures: [measureFactory.sum(Ecom.Commerce.Revenue, 'Total Revenue')],
    filters: [
      filterFactory.measureLessThanOrEqual(measureFactory.sum(Ecom.Commerce.Revenue), 1000000),
    ],
  });

  const [continousTimeline, setContinousTimeline] = useState(true);
  const [connectNulls, setConnectNulls] = useState(false);
  const [treatNullsAsZeros, setTreatNullsAsZeros] = useState(false);

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data && (
        <div style={{ height: '100%' }}>
          <button
            style={{ margin: '15px' }}
            onClick={() => setContinousTimeline(!continousTimeline)}
          >
            Continous: {continousTimeline ? ' On' : 'Off'}
          </button>
          <button style={{ margin: '15px' }} onClick={() => setConnectNulls(!connectNulls)}>
            Connect Nulls: {connectNulls ? ' On' : 'Off'}
          </button>
          <button
            style={{ margin: '15px' }}
            onClick={() => setTreatNullsAsZeros(!treatNullsAsZeros)}
          >
            Treat Nulls As Zeros: {treatNullsAsZeros ? ' On' : 'Off'}
          </button>
          <Chart
            chartType="line"
            dataSet={data}
            dataOptions={{
              category: [
                {
                  column: { name: 'Months', type: 'datetime' },
                  dateFormat: 'yy-MMM',
                  continuous: continousTimeline,
                },
              ],
              value: [
                {
                  column: { name: 'Total Revenue' },
                  treatNullDataAsZeros: treatNullsAsZeros,
                  connectNulls: connectNulls,
                },
              ],
            }}
          />
        </div>
      )}
    </>
  );
};
