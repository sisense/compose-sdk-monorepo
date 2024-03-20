export const MOCK_QUERY_YAML = `# bar chart of total of revenue by condition

model: Sample ECommerce
metadata:
  - jaql:
      dim: "[Commerce.Condition]"
      title: Condition
  - jaql:
      dim: "[Commerce.Revenue]"
      agg: sum
      title: total of Revenue
  - jaql:
      title: Country
      dim: "[Country.Country]"
      filter:
        members:
          - Cambodia
          - United States
    panel: scope
  - jaql:
      title: Years
      dim: "[Commerce.Date (Calendar)]"
      level: years
      filter:
        members:
          - "2013-01-01T00:00:00"
    format:
      mask:
        years: yyyy
    panel: scope
  - jaql:
      title: Revenue
      dim: "[Commerce.Revenue]"
      filter:
        fromNotEqual: 1000
    panel: scope
chart:
  chartType: bar
  dataOptions:
    category:
      - name: Condition
    value:
      - name: total of Revenue`;

export const MOCK_CODE_REACT = `import { ChartWidget } from '@sisense/sdk-ui';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce'; // generated with @sisense/sdk-cli

export default function App() {
  return (
    <ChartWidget
      title={'bar chart of total of revenue by condition'}
      dataSource={DM.DataSource}
      chartType={'bar'}
      dataOptions={ {
    category: [
      DM.Commerce.Condition
    ],
    value: [
      measureFactory.sum(DM.Commerce.Revenue, 'total of Revenue')
    ],
    breakBy: [],
  } }
      filters={ [
    filterFactory.members(DM.Country.Country, ['Cambodia', 'United States']),
    filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']),
    filterFactory.greaterThan(DM.Commerce.Revenue, 1000)
    ] }
    />
  );
}`;

export const MOCK_DATA_SOURCE_FIELDS = [
  {
    id: '[Brand.Brand]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Brand',
    table: 'Brand',
    column: 'Brand',
    merged: false,
    indexed: true,
  },
  {
    id: '[Brand.Brand ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Brand ID',
    table: 'Brand',
    column: 'Brand ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[Category.Category]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Category',
    table: 'Category',
    column: 'Category',
    merged: false,
    indexed: true,
  },
  {
    id: '[Category.Category ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Category ID',
    table: 'Category',
    column: 'Category ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[Commerce.Age Range]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Age Range',
    table: 'Commerce',
    column: 'Age Range',
    merged: false,
    indexed: true,
  },
  {
    id: '[Commerce.Brand ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Brand ID',
    table: 'Commerce',
    column: 'Brand ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[Commerce.Category ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Category ID',
    table: 'Commerce',
    column: 'Category ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[Commerce.Condition]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Condition',
    table: 'Commerce',
    column: 'Condition',
    merged: false,
    indexed: true,
  },
  {
    id: '[Commerce.Cost]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Cost',
    table: 'Commerce',
    column: 'Cost',
    merged: false,
    indexed: false,
  },
  {
    id: '[Commerce.Country ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Country ID',
    table: 'Commerce',
    column: 'Country ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[Commerce.Date (Calendar)]',
    type: 'dimension',
    dimtype: 'datetime',
    title: 'Date',
    table: 'Commerce',
    column: 'Date',
    merged: false,
    indexed: true,
  },
  {
    id: '[Commerce.Gender]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Gender',
    table: 'Commerce',
    column: 'Gender',
    merged: false,
    indexed: true,
  },
  {
    id: '[Commerce.Quantity]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Quantity',
    table: 'Commerce',
    column: 'Quantity',
    merged: false,
    indexed: false,
  },
  {
    id: '[Commerce.Revenue]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Revenue',
    table: 'Commerce',
    column: 'Revenue',
    merged: false,
    indexed: false,
  },
  {
    id: '[Commerce.Visit ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Visit ID',
    table: 'Commerce',
    column: 'Visit ID',
    merged: false,
    indexed: false,
  },
  {
    id: '[Country.Country]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Country',
    table: 'Country',
    column: 'Country',
    merged: true,
    indexed: true,
  },
  {
    id: '[Country.Country ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Country ID',
    table: 'Country',
    column: 'Country ID',
    merged: true,
    indexed: false,
  },
  {
    id: '[CountryPopulation.Continent]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Continent',
    table: 'CountryPopulation',
    column: 'Continent',
    merged: false,
    indexed: true,
  },
  {
    id: '[CountryPopulation.Country Code]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Country Code',
    table: 'CountryPopulation',
    column: 'Country Code',
    merged: false,
    indexed: true,
  },
  {
    id: '[CountryPopulation.Country Name]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Country Name',
    table: 'CountryPopulation',
    column: 'Country Name',
    merged: true,
    indexed: true,
  },
  {
    id: '[CountryPopulation.Population]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Population',
    table: 'CountryPopulation',
    column: 'Population',
    merged: false,
    indexed: false,
  },
];
