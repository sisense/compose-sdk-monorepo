import { CategoricalChartDataOptionsInternal, ChartDataOptions, Value } from './types';
import {
  generateUniqueDataColumnsNames,
  DataColumnNamesMapping,
  applyDefaultChartDataOptions,
  validateDataOptionsAgainstData,
  validateDataOptions,
} from './validate_data_options';
import { Attribute, Filter, Measure } from '@sisense/sdk-data';

describe('generateUniqueDataColumnsNames', () => {
  it('should generate unique names and return the mapping', () => {
    const values = [{ name: 'Revenue' }, { name: 'Expenses' }, { name: 'Profit' }] as Value[];
    const expected: DataColumnNamesMapping = {
      $measure0_Revenue: 'Revenue',
      $measure1_Expenses: 'Expenses',
      $measure2_Profit: 'Profit',
    };
    const result = generateUniqueDataColumnsNames(values);
    expect(result).toEqual(expected);
  });

  it('should modify the values names with unique names', () => {
    const values = [{ name: 'Sales' }, { name: 'Cost' }] as Value[];
    const expected = [{ name: '$measure0_Sales' }, { name: '$measure1_Cost' }];
    generateUniqueDataColumnsNames(values);
    expect(values).toEqual(expected);
  });
});

describe('applyDefaultChartDataOptions', () => {
  const baseDataOptions = {
    y: [
      {
        name: 'Unique Users',
        title: 'Unique Users',
        aggregation: 'sum',
      },
    ],
    breakBy: [
      {
        name: 'Stage',
        type: 'string',
      },
    ],
  };

  const dataOptions1: CategoricalChartDataOptionsInternal = {
    ...baseDataOptions,
    y: [
      {
        name: 'Unique Users',
        title: 'Unique Users',
        aggregation: 'sum',
        sortType: 'sortDesc',
      },
    ],
  };

  const dataOptions2: CategoricalChartDataOptionsInternal = {
    ...baseDataOptions,
    breakBy: [
      {
        name: 'Stage',
        type: 'string',
        sortType: 'sortAsc',
      },
    ],
  };

  it('should apply descending sort to the value if no sort is specified', () => {
    expect(applyDefaultChartDataOptions(baseDataOptions, 'funnel')).toStrictEqual(dataOptions1);
  });

  it('should not apply descending sort to the value if sort is already specified on y', () => {
    expect(applyDefaultChartDataOptions(dataOptions1, 'funnel')).toStrictEqual(dataOptions1);
  });

  it('should not apply descending sort to the value if sort is already specified on breakBy', () => {
    expect(applyDefaultChartDataOptions(dataOptions2, 'funnel')).toStrictEqual(dataOptions2);
  });
});

describe('validateDataOptionsAgainstData', () => {
  const attributes = [
    {
      name: 'Years',
      type: 'date',
    } as Attribute,
  ];

  const measures = [
    {
      title: 'Total Quantity',
      enabled: true,
      name: '$measure0_Quantity',
      aggregation: 'sum',
    } as unknown as Measure,
  ];

  const dataColumnNamesMapping = {
    $measure0_Quantity: 'Quantity',
  };

  const filters: Filter[] = [];

  const highlights: Filter[] = [];

  const data = {
    columns: [
      { name: 'Years', type: 'date' },
      { name: 'Group', type: 'string' },
      { name: 'Quantity', type: 'number' },
      { name: 'Units', type: 'number' },
    ],
    rows: [],
  };

  it('should be true with valid dataOptions', () => {
    expect(
      validateDataOptionsAgainstData(
        data,
        attributes,
        measures,
        dataColumnNamesMapping,
        filters,
        highlights,
      ),
    ).toBe(true);
  });

  it('should throw with no attributes and measures', () => {
    expect(() => validateDataOptionsAgainstData(data, [], [], {}, filters, highlights)).toThrow();
  });

  it('should throw with non-existent attributes', () => {
    const nonExistentAttributes = [
      {
        name: 'Years1',
        type: 'date',
      } as Attribute,
    ];
    expect(() =>
      validateDataOptionsAgainstData(
        data,
        nonExistentAttributes,
        measures,
        dataColumnNamesMapping,
        filters,
        highlights,
      ),
    ).toThrow();
  });

  it('should throw with non-existent measures', () => {
    const nonExistentMeasures = [
      {
        title: 'Total Quantity',
        enabled: true,
        name: '$measure0_Quantity1',
        aggregation: 'sum',
      } as unknown as Measure,
    ];

    expect(() =>
      validateDataOptionsAgainstData(
        data,
        attributes,
        nonExistentMeasures,
        dataColumnNamesMapping,
        filters,
        highlights,
      ),
    ).toThrow();
  });
});

describe('isDataOptionsValid', () => {
  it('should truly validate correct categorical chart dataOptions', () => {
    const validDataOptions = {
      category: [],
      value: [{ name: 'Revenue' }],
    } as ChartDataOptions;

    it('should truly validate correct pie chart dataOptions', () => {
      let errorThrownForPie = false;
      try {
        validateDataOptions('pie', validDataOptions);
      } catch (e) {
        errorThrownForPie = true;
      }
      expect(errorThrownForPie).toBeFalsy();
    });

    it('should truly validate correct funnel chart dataOptions', () => {
      let errorThrownForPie = false;
      try {
        validateDataOptions('funnel', validDataOptions);
      } catch (e) {
        errorThrownForPie = true;
      }
      expect(errorThrownForPie).toBeFalsy();
    });
  });

  it('should falsy validate incorrect categorical chart dataOptions', () => {
    const invalidDataOptions = {
      category: [],
      value: [],
    } as ChartDataOptions;

    it('should falsy validate incorrect pie chart dataOptions', () => {
      let errorThrownForPie = false;
      try {
        validateDataOptions('pie', invalidDataOptions);
      } catch (e) {
        errorThrownForPie = true;
      }
      expect(errorThrownForPie).toBeTruthy();
    });

    it('should falsy validate incorrect funnel chart dataOptions', () => {
      let errorThrownForPie = false;
      try {
        validateDataOptions('funnel', invalidDataOptions);
      } catch (e) {
        errorThrownForPie = true;
      }
      expect(errorThrownForPie).toBeTruthy();
    });
  });
});
