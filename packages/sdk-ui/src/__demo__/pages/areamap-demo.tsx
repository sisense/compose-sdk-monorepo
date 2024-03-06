import { measureFactory } from '@sisense/sdk-data';
import { useState } from 'react';
import { Chart } from '../../chart';
import { AreamapChart, AreamapDataPoint, ExecuteQuery } from '../../index.js';
import * as DM from '../sample-ecommerce.js';

export const AreamapChartDemo = () => {
  const [renderCount, setRenderCount] = useState(0);
  return (
    <div>
      <h2>Areamap Chart (countries) </h2>
      <Chart
        dataSet={DM.DataSource}
        chartType={'areamap'}
        dataOptions={{
          geo: [DM.Country.Country],
          color: [
            {
              column: measureFactory.sum(DM.Commerce.Cost),
              title: 'Total Cost',
            },
          ],
        }}
        onDataPointClick={(dataPoint: AreamapDataPoint) => {
          console.log("Chart 'areamap' dataPoint clicked:", dataPoint);
        }}
        styleOptions={{
          mapType: 'world',
        }}
      />
      <h2>Areamap Chart (states) </h2>
      <AreamapChart
        dataSet={DM.DataSource}
        dataOptions={{
          geo: [DM.Country.Country],
          color: [
            {
              column: measureFactory.sum(DM.Commerce.Cost),
              title: 'Total Cost',
            },
          ],
        }}
        styleOptions={{
          mapType: 'usa',
          width: 500,
          height: 500,
        }}
        onDataPointClick={(dataPoint) => {
          console.log('AreamapChart dataPoint clicked:', dataPoint);
        }}
      />
      <h2>Areamap Chart with custom data (loaded via ExecuteQuery)</h2>
      <ExecuteQuery
        dataSource={DM.DataSource}
        dimensions={[DM.Country.Country]}
        measures={[measureFactory.sum(DM.Commerce.Cost)]}
      >
        {({ data }) =>
          data && (
            <Chart
              dataSet={data}
              chartType={'areamap'}
              dataOptions={{
                geo: [DM.Country.Country],
                color: [
                  {
                    column: measureFactory.sum(DM.Commerce.Cost),
                    title: 'Total Cost',
                  },
                ],
              }}
              styleOptions={{ mapType: 'world' }}
            />
          )
        }
      </ExecuteQuery>
      <button onClick={() => setRenderCount(renderCount + 1)}>Re-render</button>
    </div>
  );
};
