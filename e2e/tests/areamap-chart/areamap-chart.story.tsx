import { Chart, SisenseContextProvider } from '@sisense/sdk-ui';
import * as DM from '../__mocks__/sample-ecommerce';

export const AreamapChartForCostPerCountry = ({
  sisenseUrl,
  sisenseToken,
}: {
  sisenseUrl: string;
  sisenseToken: string;
}) => {
  return (
    <SisenseContextProvider url={sisenseUrl} token={sisenseToken}>
      <Chart
        dataSet={DM.DataSource}
        chartType={'areamap'}
        dataOptions={{
          geo: [DM.Country.Country],
          color: [
            {
              column: DM.Measures.SumCost,
              title: 'Total Cost',
            },
          ],
        }}
      />
    </SisenseContextProvider>
  );
};
