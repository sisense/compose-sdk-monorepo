import {
  Attribute,
  attributeFactory,
  createAttribute,
  filterFactory,
  measureFactory,
  MembersFilter,
} from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import {
  AreamapDataPoint,
  BoxplotDataPoint,
  CalendarHeatmapDataPoint,
  DataPoint,
  GenericDataOptions,
  ScatterDataPoint,
  ScattermapDataPoint,
} from '@/types';

import {
  createCommonFiltersOverSelections,
  getSelectableWidgetAttributes,
  getWidgetSelections,
} from './selection-utils.js';

describe('selection-utils', () => {
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

    it('should preserve the existing filter attribute (and its title) when updating by a selection with a different attribute instance', () => {
      // Existing filter uses an attribute with a custom title (e.g., user-defined title on a filter tile)
      const filterAttribute = createAttribute({
        name: 'Age Range',
        type: 'text-attribute',
        expression: '[Commerce.Age Range]',
      });
      filterAttribute.title = 'Customer Age Group';

      // Chart's selection uses a different attribute instance with the same expression but a different title
      const chartAttribute = createAttribute({
        name: 'Age Range',
        type: 'text-attribute',
        expression: '[Commerce.Age Range]',
      });

      const existingFilters: MembersFilter[] = [
        filterFactory.members(filterAttribute, ['0-18'], { guid: 'abc' }) as MembersFilter,
      ];

      const { filters: createdFilters } = createCommonFiltersOverSelections(
        [
          {
            attribute: chartAttribute,
            values: ['65+'],
            displayValues: ['65+'],
          },
        ],
        existingFilters,
      );

      expect(createdFilters.length).toBe(1);
      expect(createdFilters[0].attribute).toBe(filterAttribute);
      expect(createdFilters[0].attribute.title).toBe('Customer Age Group');
      expect((createdFilters[0] as MembersFilter).members).toEqual(['65+']);
      expect(createdFilters[0].config.guid).toBe('abc');
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

    it('should ignore non-array fields in custom widget dataOptions (e.g. pivot grandTotals)', () => {
      const selectableAttributes = getSelectableWidgetAttributes('custom', {
        rows: [DM.Commerce.AgeRange],
        columns: [DM.Commerce.Gender],
        values: [],
        grandTotals: { rows: true, columns: true },
      } as unknown as GenericDataOptions);

      expect(selectableAttributes).toHaveLength(2);
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

    it('excludes calculated dimensions by default (e.g. for drilldown targets)', () => {
      const calcDim = attributeFactory.customFormula('Bucket', "IF([rev] > 1000, 'A', 'B')", {
        rev: DM.Commerce.Revenue,
      });

      const selectableAttributes = getSelectableWidgetAttributes('column', {
        category: [calcDim, DM.Commerce.AgeRange],
        value: [],
      });

      expect(selectableAttributes).toHaveLength(1);
      expect(selectableAttributes[0].expression).toEqual(DM.Commerce.AgeRange.expression);
    });

    it('includes calculated dimensions when opted in (for cross-filtering)', () => {
      const calcDim = attributeFactory.customFormula('Bucket', "IF([rev] > 1000, 'A', 'B')", {
        rev: DM.Commerce.Revenue,
      });

      const selectableAttributes = getSelectableWidgetAttributes(
        'column',
        {
          category: [calcDim, DM.Commerce.AgeRange],
          value: [],
        },
        true,
      );

      expect(selectableAttributes).toHaveLength(2);
      expect(selectableAttributes.map((a) => a.expression)).toEqual([
        calcDim.expression,
        DM.Commerce.AgeRange.expression,
      ]);
    });

    it('excludes calculated dimensions for treemap/sunburst even when opted in', () => {
      const calcDim = attributeFactory.customFormula('Bucket', "IF([rev] > 1000, 'A', 'B')", {
        rev: DM.Commerce.Revenue,
      });

      // Treemap/sunburst selection is level-based and cannot represent a calculated dimension, so it
      // must never be selectable there — otherwise the widget registers a dead cross-filter handler.
      (['treemap', 'sunburst'] as const).forEach((widgetType) => {
        const selectableAttributes = getSelectableWidgetAttributes(
          widgetType,
          {
            category: [calcDim, DM.Commerce.AgeRange],
            value: [],
          },
          true,
        );

        expect(selectableAttributes).toHaveLength(1);
        expect(selectableAttributes[0].expression).toEqual(DM.Commerce.AgeRange.expression);
      });
    });

    it('should return selectable attributes for "sankey" widget', () => {
      const selectableAttributes = getSelectableWidgetAttributes('sankey', {
        category: attributes.slice(0, 3),
        value: [measureFactory.sum(DM.Commerce.Revenue)],
      });

      expect(selectableAttributes).toHaveLength(3);
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

    it('should handle custom widget dataOptions with pivot grandTotals for selections', () => {
      const selections = getWidgetSelections(
        'custom',
        {
          rows: [DM.Commerce.AgeRange],
          columns: [DM.Commerce.Gender],
          values: [],
          grandTotals: { rows: true, columns: true },
        } as unknown as GenericDataOptions,
        [],
      );
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

    it('produces a cross-filter selection for a calculated-dimension data point', () => {
      const calcDim = attributeFactory.customFormula('Bucket', "IF([rev] > 1000, 'A', 'B')", {
        rev: DM.Commerce.Revenue,
      });
      const dataOptions = { category: [calcDim], value: [] };
      const points = [
        {
          entries: {
            category: [{ attribute: calcDim, value: 'A' }],
          },
        },
      ] as unknown as DataPoint[];

      const selections = getWidgetSelections('column', dataOptions, points);
      expect(selections).toHaveLength(1);
      expect(selections[0].attribute.expression).toEqual(calcDim.expression);
      expect(selections[0].values).toEqual(['A']);
    });

    it('should keep datetime attributes with the same expression as separate selections by granularity', () => {
      const dataOptions = {
        category: [DM.Commerce.Date.Weeks, DM.Commerce.Date.Days],
        value: [measureFactory.sum(DM.Commerce.Revenue)],
      };
      const points = [
        {
          entries: {
            category: [
              {
                dataOption: DM.Commerce.Date.Weeks,
                attribute: DM.Commerce.Date.Weeks,
                value: '2023-01-01T00:00:00',
              },
              {
                dataOption: DM.Commerce.Date.Days,
                attribute: DM.Commerce.Date.Days,
                value: '2023-01-01T00:00:00',
              },
            ],
            value: [],
          },
        },
      ] as DataPoint[];

      const selections = getWidgetSelections('column', dataOptions, points);

      expect(selections).toHaveLength(2);
      expect(selections[0].attribute).toEqual(DM.Commerce.Date.Weeks);
      expect(selections[0].values).toEqual(['2023-01-01T00:00:00']);
      expect(selections[1].attribute).toEqual(DM.Commerce.Date.Days);
      expect(selections[1].values).toEqual(['2023-01-01T00:00:00']);
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
              attribute: DM.Commerce.AgeRange,
              value: '0-18',
            },
            y: {
              attribute: DM.Commerce.Gender,
              value: 'Male',
            },
            breakByPoint: {
              attribute: DM.Commerce.CategoryID,
              value: '1',
            },
            breakByColor: {
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

    it('should return selections for "sankey" widget (node click)', () => {
      const dataOptions = {
        category: [DM.Commerce.Gender, DM.Commerce.AgeRange],
        value: [measureFactory.sum(DM.Commerce.Revenue)],
      };
      const points = [
        {
          entries: {
            category: [
              {
                attribute: DM.Commerce.Gender,
                value: 'Male',
                displayValue: 'Male',
              },
            ],
          },
        },
      ] as DataPoint[];
      const selections = getWidgetSelections('sankey', dataOptions, points);
      expect(selections).toHaveLength(1);
      expect(selections[0].attribute.expression).toEqual(DM.Commerce.Gender.expression);
      expect(selections[0].values).toEqual(['Male']);
    });

    it('should return selections for "sankey" widget (link click)', () => {
      const dataOptions = {
        category: [DM.Commerce.Gender, DM.Commerce.AgeRange],
        value: [measureFactory.sum(DM.Commerce.Revenue)],
      };
      const points = [
        {
          entries: {
            category: [
              {
                attribute: DM.Commerce.Gender,
                value: 'Male',
                displayValue: 'Male',
              },
              {
                attribute: DM.Commerce.AgeRange,
                value: '19-24',
                displayValue: '19-24',
              },
            ],
          },
        },
      ] as DataPoint[];
      const selections = getWidgetSelections('sankey', dataOptions, points);
      expect(selections).toHaveLength(2);
      expect(selections[0].attribute.expression).toEqual(DM.Commerce.Gender.expression);
      expect(selections[0].values).toEqual(['Male']);
      expect(selections[1].attribute.expression).toEqual(DM.Commerce.AgeRange.expression);
      expect(selections[1].values).toEqual(['19-24']);
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
              attribute: DM.Commerce.Date.Days,
              value: '2023-01-15',
              displayValue: 'Jan 15, 2023',
              dataOption: {} as any,
            },
            value: {
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
              attribute: DM.Commerce.Date.Days,
              value: '2023-01-16',
              displayValue: 'Jan 16, 2023',
              dataOption: {} as any,
            },
            value: {
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
});
