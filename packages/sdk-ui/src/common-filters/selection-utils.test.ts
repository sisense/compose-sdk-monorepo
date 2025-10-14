import { Attribute, filterFactory, MembersFilter } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import {
  AreamapDataPoint,
  BoxplotDataPoint,
  CalendarHeatmapDataPoint,
  DataPoint,
  ScatterDataPoint,
  ScattermapDataPoint,
} from '..';
import {
  createCommonFiltersOverSelections,
  getSelectableWidgetAttributes,
  getWidgetSelections,
} from './selection-utils';

describe('createCommonFiltersOverSelections()', () => {
  const filters: MembersFilter[] = [
    filterFactory.members(DM.Commerce.AgeRange, ['0-18', '19-24'], {
      guid: '123',
    }) as MembersFilter,
    filterFactory.members(DM.Commerce.Gender, ['Male'], { guid: '234' }) as MembersFilter,
  ];

  it('should create new filters by selections', () => {
    const { filters: createdFilters, isSelection } = createCommonFiltersOverSelections(
      [
        {
          attribute: DM.Commerce.Condition,
          values: ['New'],
          displayValues: ['New'],
        },
      ],
      filters,
    );

    expect(createdFilters.length).toBe(1);
    expect(createdFilters[0].attribute).toEqual(DM.Commerce.Condition);
    expect((createdFilters[0] as MembersFilter).members).toEqual(['New']);
    expect(isSelection).toBe(true);
  });

  it('should update existing filter (creates new filter with same guid) by selections', () => {
    const { filters: createdFilters, isSelection } = createCommonFiltersOverSelections(
      [
        {
          attribute: DM.Commerce.AgeRange,
          values: ['65+'],
          displayValues: ['65+'],
        },
      ],
      filters,
    );

    expect(createdFilters.length).toBe(1);
    expect(createdFilters[0].attribute).toEqual(DM.Commerce.AgeRange);
    expect((createdFilters[0] as MembersFilter).members).toEqual(['65+']);
    expect(createdFilters[0].config.guid).toEqual(filters[0].config.guid);
    expect(isSelection).toBe(true);
  });

  it('should deselect all filters if they matches the existing filters', () => {
    const selections = filters.map(({ attribute, members: values }) => ({
      attribute,
      values,
      displayValues: values,
    }));
    const { filters: createdFilters, isSelection } = createCommonFiltersOverSelections(
      selections,
      filters,
    );

    expect(createdFilters.length).toBe(2);
    expect(createdFilters[0].attribute).toEqual(filters[0].attribute);
    expect((createdFilters[0] as MembersFilter).members).toEqual([]); // include all filter
    expect(createdFilters[0].config.guid).toEqual(filters[0].config.guid);
    expect(createdFilters[1].attribute).toEqual(filters[1].attribute);
    expect((createdFilters[1] as MembersFilter).members).toEqual([]); // include all filter
    expect(createdFilters[1].config.guid).toEqual(filters[1].config.guid);
    expect(isSelection).toBe(false);
  });

  it('should deselect some members of the filter if "allowPartialUnselection" enabled', () => {
    const allowPartialUnselection = true;
    const { filters: createdFilters, isSelection } = createCommonFiltersOverSelections(
      [
        {
          attribute: DM.Commerce.AgeRange,
          values: ['0-18'],
          displayValues: ['0-18'],
        },
        {
          attribute: DM.Commerce.Condition,
          values: ['New'],
          displayValues: ['New'],
        },
      ],
      [filters[0]],
      allowPartialUnselection,
    );

    expect(createdFilters.length).toBe(2);
    expect(createdFilters[0].attribute).toEqual(filters[0].attribute);
    expect((createdFilters[0] as MembersFilter).members).toEqual(['0-18']);
    expect(createdFilters[0].config.guid).toEqual(filters[0].config.guid);
    expect(createdFilters[1].attribute).toEqual(DM.Commerce.Condition);
    expect((createdFilters[1] as MembersFilter).members).toEqual(['New']);
    expect(isSelection).toBe(true);
  });

  it('should select filters for 2 attributes when one filter already selected (allowPartialUnselection=enabled)', () => {
    const allowPartialUnselection = true;
    const { filters: createdFilters, isSelection } = createCommonFiltersOverSelections(
      [
        {
          attribute: DM.Commerce.AgeRange,
          values: ['0-18'],
          displayValues: ['0-18'],
        },
      ],
      filters,
      allowPartialUnselection,
    );

    expect(createdFilters.length).toBe(1);
    expect(createdFilters[0].attribute).toEqual(filters[0].attribute);
    expect((createdFilters[0] as MembersFilter).members).toEqual(['19-24']); // excluded '0-18'
    expect(createdFilters[0].config.guid).toEqual(filters[0].config.guid);
    expect(isSelection).toBe(false);
  });
});

describe('getSelectableWidgetAttributes()', () => {
  const attributes: Attribute[] = [
    DM.Commerce.Condition,
    DM.Commerce.AgeRange,
    DM.Commerce.Gender,
    DM.Category.Category,
  ];

  it('should return no selectable attributes for "custom" widget', () => {
    const selectableAttributes = getSelectableWidgetAttributes('custom', {});

    expect(selectableAttributes).toEqual([]);
  });

  it('should return selectable attributes for "pivot" widget', () => {
    const selectableAttributes = getSelectableWidgetAttributes('pivot', {
      rows: [attributes[0]],
      columns: attributes.slice(1),
    });

    selectableAttributes.forEach((attribute, index) => {
      expect(attribute.expression).toEqual(attributes[index].expression);
    });
  });

  it('should return selectable attributes for "cartesian", "categorical" and "boxplot" widget', () => {
    const selectableAttributes = getSelectableWidgetAttributes('column', {
      category: attributes,
      value: [],
    });

    selectableAttributes.forEach((attribute, index) => {
      expect(attribute.expression).toEqual(attributes[index].expression);
    });
  });

  it('should return selectable attributes for "scatter" widget', () => {
    const selectableAttributes = getSelectableWidgetAttributes('scatter', {
      x: attributes[0],
      y: attributes[1],
      breakByPoint: attributes[2],
      breakByColor: attributes[3],
    });

    selectableAttributes.forEach((attribute, index) => {
      expect(attribute.expression).toEqual(attributes[index].expression);
    });
  });

  it('should return selectable attributes for "scattermap" and "areamap" widget', () => {
    const selectableAttributes = getSelectableWidgetAttributes('scattermap', {
      geo: [attributes[0]],
    });

    selectableAttributes.forEach((attribute, index) => {
      expect(attribute.expression).toEqual(attributes[index].expression);
    });
  });
});

describe('getWidgetSelections()', () => {
  it('should return no selections for "custom" widget', () => {
    const selections = getWidgetSelections('custom', {}, []);
    expect(selections).toEqual([]);
  });

  it('should return no selections for "pivot" widget', () => {
    const selections = getWidgetSelections('pivot', {}, []);
    expect(selections).toEqual([]);
  });

  it('should return selections for "cartesian", "pie" and "funnel" widget', () => {
    const dataOptions = {
      category: [DM.Commerce.AgeRange],
      value: [],
    };
    const points = [
      {
        entries: {
          category: [
            {
              id: 'category.0',
              attribute: DM.Commerce.AgeRange,
              value: '65+',
            },
          ],
        },
      },
    ] as DataPoint[];
    const selections = getWidgetSelections('column', dataOptions, points);
    expect(selections[0].attribute.expression).toEqual(DM.Commerce.AgeRange.expression);
    expect(selections[0].values).toEqual(['65+']);
  });

  it('should return selections for "treemap" and "sunburst" widget', () => {
    const dataOptions = {
      category: [DM.Commerce.AgeRange],
      value: [],
    };
    const points = [
      {
        entries: {
          category: [
            {
              id: 'category.0',
              attribute: DM.Commerce.AgeRange,
              value: '65+',
            },
          ],
        },
      },
    ] as DataPoint[];
    const selections = getWidgetSelections('treemap', dataOptions, points);
    expect(selections[0].attribute.expression).toEqual(DM.Commerce.AgeRange.expression);
    expect(selections[0].values).toEqual(['65+']);
  });

  it('should return selections for "boxplot" widget', () => {
    const dataOptions = {
      category: [DM.Commerce.AgeRange],
      value: [],
    };
    const points = [
      {
        entries: {
          category: [
            {
              id: 'category.0',
              attribute: DM.Commerce.AgeRange,
              value: '65+',
            },
          ],
        },
      },
      {
        entries: {
          category: [
            {
              id: 'category.0',
              attribute: DM.Commerce.AgeRange,
              value: '0-18',
            },
          ],
        },
      },
    ] as BoxplotDataPoint[];
    const selections = getWidgetSelections('boxplot', dataOptions, points);
    expect(selections[0].attribute.expression).toEqual(DM.Commerce.AgeRange.expression);
    expect(selections[0].values).toEqual(['65+', '0-18']);
  });

  it('should return selections for "scatter" widget', () => {
    const dataOptions = {
      x: DM.Commerce.AgeRange,
      y: DM.Commerce.Gender,
      breakByColor: DM.Commerce.Condition,
      breakByPoint: DM.Commerce.CategoryID,
    };
    const points = [
      {
        entries: {
          x: {
            id: 'x',
            attribute: DM.Commerce.AgeRange,
            value: '0-18',
          },
          y: {
            id: 'y',
            attribute: DM.Commerce.Gender,
            value: 'Male',
          },
          breakByPoint: {
            id: 'breakByPoint',
            attribute: DM.Commerce.CategoryID,
            value: '1',
          },
          breakByColor: {
            id: 'breakByColor',
            attribute: DM.Commerce.Condition,
            value: 'New',
          },
        },
      },
    ] as ScatterDataPoint[];
    const selections = getWidgetSelections('scatter', dataOptions, points);
    expect(selections[0].attribute.expression).toEqual(DM.Commerce.AgeRange.expression);
    expect(selections[0].values).toEqual(['0-18']);
    expect(selections[1].attribute.expression).toEqual(DM.Commerce.Gender.expression);
    expect(selections[1].values).toEqual(['Male']);
    expect(selections[2].attribute.expression).toEqual(DM.Commerce.CategoryID.expression);
    expect(selections[2].values).toEqual(['1']);
    expect(selections[3].attribute.expression).toEqual(DM.Commerce.Condition.expression);
    expect(selections[3].values).toEqual(['New']);
  });

  it('should return selections for "scattermap" widget', () => {
    const dataOptions = {
      geo: [DM.Country.Country],
      value: [],
    };
    const points = [
      {
        entries: {
          geo: [
            {
              id: 'geo.0',
              attribute: DM.Country.Country,
              value: 'Ukraine',
            },
          ],
        },
      },
    ] as ScattermapDataPoint[];
    const selections = getWidgetSelections('scattermap', dataOptions, points);
    expect(selections[0].attribute.expression).toEqual(DM.Country.Country.expression);
    expect(selections[0].values).toEqual(['Ukraine']);
  });

  it('should return selections for "areamap" widget', () => {
    const dataOptions = {
      geo: [DM.Country.Country],
      value: [],
    };
    const points = [
      {
        entries: {
          geo: [
            {
              id: 'geo.0',
              attribute: DM.Country.Country,
              value: 'USA',
            },
          ],
        },
      },
    ] as AreamapDataPoint[];
    const selections = getWidgetSelections('areamap', dataOptions, points);
    expect(selections[0].attribute.expression).toEqual(DM.Country.Country.expression);
    expect(selections[0].values).toEqual(['USA']);
  });

  it('should return selections for "calendar-heatmap" widget', () => {
    const dataOptions = {
      date: DM.Commerce.Date.Days,
      value: DM.Commerce.Revenue,
    };
    const points = [
      {
        entries: {
          date: {
            id: 'date',
            attribute: DM.Commerce.Date.Days,
            value: '2023-01-15',
            displayValue: 'Jan 15, 2023',
            dataOption: {} as any,
          },
          value: {
            id: 'value',
            attribute: DM.Commerce.Revenue,
            value: 1500,
            displayValue: '$1,500',
            dataOption: {} as any,
          },
        },
      },
      {
        entries: {
          date: {
            id: 'date',
            attribute: DM.Commerce.Date.Days,
            value: '2023-01-16',
            displayValue: 'Jan 16, 2023',
            dataOption: {} as any,
          },
          value: {
            id: 'value',
            attribute: DM.Commerce.Revenue,
            value: 2000,
            displayValue: '$2,000',
            dataOption: {} as any,
          },
        },
      },
    ] as CalendarHeatmapDataPoint[];
    const selections = getWidgetSelections('calendar-heatmap', dataOptions, points);
    expect(selections[0].attribute.expression).toEqual(DM.Commerce.Date.Days.expression);
    expect(selections[0].values).toEqual(['2023-01-15', '2023-01-16']);
    expect(selections[0].displayValues).toEqual(['Jan 15, 2023', 'Jan 16, 2023']);
  });
});
