export const data = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Country', type: 'string' },
    { name: 'Group', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
  ],
  rows: [
    ['2009', 'USA', 'A', 6781, 10],
    ['2009', 'Ukraine', 'B', 5500, 15],
    ['2010', 'Egypt', 'A', 4471, 70],
    ['2011', 'Mexico', 'B', 1812, 50],
    ['2012', 'Uganda', 'B', 5001, 60],
    ['2013', 'Norway', 'A', 2045, 40],
    ['2014', 'Singapore', 'B', 3010, 90],
    ['2015', 'Moldova', 'A', 5447, 80],
    ['2016', 'Suriname', 'B', 4242, 70],
    ['2017', 'Oman', 'B', 936, 20],
  ],
};

export const attributes = {
  years: { name: 'Years', type: 'date' },
  country: { name: 'Country', type: 'string' },
  group: { name: 'Group', type: 'string' },
  quantity: { name: 'Quantity', type: 'number' },
  units: { name: 'Units', type: 'number' },
};

export const measures = {
  totalQuantity: { name: 'Quantity', aggregation: 'sum', title: 'Total Quantity' },
  totalUnits: { name: 'Units', aggregation: 'sum', title: 'Total Units' },
};
