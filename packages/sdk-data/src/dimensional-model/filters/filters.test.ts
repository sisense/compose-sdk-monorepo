/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DimensionalAttribute, DimensionalLevelAttribute } from '../attributes.js';
import { Filter } from '../interfaces.js';
import { DimensionalBaseMeasure } from '../measures/measures.js';
import { DateLevels } from '../types.js';
import {
  CascadingFilter,
  DateOperators,
  DateRangeFilter,
  ExcludeFilter,
  LogicalAttributeFilter,
  MeasureFilter,
  MembersFilter,
  NumericFilter,
  NumericOperators,
  RankingFilter,
  RankingOperators,
  RelativeDateFilter,
  TextFilter,
  TextOperators,
} from './filters.js';

describe('General Filter', () => {
  it('must be complete with all properties populated', () => {
    const filter = new MembersFilter(
      new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]'),
      ['Female'],
    );

    expect(filter.attribute).toBeDefined();
    expect(filter.filterType).toBeDefined();
    expect(filter.config).toBeDefined();
    expect(filter.isScope).toBeTruthy();
  });
});

describe('Filters jaql preparations', () => {
  it('must prepare members filter jaql', () => {
    const result = {
      jaql: {
        title: 'Gender',
        dim: '[Commerce.Gender]',
        datatype: 'text',
        filter: { members: ['Female'] },
      },
      panel: 'scope',
    };
    const filter = new MembersFilter(new DimensionalAttribute('Gender', '[Commerce.Gender]'), [
      'Female',
    ]);

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare exclude filter jaql', () => {
    const result = {
      jaql: {
        title: 'Gender',
        dim: '[Commerce.Gender]',
        datatype: 'text',
        filter: { exclude: { members: ['Female'] } },
      },
      panel: 'scope',
    };
    const filter = new ExcludeFilter(
      new MembersFilter(new DimensionalAttribute('Gender', '[Commerce.Gender]'), ['Female']),
    );

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare date range filter jaql', () => {
    const result = {
      jaql: {
        title: 'Years',
        dim: '[Commerce.Date (Calendar)]',
        level: 'years',
        datatype: 'datetime',
        filter: {
          from: '2010-01-01T00:00:00.000Z',
          to: '2012-01-01T00:00:00.000Z',
        },
      },
      panel: 'scope',
    };
    const filter = new DateRangeFilter(
      new DimensionalLevelAttribute('Years', '[Commerce.Date (Calendar)]', 'Years'),
      new Date('2010-01-01'),
      new Date('2012-01-01'),
    );

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare partial date range filters jaql', () => {
    const filterFrom = new DateRangeFilter(
      new DimensionalLevelAttribute('Years', '[Commerce.Date (Calendar)]', 'Years'),
      new Date('2010-01-01'),
    );
    const filterTo = new DateRangeFilter(
      new DimensionalLevelAttribute('Years', '[Commerce.Date (Calendar)]', 'Years'),
      undefined,
      new Date('2012-01-01'),
    );

    const jaqlFrom = filterFrom.jaql();
    const jaqlTo = filterTo.jaql();

    expect(jaqlFrom.jaql.filter?.from).toBe('2010-01-01T00:00:00.000Z');
    expect(jaqlFrom.jaql.filter?.to).toBeUndefined();

    expect(jaqlTo.jaql.filter?.from).toBeUndefined();
    expect(jaqlTo.jaql.filter?.to).toBe('2012-01-01T00:00:00.000Z');
  });

  it('must prepare logical attribute filter jaql', () => {
    const result = {
      jaql: {
        title: 'Gender',
        dim: '[Commerce.Gender]',
        datatype: 'text',
        filter: {
          or: [{ members: ['Female'] }, { exclude: { members: ['Male'] } }],
        },
      },
      panel: 'scope',
    };
    const filter = new LogicalAttributeFilter(
      [
        new MembersFilter(new DimensionalAttribute('Gender', '[Commerce.Gender]'), ['Female']),
        new ExcludeFilter(
          new MembersFilter(new DimensionalAttribute('Gender', '[Commerce.Gender]'), ['Male']),
        ),
      ],
      'or',
    );

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare measure filter jaql', () => {
    const result = {
      jaql: {
        title: 'Cost',
        dim: '[Commerce.Cost]',
        datatype: 'numeric',
        agg: 'sum',
        filter: {},
      },
      panel: 'scope',
    };
    const filter = new MeasureFilter(
      new DimensionalAttribute('Gender', '[Commerce.Gender]'),
      new DimensionalBaseMeasure(
        'Cost',
        new DimensionalAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute'),
        'sum',
      ),
    );

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare relative date (years level)  filter jaql', () => {
    const result = {
      jaql: {
        title: 'Years',
        dim: '[Commerce.Date (Calendar)]',
        level: 'years',
        datatype: 'datetime',
        filter: {
          last: { offset: 0, count: 2, anchor: '2012-01-01T00:00:00.000Z' },
        },
      },
      panel: 'scope',
    };
    const filter = new RelativeDateFilter(
      new DimensionalLevelAttribute('Years', '[Commerce.Date (Calendar)]', 'Years'),
      0,
      2,
      DateOperators.Last,
      new Date('2012-01-01'),
    );

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare relative date (minutes level) filter jaql', () => {
    const result = {
      jaql: {
        title: DateLevels.AggMinutesRoundTo15,
        dim: '[Commerce.Date (Calendar)]',
        level: 'minutes',
        bucket: '15',
        datatype: 'datetime',
        filter: {
          last: { offset: 0, count: 2, anchor: '2012-01-01T00:00:00.000Z' },
        },
      },
      panel: 'scope',
    };
    const filter = new RelativeDateFilter(
      new DimensionalLevelAttribute(
        DateLevels.AggMinutesRoundTo15,
        '[Commerce.Date (Calendar)]',
        DateLevels.AggMinutesRoundTo15,
      ),
      0,
      2,
      DateOperators.Last,
      new Date('2012-01-01'),
    );

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare text filter jaql', () => {
    const result = {
      jaql: {
        title: 'Gender',
        dim: '[Commerce.Gender]',
        datatype: 'text',
        filter: { contains: 'Male' },
      },
      panel: 'scope',
    };
    const filter = new TextFilter(
      new DimensionalAttribute('Gender', '[Commerce.Gender]'),
      TextOperators.Contains,
      'Male',
    );

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare numeric filter jaql', () => {
    const result = {
      jaql: {
        title: 'Cost',
        dim: '[Commerce.Cost]',
        datatype: 'numeric',
        filter: { from: 1, to: 3 },
      },
      panel: 'scope',
    };
    const filter = new NumericFilter(
      new DimensionalAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute'),
      NumericOperators.From,
      1,
      NumericOperators.To,
      3,
    );

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare ranking filter jaql', () => {
    const result = {
      jaql: {
        title: 'Cost',
        dim: '[Commerce.Cost]',
        datatype: 'numeric',
        filter: {
          top: 2,
          by: { title: 'Cost', agg: 'sum', dim: '[Commerce.Cost]', datatype: 'numeric' },
        },
      },
      panel: 'scope',
    };
    const filter = new RankingFilter(
      new DimensionalAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute'),
      new DimensionalBaseMeasure(
        'Cost',
        new DimensionalAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute'),
        'sum',
      ),
      RankingOperators.Top,
      2,
    );

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare cascading filter jaql', () => {
    const result = [
      {
        jaql: {
          title: 'Category',
          dim: '[Category.Category]',
          datatype: 'text',
          filter: {
            members: ['Apple Mac Desktops', 'Apple Mac Laptops', 'Calculators'],
          },
        },
        panel: 'scope',
      },
      {
        jaql: {
          title: 'Gender',
          dim: '[Commerce.Gender]',
          datatype: 'text',
          filter: {
            members: ['Female'],
          },
        },
        panel: 'scope',
      },
    ];

    const levelFilter1: Filter = new MembersFilter(
      new DimensionalAttribute('Category', '[Category.Category]'),
      ['Apple Mac Desktops', 'Apple Mac Laptops', 'Calculators'],
    );

    const levelFilter2: Filter = new MembersFilter(
      new DimensionalAttribute('Gender', '[Commerce.Gender]'),
      ['Female'],
    );

    const filter = new CascadingFilter([levelFilter1, levelFilter2]);

    const jaql = filter.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare members filter jaql with inner background filter', () => {
    const result = {
      jaql: {
        title: 'Gender',
        dim: '[Commerce.Gender]',
        datatype: 'text',
        filter: { and: [{ members: ['Female'] }, { members: ['Female', 'Male'] }] },
      },
      panel: 'scope',
    };
    const attribute = new DimensionalAttribute('Gender', '[Commerce.Gender]');
    const backgroundFilter = new MembersFilter(attribute, ['Female', 'Male']);
    const filter = new MembersFilter(attribute, ['Female']);
    filter.config = { ...filter.config, backgroundFilter, guid: 'some-id' };

    expect(filter.config.backgroundFilter).toBe(backgroundFilter);

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });
});

describe('Disabled Filter', () => {
  it('must prepare empty jaql for attribute filter', () => {
    const filter = new MembersFilter(
      new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]'),
      ['Female'],
      { guid: 'filter-id', disabled: true },
    );

    expect(filter.jaql(true)).toStrictEqual({ filter: {} });
    expect(filter.jaql()).toStrictEqual({ jaql: { filter: {} } });
  });

  it('must prepare empty jaql for measure filter', () => {
    const filter = new MeasureFilter(
      new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]'),
      new DimensionalBaseMeasure(
        'Cost',
        new DimensionalAttribute('[Commerce.Cost]', '[Commerce.Cost]', 'numeric-attribute'),
        'sum',
      ),
      undefined,
      undefined,
      undefined,
      undefined,
      { guid: 'filter-id', disabled: true },
    );

    expect(filter.jaql(true)).toStrictEqual({ filter: {} });
    expect(filter.jaql()).toStrictEqual({ jaql: { filter: {} } });
  });
});

describe('Multiple Data Sources', () => {
  it('must prepare jaql for attribute filter', () => {
    const filter = new MembersFilter(
      new DimensionalAttribute(
        'Gender',
        '[Commerce.Gender]',
        'text-attribute',
        undefined,
        undefined,
        {
          address: 'LocalHost',
          title: 'Sample ECommerce',
          id: 'localhost_aSampleIAAaECommerce',
          database: 'aSampleIAAaECommerce',
        },
      ),
      ['Female'],
    );

    const result = {
      jaql: {
        title: 'Gender',
        dim: '[Commerce.Gender]',
        datatype: 'text',
        filter: { members: ['Female'] },
        datasource: {
          address: 'LocalHost',
          title: 'Sample ECommerce',
          id: 'localhost_aSampleIAAaECommerce',
          database: 'aSampleIAAaECommerce',
        },
      },
      panel: 'scope',
    };

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare jaql for measure filter', () => {
    const result = {
      jaql: {
        title: 'Cost',
        dim: '[Commerce.Cost]',
        datatype: 'numeric',
        agg: 'sum',
        filter: {},
        datasource: {
          address: 'LocalHost',
          title: 'Sample ECommerce',
          id: 'localhost_aSampleIAAaECommerce',
          database: 'aSampleIAAaECommerce',
        },
      },
      panel: 'scope',
    };
    const filter = new MeasureFilter(
      new DimensionalAttribute(
        'Gender',
        '[Commerce.Gender]',
        'text-attribute',
        undefined,
        undefined,
        {
          address: 'LocalHost',
          title: 'Sample ECommerce',
          id: 'localhost_aSampleIAAaECommerce',
          database: 'aSampleIAAaECommerce',
        },
      ),
      new DimensionalBaseMeasure(
        'Cost',
        new DimensionalAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute'),
        'sum',
      ),
    );

    const jaql = filter.jaql();

    expect(jaql).toStrictEqual(result);
  });
});
