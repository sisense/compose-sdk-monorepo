export const exampleData = {
  data: {
    columns: [
      { name: 'Years', type: 'date' },
      { name: 'Group', type: 'string' },
      { name: 'Quantity', type: 'number' },
      { name: 'Units', type: 'number' },
      { name: 'Returns', type: 'number' },
    ],
    rows: [
      ['2009', 'A', 6781, 1000, 558],
      ['2009', 'B', 5500, 1500, 440],
      ['2010', 'A', 4471, 7000, 557],
      ['2011', 'B', 1812, 5000, 151],
      ['2012', 'B', 5001, 6000, 440],
      ['2013', 'A', 2045, 4000, 304],
      ['2014', 'B', 3010, 9000, 341],
      ['2015', 'A', 5447, 8000, 444],
      ['2016', 'B', 4242, 7000, 384],
      ['2017', 'B', 936, 2000, 73],
    ],
  },
  years: {
    name: 'Years',
    type: 'date',
  },
  group: {
    name: 'Group',
    type: 'string',
  },
  quantity: {
    name: 'Quantity',
    aggregation: 'sum',
  },
  units: {
    name: 'Units',
    aggregation: 'sum',
  },
  returns: {
    name: 'Returns',
    aggregation: 'sum',
  },
};
