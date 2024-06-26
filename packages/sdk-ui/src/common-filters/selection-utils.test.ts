import { Attribute, filterFactory, MembersFilter } from '@sisense/sdk-data';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import {
  createCommonFiltersOverSelections,
  getSelectableWidgetAttributes,
  getWidgetSelections,
} from './selection-utils';
import { DataPoint, ScatterDataPoint } from '..';

describe('createCommonFiltersOverSelections()', () => {
  const filters: MembersFilter[] = [
    filterFactory.members(DM.Commerce.AgeRange, ['0-18'], [], '123') as MembersFilter,
    filterFactory.members(DM.Commerce.Gender, ['Male'], [], '234') as MembersFilter,
  ];

  it('should create new filters by selections', () => {
    const createdFilters = createCommonFiltersOverSelections(
      [
        {
          attribute: DM.Commerce.Condition,
          values: ['New'],
        },
      ],
      filters,
    );

    expect(createdFilters.length).toBe(1);
    expect(createdFilters[0].attribute).toEqual(DM.Commerce.Condition);
    expect((createdFilters[0] as MembersFilter).members).toEqual(['New']);
  });

  it('should update existing filter (creates new filter with same guid) by selections', () => {
    const createdFilters = createCommonFiltersOverSelections(
      [
        {
          attribute: DM.Commerce.AgeRange,
          values: ['65+'],
        },
      ],
      filters,
    );

    expect(createdFilters.length).toBe(1);
    expect(createdFilters[0].attribute).toEqual(DM.Commerce.AgeRange);
    expect((createdFilters[0] as MembersFilter).members).toEqual(['65+']);
    expect(createdFilters[0].guid).toEqual(filters[0].guid);
  });

  it('should deselect all filters if they matches the existing filters', () => {
    const selections = filters.map(({ attribute, members: values }) => ({
      attribute,
      values,
    }));
    const createdFilters = createCommonFiltersOverSelections(selections, filters);

    expect(createdFilters.length).toBe(2);
    expect(createdFilters[0].attribute).toEqual(filters[0].attribute);
    expect((createdFilters[0] as MembersFilter).members).toEqual([]); // include all filter
    expect(createdFilters[0].guid).toEqual(filters[0].guid);
    expect(createdFilters[1].attribute).toEqual(filters[1].attribute);
    expect((createdFilters[1] as MembersFilter).members).toEqual([]); // include all filter
    expect(createdFilters[1].guid).toEqual(filters[1].guid);
  });
});

describe('getSelectableWidgetAttributes()', () => {
  const attributes: Attribute[] = [
    DM.Commerce.Condition,
    DM.Commerce.AgeRange,
    DM.Commerce.Gender,
    DM.Category.Category,
  ];

  it('should return no selectable attributes for "plugin" widget', () => {
    const selectableAttributes = getSelectableWidgetAttributes('plugin', {});

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
  it('should return no selections for "plugin" widget', () => {
    const selections = getWidgetSelections('plugin', {}, [], {} as PointerEvent);
    expect(selections).toEqual([]);
  });

  it('should return no selections for "pivot" widget', () => {
    const selections = getWidgetSelections('pivot', {}, [], {} as PointerEvent);
    expect(selections).toEqual([]);
  });

  it('should return selections for "cartesian", "pie" and "funnel" widget', () => {
    const dataOptions = {
      category: [DM.Commerce.AgeRange],
      value: [],
    };
    const points = [
      {
        value: 123,
        categoryValue: '65+',
      },
    ];
    const selections = getWidgetSelections('column', dataOptions, points, {} as PointerEvent);
    expect(selections[0].attribute.expression).toEqual(DM.Commerce.AgeRange.expression);
    expect(selections[0].values).toEqual(['65+']);
  });

  it('should return selections for "treemap" and "sunburst" widget', () => {
    const dataOptions = {
      category: [DM.Commerce.AgeRange],
      value: [],
    };
    const points: DataPoint[] = [];
    const event = {
      point: {
        options: {
          custom: {
            level: 1,
          },
        },
        name: '65+',
      },
    } as unknown as PointerEvent;
    const selections = getWidgetSelections('treemap', dataOptions, points, event);
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
        value: 123,
        categoryValue: '65+',
      },
      {
        value: 124,
        x: 0,
      },
    ];
    const event = {
      point: {
        series: {
          xAxis: {
            categories: ['0-18'],
          },
        },
      },
    } as unknown as PointerEvent;
    const selections = getWidgetSelections('boxplot', dataOptions, points, event);
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
    const points: ScatterDataPoint[] = [];
    const event = {
      point: {
        options: {
          custom: {
            maskedX: '0-18',
            maskedY: 'Male',
            maskedBreakByColor: 'New',
            maskedBreakByPoint: '1',
          },
        },
      },
    } as unknown as PointerEvent;
    const selections = getWidgetSelections('scatter', dataOptions, points, event);
    expect(selections[0].attribute.expression).toEqual(DM.Commerce.AgeRange.expression);
    expect(selections[0].values).toEqual(['0-18']);
    expect(selections[1].attribute.expression).toEqual(DM.Commerce.Gender.expression);
    expect(selections[1].values).toEqual(['Male']);
    expect(selections[2].attribute.expression).toEqual(DM.Commerce.Condition.expression);
    expect(selections[2].values).toEqual(['New']);
    expect(selections[3].attribute.expression).toEqual(DM.Commerce.CategoryID.expression);
    expect(selections[3].values).toEqual(['1']);
  });

  it('should return selections for "scattermap" widget', () => {
    const dataOptions = {
      geo: [DM.Country.Country],
      value: [],
    };
    const points = [
      {
        value: 123,
        categories: ['Ukraine'],
      },
    ];
    const selections = getWidgetSelections('scattermap', dataOptions, points, {} as PointerEvent);
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
        value: 123,
        geoName: 'USA',
      },
    ];
    const selections = getWidgetSelections('areamap', dataOptions, points, {} as PointerEvent);
    expect(selections[0].attribute.expression).toEqual(DM.Country.Country.expression);
    expect(selections[0].values).toEqual(['USA']);
  });
});
