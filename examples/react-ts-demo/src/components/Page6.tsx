import { measures } from '@sisense/sdk-data';
import { Chart, ExecuteQuery } from '@sisense/sdk-ui';
import * as DM from '../data-model/sample-ecommerce';
import { Container } from '../styles';

export const Page6 = () => {
  const measure = measures.sum(DM.Commerce.Revenue);
  return (
    <Container direction="column">
      <b>
        <h1>
          <br />
          {'ExecuteQuery result that feeds into 2 charts'}
        </h1>
      </b>
      <ExecuteQuery
        dimensions={[DM.Commerce.Date.Years, DM.Commerce.AgeRange]}
        measures={[measure]}
        filters={[]}
      >
        {(data) => {
          if (data && data.rows) {
            return (
              <>
                <Chart
                  chartType="column"
                  dataSet={data}
                  dataOptions={{
                    category: [DM.Commerce.AgeRange],
                    value: [measure],
                    breakBy: [DM.Commerce.Date.Years],
                  }}
                  styleOptions={{
                    xAxis: {
                      title: {
                        enabled: true,
                        text: 'Age Range',
                      },
                    },
                    yAxis: {
                      title: {
                        enabled: true,
                        text: 'Revenue',
                      },
                    },
                  }}
                />

                <Chart
                  chartType="column"
                  dataSet={data}
                  dataOptions={{
                    category: [DM.Commerce.Date.Years],
                    value: [measure],
                    breakBy: [DM.Commerce.AgeRange],
                  }}
                  styleOptions={{
                    xAxis: {
                      title: {
                        enabled: true,
                        text: 'Date (Years)',
                      },
                    },
                    yAxis: {
                      title: {
                        enabled: true,
                        text: 'Revenue',
                      },
                    },
                  }}
                />
              </>
            );
          }
        }}
      </ExecuteQuery>
    </Container>
  );
};
