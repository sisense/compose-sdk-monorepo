/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import * as DM from '../data-model/sample-ecommerce';
import { Chart, ChartProps } from '@sisense/sdk-ui';
import { measures, filters } from '@sisense/sdk-data';
import { Container } from '../styles';

const MyChart = (props: Partial<ChartProps> & { title?: string }) => (
  <div
    style={{
      textAlign: 'center',
      border: '1px solid #eee',
      borderRadius: '3px',
      margin: '0 0 5px 5px',
    }}
  >
    <code title={props.filters?.map((x) => x.id).join()}>{props.title}</code>
    <div
      style={{
        width: 480,
        height: 400,
      }}
    >
      <Chart
        chartType={'column'}
        dataSet={DM.DataSource}
        filters={props.filters}
        dataOptions={{
          category: [DM.Commerce.Date.Years],
          value: [measures.sum(DM.Commerce.Revenue)],
          breakBy: [DM.Commerce.AgeRange],
        }}
        styleOptions={{}}
      />
    </div>
  </div>
);

export const Page9 = () => {
  return (
    <div>
      <h3>No filters</h3>
      <Container>
        <MyChart title="Yearly Total Revenue by AgeRange" />
      </Container>
      <h3>Date filters</h3>
      <Container>
        <MyChart
          title="dateFrom 2012"
          filters={[filters.dateFrom(DM.Commerce.Date.Years, '2012-01-01')]}
        />
        <MyChart
          title="dateTo 2011"
          filters={[filters.dateTo(DM.Commerce.Date.Years, '2011-01-01')]}
        />
        <MyChart
          title="dateRange 2010-2012"
          filters={[filters.dateRange(DM.Commerce.Date.Years, '2010-01-01', '2012-01-01')]}
        />
      </Container>
      <Container>
        <MyChart
          title="dateRelative 2012, offset 0, count 2"
          filters={[filters.dateRelative(DM.Commerce.Date.Years, 0, 2, '2012-01-01')]}
        />
        <MyChart
          title="dateRelativeFrom 2012, offset 0, count 2"
          filters={[filters.dateRelativeFrom(DM.Commerce.Date.Years, 0, 2, '2012-01-01')]}
        />
        <MyChart
          title="dateRelativeTo 2011, offset 0, count 2"
          filters={[filters.dateRelativeTo(DM.Commerce.Date.Years, 0, 2, '2011-01-01')]}
        />
      </Container>
      <h3>Text filters</h3>
      <Container>
        <MyChart
          title="AgeRange contains 5"
          filters={[filters.contains(DM.Commerce.AgeRange, '5')]}
        />
        <MyChart
          title="AgeRange doesntContain 5"
          filters={[filters.doesntContain(DM.Commerce.AgeRange, '5')]}
        />
        <MyChart
          title="AgeRange like %9-%"
          filters={[filters.like(DM.Commerce.AgeRange, '%9-%')]}
        />
      </Container>
      <Container>
        <MyChart
          title="AgeRange doesntStartWith 6"
          filters={[filters.doesntStartWith(DM.Commerce.AgeRange, '6')]}
        />
        <MyChart
          title="AgeRange doesntEqual 0-18"
          filters={[filters.doesntEqual(DM.Commerce.AgeRange, '0-18')]}
        />
        <MyChart
          title="AgeRange doesntEndWith 8"
          filters={[filters.doesntEndWith(DM.Commerce.AgeRange, '8')]}
        />
      </Container>
      <Container>
        <MyChart
          title="AgeRange equals 65+"
          filters={[filters.equals(DM.Commerce.AgeRange, '65+')]}
        />
        <MyChart
          title="AgeRange is 0-18, 55-64, 65+"
          filters={[filters.members(DM.Commerce.AgeRange, ['0-18', '55-64', '65+'])]}
        />
      </Container>
      <h3>Numeric filters</h3>
      <Container>
        <MyChart
          title="Revenue greaterThan 200000"
          filters={[filters.greaterThan(DM.Commerce.Revenue, 200000)]}
        />
        <MyChart
          title="Revenue lessThan 200000"
          filters={[filters.lessThan(DM.Commerce.Revenue, 200000)]}
        />
      </Container>
      <Container>
        <MyChart
          title="Revenue greaterThanOrEqual 200000"
          filters={[filters.greaterThanOrEqual(DM.Commerce.Revenue, 200000)]}
        />
        <MyChart
          title="Revenue lessThanOrEqual 200000"
          filters={[filters.lessThanOrEqual(DM.Commerce.Revenue, 200000)]}
        />
      </Container>
      <Container>
        <MyChart
          title="Revenue between 200000 and 2000000"
          filters={[filters.between(DM.Commerce.Revenue, 200000, 2000000)]}
        />
        <MyChart
          title="Revenue betweenNotEqual 200000 and 2000000"
          filters={[filters.betweenNotEqual(DM.Commerce.Revenue, 200000, 2000000)]}
        />
      </Container>
      <h3>Measure filters</h3>
      <Container>
        <MyChart
          title="Revenue measureGreaterThanOrEqual 200000"
          filters={[
            filters.measureGreaterThanOrEqual(
              measures.sum(DM.Commerce.Revenue),
              200000,
            ),
          ]}
        />
        <MyChart
          title="Revenue measureLessThanOrEqual 200000"
          filters={[
            filters.measureLessThanOrEqual(
              measures.sum(DM.Commerce.Revenue),
              200000,
            ),
          ]}
        />
      </Container>
      <Container>
        <MyChart
          title="Revenue measureBetween 200000 and 2000000"
          filters={[
            filters.measureBetween(
              measures.sum(DM.Commerce.Revenue),
              200000,
              2000000,
            ),
          ]}
        />
        <MyChart
          title="Revenue measureBetweenNotEqual 200000 and 2000000"
          filters={[
            filters.measureBetweenNotEqual(
              measures.sum(DM.Commerce.Revenue),
              200000,
              2000000,
            ),
          ]}
        />
      </Container>
      <h3>Rank filters</h3>
      <Container>
        <MyChart
          title="topRanking 3 AgeRange by Revenue sum"
          filters={[filters.topRanking(DM.Commerce.AgeRange, measures.sum(DM.Commerce.Revenue), 3)]}
        />

        <MyChart
          title="bottomRanking 3 AgeRange by Revenue sum"
          filters={[
            filters.bottomRanking(DM.Commerce.AgeRange, measures.sum(DM.Commerce.Revenue), 3),
          ]}
        />
      </Container>
      <h3>Logical filters</h3>
      <Container>
        <MyChart
          title="AgeRange contains 3 OR startsWith 4 OR endsWith 8"
          filters={[
            filters.union([
              filters.contains(DM.Commerce.AgeRange, '3'),
              filters.startsWith(DM.Commerce.AgeRange, '4'),
              filters.endsWith(DM.Commerce.AgeRange, '8'),
            ]),
          ]}
        />
        <MyChart
          title="AgeRange contains 5 AND endsWith 4"
          filters={[
            filters.intersection([
              filters.contains(DM.Commerce.AgeRange, '5'),
              filters.endsWith(DM.Commerce.AgeRange, '4'),
            ]),
          ]}
        />
        <MyChart
          title="AgeRange NOT contains 5"
          filters={[filters.exclude(filters.contains(DM.Commerce.AgeRange, '5'))]}
        />
      </Container>
    </div>
  );
};
