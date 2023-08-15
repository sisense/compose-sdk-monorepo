import * as DM from '../data-model/sample-ecommerce';
import { Filter, measures } from '@sisense/sdk-data';
import { ChartWidget } from '@sisense/sdk-ui';
import { Container } from '../styles';

const filters: Filter[] = [];

const dataOptions = {
  category: [DM.Category.Category],
  value: [measures.sum(DM.Commerce.Revenue)],
  breakBy: [],
};

const dataOptions2 = {
  category: [DM.Commerce.Date.Months],
  value: [measures.sum(DM.Commerce.Revenue)],
  breakBy: [],
};

const drilldownOptions = {
  drilldownCategories: [DM.Commerce.AgeRange, DM.Commerce.Gender, DM.Commerce.Condition],
};

export const Page10 = () => {
  return (
    <>
      <h1>
        <b>Drill down demo</b> (right click or drag select chart data points)
      </h1>
      <Container padding={'20px'} justify={'center'} align={'baseline'}>
        <ChartWidget
          dataSource={DM.DataSource}
          chartType="column"
          filters={filters}
          dataOptions={dataOptions}
          drilldownOptions={drilldownOptions}
        />
      </Container>
      <Container padding={'20px'} justify={'center'} align={'baseline'}>
        <ChartWidget
          dataSource={DM.DataSource}
          chartType="line"
          filters={filters}
          dataOptions={dataOptions2}
          drilldownOptions={drilldownOptions}
        />
      </Container>
    </>
  );
};
