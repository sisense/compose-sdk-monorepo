export const data = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
  ],
  rows: [
    ['2009', 'A', 6781, 10],
    ['2009', 'B', 5500, 15],
    ['2010', 'A', 4471, 70],
    ['2011', 'B', 1812, 50],
    ['2012', 'B', 5001, 60],
    ['2013', 'A', 2045, 40],
    ['2014', 'B', 3010, 90],
    ['2015', 'A', 5447, 80],
    ['2016', 'B', 4242, 70],
    ['2017', 'B', 936, 20],
  ],
};

export const attributes = {
  years: { name: 'Years', type: 'date' },
  group: { name: 'Group', type: 'string' },
  quantity: { name: 'Quantity', type: 'number' },
  units: { name: 'Units', type: 'number' },
};

export const measures = {
  totalQuantity: { name: 'Quantity', aggregation: 'sum', title: 'Total Quantity' },
  totalUnits: { name: 'Units', aggregation: 'sum', title: 'Total Units' },
};
