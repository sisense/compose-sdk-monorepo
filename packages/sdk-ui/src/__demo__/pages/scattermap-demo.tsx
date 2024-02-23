import * as DM from '../sample-ecommerce.js';
import { measureFactory } from '@sisense/sdk-data';
import { ExecuteQuery } from '../../query-execution/index.js';
import { ScattermapChartDataOptions } from '../../chart-data-options/types.js';
import { ScattermapStyleOptions } from '../../types.js';
import { ScattermapChart } from '../../scattermap-chart.js';

const dataOptions: ScattermapChartDataOptions = {
  geo: [{ column: DM.Country.Country, geoLevel: 'city' }],
  size: measureFactory.sum(DM.Commerce.Cost, 'Size by Cost'),
  colorBy: {
    column: measureFactory.sum(DM.Commerce.Revenue, 'Color by Revenue'),
    color: 'green',
  },
  details: DM.Category.Category,
};

const styleOptions: ScattermapStyleOptions = {
  markers: {
    fill: 'hollow-bold',
  },
};

export const ScattermapChartDemo: React.FC = () => {
  return (
    <>
      <h2>Scattermap Chart</h2>
      <ScattermapChart
        dataSet={DM.DataSource}
        dataOptions={dataOptions}
        styleOptions={styleOptions}
        onDataPointClick={(point, event) => console.log({ point, event })}
      />
      <h2>Scattermap Chart with custom data (loaded via ExecuteQuery)</h2>
      <ExecuteQuery
        dataSource={DM.DataSource}
        dimensions={[DM.Country.Country]}
        measures={[
          measureFactory.sum(DM.Commerce.Cost, 'Size by Cost'),
          measureFactory.sum(DM.Commerce.Revenue, 'Color by Revenue'),
          measureFactory.sum(DM.Commerce.Quantity, 'Details by Quantity'),
        ]}
      >
        {({ data }) =>
          data && (
            <ScattermapChart
              dataSet={data}
              dataOptions={{
                ...dataOptions,
                details: measureFactory.sum(DM.Commerce.Quantity, 'Details by Quantity'),
              }}
              styleOptions={styleOptions}
            />
          )
        }
      </ExecuteQuery>
    </>
  );
};
