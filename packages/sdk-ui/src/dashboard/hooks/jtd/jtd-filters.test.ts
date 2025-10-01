import { filterFactory, DateLevels } from '@ethings-os/sdk-data';
import { Attribute } from '@ethings-os/sdk-data';
import { describe, it, expect, vi } from 'vitest';
import {
  getFiltersFromDataPoint,
  isScatterDataPoint,
  getFiltersFromScatterDataPoint,
  getFiltersFromRegularDataPoint,
  getFormulaContextFilters,
  handleFormulaDuplicateFilters,
  normalizeDateForGranularity,
  filterByAllowedDimensions,
  mergeJtdFilters,
} from './jtd-filters.js';
import { DataPoint, DataPointEntry, ScatterDataPoint } from '../../../types.js';
import { WidgetProps } from '../../../props.js';
import { JtdConfig } from './jtd-types';

// Helper function to compare filters without GUID
const expectFilterMatch = (actualFilter: any, expectedFilter: any) => {
  expect(actualFilter.attribute).toEqual(expectedFilter.attribute);
  expect(actualFilter.members).toEqual(expectedFilter.members);
  expect(actualFilter.filterType).toEqual(expectedFilter.filterType);
};

const expectFiltersToContain = (filters: any[], expectedFilter: any) => {
  const matchingFilter = filters.find(
    (filter) =>
      filter.attribute === expectedFilter.attribute &&
      JSON.stringify(filter.members) === JSON.stringify(expectedFilter.members) &&
      filter.filterType === expectedFilter.filterType,
  );
  expect(matchingFilter).toBeDefined();
};

describe('jtd-filters', () => {
  // Mock attributes used across all tests
  const mockAttribute = {
    name: 'Test Attribute',
    type: 'text-attribute',
    expression: '[Test.Attribute]',
    dataSource: {
      title: 'Test DataSource',
      type: 'live',
    },
    id: 'test-attribute-id',
    description: 'Test attribute description',
    getSort: () => 'none',
    sort: 'none',
    serialize: () => ({}),
    toJSON: () => ({}),
    jaql: () => ({ jaql: 'mock' }),
  } as unknown as Attribute;

  const mockGenderAttribute = {
    name: 'Gender',
    type: 'text-attribute',
    expression: '[Commerce.Gender]',
    dataSource: {
      title: 'Sample ECommerce',
      type: 'live',
    },
    id: 'gender-attribute-id',
    description: 'Gender attribute',
    getSort: () => 'none',
    sort: 'none',
    serialize: () => ({}),
    toJSON: () => ({}),
    jaql: () => ({ jaql: 'mock' }),
  } as unknown as Attribute;

  const mockAgeRangeAttribute = {
    name: 'Age Range',
    type: 'text-attribute',
    expression: '[Commerce.Age Range]',
    dataSource: {
      title: 'Sample ECommerce',
      type: 'live',
    },
    id: 'age-range-attribute-id',
    description: 'Age range attribute',
    getSort: () => 'none',
    sort: 'none',
    serialize: () => ({}),
    toJSON: () => ({}),
    jaql: () => ({ jaql: 'mock' }),
  } as unknown as Attribute;

  const mockCategoryAttribute = {
    name: 'Category',
    type: 'text-attribute',
    expression: '[Category.Category]',
    dataSource: {
      title: 'Sample ECommerce',
      type: 'live',
    },
    id: 'category-attribute-id',
    description: 'Category attribute',
    getSort: () => 'none',
    sort: 'none',
    serialize: () => ({}),
    toJSON: () => ({}),
    jaql: () => ({ jaql: 'mock' }),
  } as unknown as Attribute;

  describe('isScatterDataPoint', () => {
    it('should identify data points with breakByColor as scatter data points', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          breakByColor: {
            id: 'breakByColor.0',
            dataOption: {} as any,
            attribute: mockGenderAttribute,
            value: 'Male',
            displayValue: 'Male',
          } as DataPointEntry,
        },
      };

      expect(isScatterDataPoint(scatterDataPoint)).toBe(true);
    });

    it('should identify data points with breakByPoint as scatter data points', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          breakByPoint: {
            id: 'breakByPoint.0',
            dataOption: {} as any,
            attribute: mockCategoryAttribute,
            value: 'PDAs',
            displayValue: 'PDAs',
          } as DataPointEntry,
        },
      };

      expect(isScatterDataPoint(scatterDataPoint)).toBe(true);
    });

    it('should identify data points with both breakByColor and breakByPoint as scatter data points', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          breakByColor: {
            id: 'breakByColor.0',
            dataOption: {} as any,
            attribute: mockGenderAttribute,
            value: 'Male',
            displayValue: 'Male',
          } as DataPointEntry,
          breakByPoint: {
            id: 'breakByPoint.0',
            dataOption: {} as any,
            attribute: mockCategoryAttribute,
            value: 'PDAs',
            displayValue: 'PDAs',
          } as DataPointEntry,
        },
      };

      expect(isScatterDataPoint(scatterDataPoint)).toBe(true);
    });

    it('should identify regular data points as non-scatter data points', () => {
      const regularDataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [
            {
              id: 'category.0',
              dataOption: {} as any,
              attribute: mockAttribute,
              value: 'Test Value',
              displayValue: 'Test Value',
            } as DataPointEntry,
          ],
          value: [],
        },
      };

      expect(isScatterDataPoint(regularDataPoint)).toBe(false);
    });

    it('should identify regular data points with breakBy as non-scatter data points', () => {
      const regularDataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [],
          value: [],
          breakBy: [
            {
              id: 'breakBy.0',
              dataOption: {} as any,
              attribute: mockGenderAttribute,
              value: 'Male',
              displayValue: 'Male',
            } as DataPointEntry,
          ],
        },
      };

      expect(isScatterDataPoint(regularDataPoint)).toBe(false);
    });

    it('should handle data points with no entries', () => {
      const dataPoint: DataPoint = {
        value: 100,
      };

      expect(isScatterDataPoint(dataPoint)).toBe(false);
    });

    it('should handle data points with empty entries object', () => {
      const dataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [],
          value: [],
        },
      };

      expect(isScatterDataPoint(dataPoint)).toBe(false);
    });
  });

  describe('getFiltersFromScatterDataPoint', () => {
    it('should extract filter from breakByColor', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          breakByColor: {
            id: 'breakByColor.0',
            dataOption: {} as any,
            attribute: mockGenderAttribute,
            value: 'Female',
            displayValue: 'Female',
          } as DataPointEntry,
        },
      };

      const filters = getFiltersFromScatterDataPoint(scatterDataPoint);

      expect(filters).toHaveLength(1);
      expectFilterMatch(filters[0], filterFactory.members(mockGenderAttribute, ['Female']));
    });

    it('should extract filter from breakByPoint', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          breakByPoint: {
            id: 'breakByPoint.0',
            dataOption: {} as any,
            attribute: mockCategoryAttribute,
            value: 'Laptops',
            displayValue: 'Laptops',
          } as DataPointEntry,
        },
      };

      const filters = getFiltersFromScatterDataPoint(scatterDataPoint);

      expect(filters).toHaveLength(1);
      expectFilterMatch(filters[0], filterFactory.members(mockCategoryAttribute, ['Laptops']));
    });

    it('should extract filters from both breakByColor and breakByPoint', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          breakByColor: {
            id: 'breakByColor.0',
            dataOption: {} as any,
            attribute: mockGenderAttribute,
            value: 'Male',
            displayValue: 'Male',
          } as DataPointEntry,
          breakByPoint: {
            id: 'breakByPoint.0',
            dataOption: {} as any,
            attribute: mockCategoryAttribute,
            value: 'PDAs',
            displayValue: 'PDAs',
          } as DataPointEntry,
        },
      };

      const filters = getFiltersFromScatterDataPoint(scatterDataPoint);

      expect(filters).toHaveLength(2);
      expectFiltersToContain(filters, filterFactory.members(mockGenderAttribute, ['Male']));
      expectFiltersToContain(filters, filterFactory.members(mockCategoryAttribute, ['PDAs']));
    });

    it('should skip breakByColor entries with null/undefined values', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          breakByColor: {
            id: 'breakByColor.0',
            dataOption: {} as any,
            attribute: mockGenderAttribute,
            value: null,
            displayValue: null,
          } as unknown as DataPointEntry,
        },
      };

      const filters = getFiltersFromScatterDataPoint(scatterDataPoint);

      expect(filters).toHaveLength(0);
    });

    it('should skip breakByPoint entries with null/undefined values', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          breakByPoint: {
            id: 'breakByPoint.0',
            dataOption: {} as any,
            attribute: mockCategoryAttribute,
            value: undefined,
            displayValue: undefined,
          } as unknown as DataPointEntry,
        },
      };

      const filters = getFiltersFromScatterDataPoint(scatterDataPoint);

      expect(filters).toHaveLength(0);
    });

    it('should skip entries without attributes', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          breakByColor: {
            id: 'breakByColor.0',
            dataOption: {} as any,
            value: 'Male',
            displayValue: 'Male',
          } as DataPointEntry,
        },
      };

      const filters = getFiltersFromScatterDataPoint(scatterDataPoint);

      expect(filters).toHaveLength(0);
    });

    it('should return empty array when no breakBy entries are present', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          x: {
            id: 'x.0',
            dataOption: {} as any,
            value: 100,
            displayValue: '100',
          } as DataPointEntry,
        },
      };

      const filters = getFiltersFromScatterDataPoint(scatterDataPoint);

      expect(filters).toHaveLength(0);
    });

    it('should convert numeric values to strings', () => {
      const scatterDataPoint: ScatterDataPoint = {
        x: 100,
        y: 200,
        entries: {
          breakByColor: {
            id: 'breakByColor.0',
            dataOption: {} as any,
            attribute: mockGenderAttribute,
            value: 123,
            displayValue: '123',
          } as DataPointEntry,
        },
      };

      const filters = getFiltersFromScatterDataPoint(scatterDataPoint);

      expect(filters).toHaveLength(1);
      expectFilterMatch(filters[0], filterFactory.members(mockGenderAttribute, ['123']));
    });
  });

  describe('getFiltersFromRegularDataPoint', () => {
    it('should extract filters from category entries', () => {
      const dataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [
            {
              id: 'category.0',
              dataOption: {} as any,
              attribute: mockAttribute,
              value: 'Test Value',
              displayValue: 'Test Value',
            } as DataPointEntry,
          ],
          value: [],
        },
      };

      const filters = getFiltersFromRegularDataPoint(dataPoint);

      expect(filters).toHaveLength(1);
      expectFilterMatch(filters[0], filterFactory.members(mockAttribute, ['Test Value']));
    });

    it('should extract filters from breakBy entries', () => {
      const dataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [],
          value: [],
          breakBy: [
            {
              id: 'breakBy.0',
              dataOption: {} as any,
              attribute: mockGenderAttribute,
              value: 'Male',
              displayValue: 'Male',
            } as DataPointEntry,
          ],
        },
      };

      const filters = getFiltersFromRegularDataPoint(dataPoint);

      expect(filters).toHaveLength(1);
      expectFilterMatch(filters[0], filterFactory.members(mockGenderAttribute, ['Male']));
    });

    it('should extract filters from both category and breakBy entries', () => {
      const dataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [
            {
              id: 'category.0',
              dataOption: {} as any,
              attribute: mockAgeRangeAttribute,
              value: '25-34',
              displayValue: '25-34',
            } as DataPointEntry,
          ],
          value: [],
          breakBy: [
            {
              id: 'breakBy.0',
              dataOption: {} as any,
              attribute: mockGenderAttribute,
              value: 'Female',
              displayValue: 'Female',
            } as DataPointEntry,
          ],
        },
      };

      const filters = getFiltersFromRegularDataPoint(dataPoint);

      expect(filters).toHaveLength(2);
      expectFiltersToContain(filters, filterFactory.members(mockAgeRangeAttribute, ['25-34']));
      expectFiltersToContain(filters, filterFactory.members(mockGenderAttribute, ['Female']));
    });

    it('should extract filters from multiple category entries', () => {
      const dataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [
            {
              id: 'category.0',
              dataOption: {} as any,
              attribute: mockAttribute,
              value: 'First Value',
              displayValue: 'First Value',
            } as DataPointEntry,
            {
              id: 'category.1',
              dataOption: {} as any,
              attribute: mockAgeRangeAttribute,
              value: '35-44',
              displayValue: '35-44',
            } as DataPointEntry,
          ],
          value: [],
        },
      };

      const filters = getFiltersFromRegularDataPoint(dataPoint);

      expect(filters).toHaveLength(2);
      expectFiltersToContain(filters, filterFactory.members(mockAttribute, ['First Value']));
      expectFiltersToContain(filters, filterFactory.members(mockAgeRangeAttribute, ['35-44']));
    });

    it('should extract filters from multiple breakBy entries', () => {
      const dataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [],
          value: [],
          breakBy: [
            {
              id: 'breakBy.0',
              dataOption: {} as any,
              attribute: mockGenderAttribute,
              value: 'Male',
              displayValue: 'Male',
            } as DataPointEntry,
            {
              id: 'breakBy.1',
              dataOption: {} as any,
              attribute: mockCategoryAttribute,
              value: 'Electronics',
              displayValue: 'Electronics',
            } as DataPointEntry,
          ],
        },
      };

      const filters = getFiltersFromRegularDataPoint(dataPoint);

      expect(filters).toHaveLength(2);
      expectFiltersToContain(filters, filterFactory.members(mockGenderAttribute, ['Male']));
      expectFiltersToContain(
        filters,
        filterFactory.members(mockCategoryAttribute, ['Electronics']),
      );
    });

    it('should skip entries with null/undefined values', () => {
      const dataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [
            {
              id: 'category.0',
              dataOption: {} as any,
              attribute: mockAttribute,
              value: null,
              displayValue: null,
            } as unknown as DataPointEntry,
            {
              id: 'category.1',
              dataOption: {} as any,
              attribute: mockAgeRangeAttribute,
              value: '25-34',
              displayValue: '25-34',
            } as DataPointEntry,
          ],
          value: [],
        },
      };

      const filters = getFiltersFromRegularDataPoint(dataPoint);

      expect(filters).toHaveLength(1);
      expectFilterMatch(filters[0], filterFactory.members(mockAgeRangeAttribute, ['25-34']));
    });

    it('should skip entries without attributes', () => {
      const dataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [
            {
              id: 'category.0',
              dataOption: {} as any,
              value: 'Test Value',
              displayValue: 'Test Value',
            } as DataPointEntry,
          ],
          value: [],
        },
      };

      const filters = getFiltersFromRegularDataPoint(dataPoint);

      expect(filters).toHaveLength(0);
    });

    it('should return empty array when no category or breakBy entries are present', () => {
      const dataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [],
          value: [
            {
              id: 'value.0',
              dataOption: {} as any,
              value: 100,
              displayValue: '100',
            } as DataPointEntry,
          ],
        },
      };

      const filters = getFiltersFromRegularDataPoint(dataPoint);

      expect(filters).toHaveLength(0);
    });

    it('should convert numeric values to strings', () => {
      const dataPoint: DataPoint = {
        value: 100,
        entries: {
          category: [
            {
              id: 'category.0',
              dataOption: {} as any,
              attribute: mockAttribute,
              value: 456,
              displayValue: '456',
            } as DataPointEntry,
          ],
          value: [],
        },
      };

      const filters = getFiltersFromRegularDataPoint(dataPoint);

      expect(filters).toHaveLength(1);
      expectFilterMatch(filters[0], filterFactory.members(mockAttribute, ['456']));
    });
  });

  describe('getFiltersFromDataPoint', () => {
    const mockAttribute = {
      name: 'Test Attribute',
      type: 'text-attribute',
      expression: '[Test.Attribute]',
      dataSource: {
        title: 'Test DataSource',
        type: 'live',
      },
      id: 'test-attribute-id',
      description: 'Test attribute description',
      getSort: () => 'none',
      sort: 'none',
      serialize: () => ({}),
      toJSON: () => ({}),
      jaql: () => ({ jaql: 'mock' }),
    } as unknown as Attribute;

    const mockGenderAttribute = {
      name: 'Gender',
      type: 'text-attribute',
      expression: '[Commerce.Gender]',
      dataSource: {
        title: 'Sample ECommerce',
        type: 'live',
      },
      id: 'gender-attribute-id',
      description: 'Gender attribute',
      getSort: () => 'none',
      sort: 'none',
      serialize: () => ({}),
      toJSON: () => ({}),
      jaql: () => ({ jaql: 'mock' }),
    } as unknown as Attribute;

    const mockCategoryAttribute = {
      name: 'Category',
      type: 'text-attribute',
      expression: '[Category.Category]',
      dataSource: {
        title: 'Sample ECommerce',
        type: 'live',
      },
      id: 'category-attribute-id',
      description: 'Category attribute',
      getSort: () => 'none',
      sort: 'none',
      serialize: () => ({}),
      toJSON: () => ({}),
      jaql: () => ({ jaql: 'mock' }),
    } as unknown as Attribute;

    const mockAgeRangeAttribute = {
      name: 'Age Range',
      type: 'text-attribute',
      expression: '[Commerce.Age Range]',
      dataSource: {
        title: 'Sample ECommerce',
        type: 'live',
      },
      id: 'age-range-attribute-id',
      description: 'Age range attribute',
      getSort: () => 'none',
      sort: 'none',
      serialize: () => ({}),
      toJSON: () => ({}),
      jaql: () => ({ jaql: 'mock' }),
    } as unknown as Attribute;

    describe('category entries', () => {
      it('should generate filters from category entries', () => {
        const dataPoint: DataPoint = {
          value: 100,
          entries: {
            category: [
              {
                id: 'category.0',
                dataOption: {} as any,
                attribute: mockAttribute,
                value: 'Test Value',
                displayValue: 'Test Value',
              } as DataPointEntry,
            ],
            value: [],
          },
        };

        const filters = getFiltersFromDataPoint(dataPoint);

        expect(filters).toHaveLength(1);
        const expectedFilter = filterFactory.members(mockAttribute, ['Test Value']);
        expectFilterMatch(filters[0], expectedFilter);
      });

      it('should skip entries with null or undefined values', () => {
        const dataPoint: DataPoint = {
          value: 100,
          entries: {
            category: [
              {
                id: 'category.0',
                dataOption: {} as any,
                attribute: mockAttribute,
                value: null,
                displayValue: 'Test Value',
              } as unknown as DataPointEntry,
              {
                id: 'category.1',
                dataOption: {} as any,
                attribute: mockAttribute,
                value: undefined,
                displayValue: 'Test Value',
              } as unknown as DataPointEntry,
            ],
            value: [],
          },
        };

        const filters = getFiltersFromDataPoint(dataPoint);
        expect(filters).toHaveLength(0);
      });
    });

    describe('breakBy entries - different chart types', () => {
      it('should handle breakBy array format (column charts)', () => {
        const dataPoint: DataPoint = {
          value: 40001.95531082153,
          categoryValue: '45-54',
          seriesValue: 'Male',
          entries: {
            category: [
              {
                id: 'category.0',
                dataOption: {} as any,
                attribute: mockAgeRangeAttribute,
                value: '45-54',
                displayValue: '45-54',
              } as DataPointEntry,
            ],
            value: [],
            breakBy: [
              {
                id: 'breakBy.0',
                dataOption: {} as any,
                attribute: mockGenderAttribute,
                value: 'Male',
                displayValue: 'Male',
              } as DataPointEntry,
            ],
          },
        };

        const filters = getFiltersFromDataPoint(dataPoint);

        expect(filters).toHaveLength(2);
        expectFiltersToContain(filters, filterFactory.members(mockAgeRangeAttribute, ['45-54']));
        expectFiltersToContain(filters, filterFactory.members(mockGenderAttribute, ['Male']));
      });

      it('should handle breakByColor and breakByPoint single object format (scatter charts)', () => {
        const dataPoint: ScatterDataPoint = {
          x: 2772.223388671875,
          y: 6,
          size: 5881.611423492432,
          breakByPoint: 'PDAs',
          breakByColor: 'Male',
          entries: {
            x: {
              id: 'x',
              dataOption: {} as any,
              value: '2772.223388671875',
              displayValue: '2772.223388671875',
            } as DataPointEntry,
            y: {
              id: 'y',
              dataOption: {} as any,
              value: '6',
              displayValue: '6',
            } as DataPointEntry,
            size: {
              id: 'size',
              dataOption: {} as any,
              value: '5881.611423492432',
              displayValue: '5881.611423492432',
            } as DataPointEntry,
            breakByPoint: {
              id: 'breakByPoint',
              dataOption: {} as any,
              attribute: mockCategoryAttribute,
              value: 'PDAs',
              displayValue: 'PDAs',
            } as DataPointEntry,
            breakByColor: {
              id: 'breakByColor',
              dataOption: {} as any,
              attribute: mockGenderAttribute,
              value: 'Male',
              displayValue: 'Male',
            } as DataPointEntry,
          },
        };

        const filters = getFiltersFromDataPoint(dataPoint as any);

        expect(filters).toHaveLength(2);
        expectFiltersToContain(filters, filterFactory.members(mockCategoryAttribute, ['PDAs']));
        expectFiltersToContain(filters, filterFactory.members(mockGenderAttribute, ['Male']));
      });

      it('should handle mixed breakBy formats in the same data point', () => {
        const dataPoint: DataPoint = {
          value: 100,
          entries: {
            category: [
              {
                id: 'category.0',
                dataOption: {} as any,
                attribute: mockAgeRangeAttribute,
                value: '25-34',
                displayValue: '25-34',
              } as DataPointEntry,
            ],
            value: [],
            breakBy: [
              {
                id: 'breakBy.0',
                dataOption: {} as any,
                attribute: mockGenderAttribute,
                value: 'Female',
                displayValue: 'Female',
              } as DataPointEntry,
            ],
            breakByPoint: {
              id: 'breakByPoint',
              dataOption: {} as any,
              attribute: mockCategoryAttribute,
              value: 'Laptops',
              displayValue: 'Laptops',
            } as DataPointEntry,
          } as any,
        };

        const filters = getFiltersFromDataPoint(dataPoint);

        // This data point has both regular (category, breakBy) and scatter (breakByPoint) properties
        // Since it has regular properties, isScatterDataPoint returns false, so breakByPoint is NOT processed
        expect(filters).toHaveLength(2);
        expectFiltersToContain(filters, filterFactory.members(mockAgeRangeAttribute, ['25-34']));
        expectFiltersToContain(filters, filterFactory.members(mockGenderAttribute, ['Female']));
      });

      it('should handle missing breakBy entries gracefully', () => {
        const dataPoint: DataPoint = {
          value: 100,
          entries: {
            category: [
              {
                id: 'category.0',
                dataOption: {} as any,
                attribute: mockAttribute,
                value: 'Test Value',
                displayValue: 'Test Value',
              } as DataPointEntry,
            ],
            value: [],
            // No breakBy entries
          },
        };

        const filters = getFiltersFromDataPoint(dataPoint);

        expect(filters).toHaveLength(1);
        expectFilterMatch(filters[0], filterFactory.members(mockAttribute, ['Test Value']));
      });

      it('should handle breakBy entries with null/undefined values', () => {
        const dataPoint: DataPoint = {
          value: 100,
          entries: {
            category: [],
            value: [],
            breakBy: [
              {
                id: 'breakBy.0',
                dataOption: {} as any,
                attribute: mockGenderAttribute,
                value: null,
                displayValue: 'Male',
              } as unknown as DataPointEntry,
            ],
            breakByColor: {
              id: 'breakByColor',
              dataOption: {} as any,
              attribute: mockCategoryAttribute,
              value: undefined,
              displayValue: 'PDAs',
            } as unknown as DataPointEntry,
          } as any,
        };

        const filters = getFiltersFromDataPoint(dataPoint);
        expect(filters).toHaveLength(0);
      });
    });

    describe('type detection and chart-specific processing', () => {
      it('should correctly identify scatter data points', () => {
        const scatterDataPoint: ScatterDataPoint = {
          x: 100,
          y: 200,
          breakByColor: 'Male',
          entries: {
            breakByColor: {
              id: 'breakByColor.0',
              dataOption: {} as any,
              attribute: mockGenderAttribute,
              value: 'Male',
              displayValue: 'Male',
            } as DataPointEntry,
          },
        };

        const regularDataPoint: DataPoint = {
          value: 100,
          entries: {
            category: [
              {
                id: 'category.0',
                dataOption: {} as any,
                attribute: mockAttribute,
                value: 'Test Value',
                displayValue: 'Test Value',
              } as DataPointEntry,
            ],
            value: [],
          },
        };

        // Scatter data point should only process scatter-specific properties
        const scatterFilters = getFiltersFromDataPoint(scatterDataPoint);
        expect(scatterFilters).toHaveLength(1);
        expectFilterMatch(scatterFilters[0], filterFactory.members(mockGenderAttribute, ['Male']));

        // Regular data point should only process regular properties
        const regularFilters = getFiltersFromDataPoint(regularDataPoint);
        expect(regularFilters).toHaveLength(1);
        expectFilterMatch(regularFilters[0], filterFactory.members(mockAttribute, ['Test Value']));
      });

      it('should not process category entries for scatter charts', () => {
        // This data point has both scatter and regular properties to test proper separation
        const hybridDataPoint = {
          x: 100,
          y: 200,
          breakByColor: 'Male',
          entries: {
            // Scatter-specific properties
            breakByColor: {
              id: 'breakByColor.0',
              dataOption: {} as any,
              attribute: mockGenderAttribute,
              value: 'Male',
              displayValue: 'Male',
            } as DataPointEntry,
            // This would exist in regular charts but should be ignored for scatter charts
            category: [
              {
                id: 'category.0',
                dataOption: {} as any,
                attribute: mockAttribute,
                value: 'Should Not Process',
                displayValue: 'Should Not Process',
              } as DataPointEntry,
            ],
          },
        } as ScatterDataPoint;

        const filters = getFiltersFromDataPoint(hybridDataPoint);

        // Should only have 1 filter (from breakByColor), not 2 (category should be ignored)
        expect(filters).toHaveLength(1);
        expectFilterMatch(filters[0], filterFactory.members(mockGenderAttribute, ['Male']));
      });

      it('should process all properties for mixed data points', () => {
        const hybridDataPoint = {
          value: 100,
          entries: {
            // Regular chart properties
            category: [
              {
                id: 'category.0',
                dataOption: {} as any,
                attribute: mockAttribute,
                value: 'Test Value',
                displayValue: 'Test Value',
              } as DataPointEntry,
            ],
            value: [],
            // Scatter chart property mixed with regular properties
            breakByColor: {
              id: 'breakByColor.0',
              dataOption: {} as any,
              attribute: mockGenderAttribute,
              value: 'Male',
              displayValue: 'Male',
            } as DataPointEntry,
          },
        } as DataPoint;

        const filters = getFiltersFromDataPoint(hybridDataPoint);

        // This data point has regular (category) and scatter (breakByColor) properties
        // Since it has regular properties, isScatterDataPoint returns false, so breakByColor is NOT processed
        expect(filters).toHaveLength(1);
        expectFiltersToContain(filters, filterFactory.members(mockAttribute, ['Test Value']));
        // breakByColor should NOT be processed for mixed data points that are classified as regular
      });

      it('should handle scatter charts with both breakByColor and breakByPoint', () => {
        const scatterDataPoint: ScatterDataPoint = {
          x: 100,
          y: 200,
          breakByColor: 'Male',
          breakByPoint: 'PDAs',
          entries: {
            breakByColor: {
              id: 'breakByColor.0',
              dataOption: {} as any,
              attribute: mockGenderAttribute,
              value: 'Male',
              displayValue: 'Male',
            } as DataPointEntry,
            breakByPoint: {
              id: 'breakByPoint.0',
              dataOption: {} as any,
              attribute: mockCategoryAttribute,
              value: 'PDAs',
              displayValue: 'PDAs',
            } as DataPointEntry,
          },
        };

        const filters = getFiltersFromDataPoint(scatterDataPoint);

        expect(filters).toHaveLength(2);
        expectFiltersToContain(filters, filterFactory.members(mockGenderAttribute, ['Male']));
        expectFiltersToContain(filters, filterFactory.members(mockCategoryAttribute, ['PDAs']));
      });

      it('should handle scatter charts with only breakByColor', () => {
        const scatterDataPoint: ScatterDataPoint = {
          x: 100,
          y: 200,
          breakByColor: 'Female',
          entries: {
            breakByColor: {
              id: 'breakByColor.0',
              dataOption: {} as any,
              attribute: mockGenderAttribute,
              value: 'Female',
              displayValue: 'Female',
            } as DataPointEntry,
          },
        };

        const filters = getFiltersFromDataPoint(scatterDataPoint);

        expect(filters).toHaveLength(1);
        expectFilterMatch(filters[0], filterFactory.members(mockGenderAttribute, ['Female']));
      });

      it('should handle scatter charts with only breakByPoint', () => {
        const scatterDataPoint: ScatterDataPoint = {
          x: 100,
          y: 200,
          breakByPoint: 'Laptops',
          entries: {
            breakByPoint: {
              id: 'breakByPoint.0',
              dataOption: {} as any,
              attribute: mockCategoryAttribute,
              value: 'Laptops',
              displayValue: 'Laptops',
            } as DataPointEntry,
          },
        };

        const filters = getFiltersFromDataPoint(scatterDataPoint);

        expect(filters).toHaveLength(1);
        expectFilterMatch(filters[0], filterFactory.members(mockCategoryAttribute, ['Laptops']));
      });

      it('should handle regular charts with both category and breakBy entries', () => {
        const dataPoint: DataPoint = {
          value: 100,
          categoryValue: '25-34',
          seriesValue: 'Female',
          entries: {
            category: [
              {
                id: 'category.0',
                dataOption: {} as any,
                attribute: mockAgeRangeAttribute,
                value: '25-34',
                displayValue: '25-34',
              } as DataPointEntry,
            ],
            value: [],
            breakBy: [
              {
                id: 'breakBy.0',
                dataOption: {} as any,
                attribute: mockGenderAttribute,
                value: 'Female',
                displayValue: 'Female',
              } as DataPointEntry,
            ],
          },
        };

        const filters = getFiltersFromDataPoint(dataPoint);

        expect(filters).toHaveLength(2);
        expectFiltersToContain(filters, filterFactory.members(mockAgeRangeAttribute, ['25-34']));
        expectFiltersToContain(filters, filterFactory.members(mockGenderAttribute, ['Female']));
      });

      it('should return empty array for scatter chart with no breakBy properties', () => {
        const scatterDataPoint: ScatterDataPoint = {
          x: 100,
          y: 200,
          entries: {
            x: {
              id: 'x.0',
              dataOption: {} as any,
              value: 100,
              displayValue: '100',
            } as DataPointEntry,
            y: {
              id: 'y.0',
              dataOption: {} as any,
              value: 200,
              displayValue: '200',
            } as DataPointEntry,
          },
        };

        const filters = getFiltersFromDataPoint(scatterDataPoint);

        expect(filters).toHaveLength(0);
      });

      it('should return empty array for regular chart with no category or breakBy entries', () => {
        const dataPoint: DataPoint = {
          value: 100,
          entries: {
            category: [],
            value: [
              {
                id: 'value.0',
                dataOption: {} as any,
                value: 100,
                displayValue: '100',
              } as DataPointEntry,
            ],
          },
        };

        const filters = getFiltersFromDataPoint(dataPoint);

        expect(filters).toHaveLength(0);
      });
    });

    describe('edge cases', () => {
      it('should handle empty entries object', () => {
        const dataPoint: DataPoint = {
          value: 100,
          entries: {
            category: [],
            value: [],
          },
        };

        const filters = getFiltersFromDataPoint(dataPoint);
        expect(filters).toHaveLength(0);
      });

      it('should handle missing entries property', () => {
        const dataPoint: DataPoint = {
          value: 100,
        } as any;

        const filters = getFiltersFromDataPoint(dataPoint);
        expect(filters).toHaveLength(0);
      });

      it('should convert values to strings for filter creation', () => {
        const dataPoint: DataPoint = {
          value: 100,
          entries: {
            category: [
              {
                id: 'category.0',
                dataOption: {} as any,
                attribute: mockAttribute,
                value: 123, // Number value
                displayValue: '123',
              } as DataPointEntry,
            ],
            value: [],
          },
        };

        const filters = getFiltersFromDataPoint(dataPoint);

        expect(filters).toHaveLength(1);
        expectFilterMatch(filters[0], filterFactory.members(mockAttribute, ['123']));
      });
    });
  });

  describe('getFormulaContextFilters', () => {
    const mockFormulaAttribute = {
      name: 'Formula Attribute',
      type: 'numeric-attribute',
      expression: '[Commerce.Cost]',
      dataSource: {
        title: 'Sample ECommerce',
        type: 'live',
      },
      id: 'formula-attribute-id',
      description: 'Formula attribute',
      getSort: () => 'none',
      sort: 'none',
      serialize: () => ({}),
      toJSON: () => ({}),
      jaql: () => ({ jaql: 'mock' }),
    } as unknown as Attribute;

    const createMockWidgetProps = (dataOptions: any): WidgetProps =>
      ({
        id: 'test-widget',
        title: 'Test Widget',
        dataOptions,
        chartType: 'column',
        widgetType: 'chart',
        filters: [],
      } as WidgetProps);

    const createMockJtdConfig = (sendFormulaFiltersDuplicate?: number | 'none'): JtdConfig =>
      ({
        sendFormulaFiltersDuplicate,
      } as JtdConfig);

    it('should extract formula context filters from widget data options', () => {
      const mockWidget = createMockWidgetProps({
        value: [
          {
            column: {
              context: {
                'filter-1': {
                  filterType: 'numeric',
                  attribute: mockFormulaAttribute,
                  valueA: 10,
                  valueB: 100,
                },
              },
            },
          },
        ],
      });

      const jtdConfig = createMockJtdConfig();
      const filters = getFormulaContextFilters(mockWidget, jtdConfig);

      expect(filters).toHaveLength(1);
      expect(filters[0].filterType).toBe('numeric');
      expect(filters[0].attribute).toEqual(mockFormulaAttribute);
    });

    it('should return empty array for non-chart widgets', () => {
      const mockWidget = {
        title: 'Non-chart widget',
      } as WidgetProps;

      const jtdConfig = createMockJtdConfig();
      const filters = getFormulaContextFilters(mockWidget, jtdConfig);

      expect(filters).toEqual([]);
    });

    it('should return empty array when no dataOptions', () => {
      const mockWidget = createMockWidgetProps(undefined);
      const jtdConfig = createMockJtdConfig();
      const filters = getFormulaContextFilters(mockWidget, jtdConfig);

      expect(filters).toEqual([]);
    });

    it('should return empty array when no context in columns', () => {
      const mockWidget = createMockWidgetProps({
        value: [
          {
            column: {
              // No context
            },
          },
        ],
      });

      const jtdConfig = createMockJtdConfig();
      const filters = getFormulaContextFilters(mockWidget, jtdConfig);

      expect(filters).toEqual([]);
    });

    it('should handle multiple filters in context', () => {
      const mockWidget = createMockWidgetProps({
        value: [
          {
            column: {
              context: {
                'filter-1': {
                  filterType: 'numeric',
                  attribute: mockFormulaAttribute,
                  valueA: 10,
                  valueB: 100,
                },
                'filter-2': {
                  filterType: 'members',
                  attribute: mockGenderAttribute,
                  members: ['Male', 'Female'],
                },
              },
            },
          },
        ],
      });

      const jtdConfig = createMockJtdConfig();
      const filters = getFormulaContextFilters(mockWidget, jtdConfig);

      expect(filters).toHaveLength(2);
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const invalidWidget = {
        dataOptions: {
          value: [
            {
              column: {
                context: null, // This might cause an error
              },
            },
          ],
        },
      } as any;

      const jtdConfig = createMockJtdConfig();
      const filters = getFormulaContextFilters(invalidWidget, jtdConfig);

      expect(filters).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('handleFormulaDuplicateFilters', () => {
    const createMockAttribute = (expression: string) =>
      ({
        name: 'Test Attribute',
        type: 'text-attribute',
        expression,
        dataSource: { title: 'Test', type: 'live' },
        id: 'test-id',
        description: 'Test',
        getSort: () => 'none',
        sort: 'none',
        serialize: () => ({}),
        toJSON: () => ({}),
        jaql: () => ({ jaql: 'mock' }),
      } as unknown as Attribute);

    const createMockFilter = (expression: string, filterType = 'members') => {
      const attr = createMockAttribute(expression);
      if (filterType === 'members') {
        return filterFactory.members(attr, ['test']);
      }
      // For other types, create a basic filter structure that matches the interface
      return {
        ...filterFactory.members(attr, ['test']),
        filterType,
      } as any;
    };

    it('should return all filters when no duplicates exist', () => {
      const filters = [
        createMockFilter('[Commerce.Cost]'),
        createMockFilter('[Commerce.Gender]'),
        createMockFilter('[Commerce.Age]'),
      ];

      const result = handleFormulaDuplicateFilters(filters);
      expect(result).toHaveLength(3);
      expect(result).toEqual(filters);
    });

    it('should exclude all duplicate filters when sendFormulaFiltersDuplicate is "none"', () => {
      const filters = [
        createMockFilter('[Commerce.Cost]'),
        createMockFilter('[Commerce.Cost]'), // Duplicate
        createMockFilter('[Commerce.Gender]'),
      ];

      const result = handleFormulaDuplicateFilters(filters, 'none');
      expect(result).toHaveLength(1);
      expect(result[0].attribute.expression).toBe('[Commerce.Gender]');
    });

    it('should include first duplicate when sendFormulaFiltersDuplicate is 1', () => {
      const filters = [
        createMockFilter('[Commerce.Cost]'),
        createMockFilter('[Commerce.Cost]'), // Duplicate
        createMockFilter('[Commerce.Gender]'),
      ];

      const result = handleFormulaDuplicateFilters(filters, 1);
      expect(result).toHaveLength(2);
      expect(result.find((f) => f.attribute.expression === '[Commerce.Cost]')).toBeDefined();
      expect(result.find((f) => f.attribute.expression === '[Commerce.Gender]')).toBeDefined();
    });

    it('should include second duplicate when sendFormulaFiltersDuplicate is 2', () => {
      const filters = [
        createMockFilter('[Commerce.Cost]', 'numeric'),
        createMockFilter('[Commerce.Cost]', 'members'), // Different type - second duplicate
        createMockFilter('[Commerce.Gender]'),
      ];

      const result = handleFormulaDuplicateFilters(filters, 2);
      expect(result).toHaveLength(2);
      const costFilter = result.find((f) => f.attribute.expression === '[Commerce.Cost]');
      expect(costFilter?.filterType).toBe('members'); // Should be the second one
    });

    it('should treat invalid number as "none"', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const filters = [
        createMockFilter('[Commerce.Cost]'),
        createMockFilter('[Commerce.Cost]'), // Duplicate
        createMockFilter('[Commerce.Gender]'),
      ];

      const result = handleFormulaDuplicateFilters(filters, 5); // Out of range
      expect(result).toHaveLength(1);
      expect(result[0].attribute.expression).toBe('[Commerce.Gender]');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid sendFormulaFiltersDuplicate number 5'),
      );

      consoleSpy.mockRestore();
    });

    it('should include first duplicate for any other value', () => {
      const filters = [
        createMockFilter('[Commerce.Cost]'),
        createMockFilter('[Commerce.Cost]'), // Duplicate
        createMockFilter('[Commerce.Gender]'),
      ];

      const result = handleFormulaDuplicateFilters(filters, 'other' as any);
      expect(result).toHaveLength(2);
      expect(result.find((f) => f.attribute.expression === '[Commerce.Cost]')).toBeDefined();
    });

    it('should return empty array for empty input', () => {
      const result = handleFormulaDuplicateFilters([]);
      expect(result).toEqual([]);
    });
  });

  describe('normalizeDateForGranularity', () => {
    it('should normalize date for Years granularity', () => {
      const result = normalizeDateForGranularity('2009-11-15T12:30:00.000', DateLevels.Years);
      expect(result).toBe('2009-01-01T00:00:00');
    });

    it('should normalize date for Months granularity', () => {
      const result = normalizeDateForGranularity('2009-11-15T12:30:00.000', DateLevels.Months);
      expect(result).toBe('2009-11-01T00:00:00');
    });

    it('should normalize date for Days granularity', () => {
      const result = normalizeDateForGranularity('2009-11-15T12:30:00.000', DateLevels.Days);
      expect(result).toBe('2009-11-15T00:00:00');
    });

    it('should normalize date for Weeks granularity', () => {
      const result = normalizeDateForGranularity('2009-11-15T12:30:00.000', DateLevels.Weeks);
      // Week start depends on locale, but should be normalized to start of week
      expect(result).toMatch(/2009-11-\d{2}T00:00:00/);
    });

    it('should normalize date for Quarters granularity', () => {
      const result = normalizeDateForGranularity('2009-11-15T12:30:00.000', DateLevels.Quarters);
      expect(result).toBe('2009-10-01T00:00:00'); // Q4 starts in October
    });

    it('should return original value for unsupported granularity', () => {
      const originalValue = '2009-11-15T12:30:00.000';
      const result = normalizeDateForGranularity(originalValue, 'UnsupportedGranularity');
      expect(result).toBe(originalValue);
    });

    it('should return original value for invalid date', () => {
      const invalidDate = 'invalid-date';
      const result = normalizeDateForGranularity(invalidDate, DateLevels.Days);
      expect(result).toBe(invalidDate);
    });

    it('should handle empty string gracefully', () => {
      const result = normalizeDateForGranularity('', DateLevels.Days);
      expect(result).toBe('');
    });

    it('should handle date parsing errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = normalizeDateForGranularity('2009-13-45T99:99:99', DateLevels.Days);
      expect(result).toBe('2009-13-45T99:99:99'); // Returns original on error

      consoleSpy.mockRestore();
    });
  });

  describe('filterByAllowedDimensions', () => {
    const createMockAttribute = (expression: string) =>
      ({
        name: 'Test Attribute2',
        type: 'text-attribute',
        expression,
        dataSource: { title: 'Test', type: 'live' },
        id: 'test-id',
        description: 'Test',
        getSort: () => 'none',
        sort: 'none',
        serialize: () => ({}),
        toJSON: () => ({}),
        jaql: () => ({ jaql: 'mock' }),
      } as unknown as Attribute);

    const createMockFilter = (expression: string) => {
      const attr = createMockAttribute(expression);
      return filterFactory.members(attr, ['test']);
    };

    const createMockCascadingFilter = (expressions: string[]) => {
      const filters = expressions.map((expr) => createMockFilter(expr));
      return filterFactory.cascading(filters, {
        guid: 'test-guid',
        disabled: false,
        locked: false,
      });
    };

    it('should return all filters when allowedDims is undefined', () => {
      const filters = [createMockFilter('[Commerce.Cost]'), createMockFilter('[Commerce.Gender]')];

      const result = filterByAllowedDimensions(filters);
      expect(result).toEqual(filters);
    });

    it('should return empty array when allowedDims is empty', () => {
      const filters = [createMockFilter('[Commerce.Cost]'), createMockFilter('[Commerce.Gender]')];

      const result = filterByAllowedDimensions(filters, []);
      expect(result).toEqual([]);
    });

    it('should filter regular filters by allowed dimensions', () => {
      const filters = [
        createMockFilter('[Commerce.Cost]'),
        createMockFilter('[Commerce.Gender]'),
        createMockFilter('[Commerce.Age]'),
      ];

      const result = filterByAllowedDimensions(filters, ['[Commerce.Cost]', '[Commerce.Age]']);
      expect(result).toHaveLength(2);
      expect(result.find((f) => f.attribute.expression === '[Commerce.Cost]')).toBeDefined();
      expect(result.find((f) => f.attribute.expression === '[Commerce.Age]')).toBeDefined();
    });

    it('should exclude cascading filter when no levels match', () => {
      const cascadingFilter = createMockCascadingFilter(['[Commerce.Cost]', '[Commerce.Gender]']);
      const filters = [cascadingFilter];

      const result = filterByAllowedDimensions(filters, ['[Commerce.Age]']);
      expect(result).toEqual([]);
    });

    it('should transform cascading filter to regular filter when only one level matches', () => {
      const cascadingFilter = createMockCascadingFilter(['[Commerce.Cost]', '[Commerce.Gender]']);
      const filters = [cascadingFilter];

      const result = filterByAllowedDimensions(filters, ['[Commerce.Cost]']);
      expect(result).toHaveLength(1);
      expect(result[0].filterType).toBe('members');
      expect(result[0].attribute.expression).toBe('[Commerce.Cost]');
    });

    it('should preserve cascading filter when multiple levels match', () => {
      const cascadingFilter = createMockCascadingFilter([
        '[Commerce.Cost]',
        '[Commerce.Gender]',
        '[Commerce.Age]',
      ]);
      const filters = [cascadingFilter];

      const result = filterByAllowedDimensions(filters, ['[Commerce.Cost]', '[Commerce.Gender]']);
      expect(result).toHaveLength(1);
      expect(result[0].filterType).toBe('cascading');
      expect((result[0] as any).filters).toHaveLength(2);
    });

    it('should handle mixed regular and cascading filters', () => {
      const regularFilter = createMockFilter('[Commerce.Age]');
      const cascadingFilter = createMockCascadingFilter(['[Commerce.Cost]', '[Commerce.Gender]']);
      const filters = [regularFilter, cascadingFilter];

      const result = filterByAllowedDimensions(filters, ['[Commerce.Age]', '[Commerce.Cost]']);
      expect(result).toHaveLength(2);
      expect(
        result.find(
          (f) => f.filterType === 'members' && f.attribute.expression === '[Commerce.Age]',
        ),
      ).toBeDefined();
      expect(
        result.find(
          (f) => f.filterType === 'members' && f.attribute.expression === '[Commerce.Cost]',
        ),
      ).toBeDefined();
    });

    it('should handle empty filters array', () => {
      const result = filterByAllowedDimensions([], ['[Commerce.Cost]']);
      expect(result).toEqual([]);
    });
  });

  describe('mergeJtdFilters', () => {
    const createMockAttribute = (expression: string) =>
      ({
        name: 'Test Attribute1',
        type: 'text-attribute',
        expression,
        dataSource: { title: 'Test', type: 'live' },
        id: 'test-id',
        description: 'Test',
        getSort: () => 'none',
        sort: 'none',
        serialize: () => ({}),
        toJSON: () => ({}),
        jaql: () => ({ jaql: {} }),
      } as unknown as Attribute);

    const createMockFilter = (expression: string, members = ['test']) => {
      const attr = createMockAttribute(expression);
      return filterFactory.members(attr, members);
    };

    it('should merge all filter types', () => {
      const generatedFilters = [createMockFilter('[Generated]')];
      const dashboardFilters = [createMockFilter('[Dashboard]')];
      const widgetFilters = [createMockFilter('[Widget]')];
      const formulaContextFilters = [createMockFilter('[Formula]')];

      const result = mergeJtdFilters(
        generatedFilters,
        dashboardFilters,
        widgetFilters,
        formulaContextFilters,
      );

      expect(result).toHaveLength(4);
    });

    it('should handle empty filter arrays', () => {
      const result = mergeJtdFilters([], [], [], []);
      expect(result).toEqual([]);
    });

    it('should merge filters in correct priority order', () => {
      // All arrays have filters on the same dimension to test merge priority
      const generatedFilters = [createMockFilter('[Test]', ['generated'])];
      const dashboardFilters = [createMockFilter('[Test]', ['dashboard'])];
      const widgetFilters = [createMockFilter('[Test]', ['widget'])];
      const formulaContextFilters = [createMockFilter('[Test]', ['formula'])];

      const result = mergeJtdFilters(
        generatedFilters,
        dashboardFilters,
        widgetFilters,
        formulaContextFilters,
      );

      // mergeFilters should handle the deduplication,
      // but generated filters should have highest priority
      expect(result).toHaveLength(1);
      expect((result[0] as any).members).toEqual(['generated']);
    });

    it('should handle undefined/null filter arrays gracefully', () => {
      const generatedFilters = [createMockFilter('[Test]')];

      const result = mergeJtdFilters(generatedFilters, null as any, undefined as any, []);

      expect(result).toHaveLength(1);
    });

    it('should preserve filter properties during merge', () => {
      const testAttribute = createMockAttribute('[Test.Complex]');
      const complexFilter = filterFactory.members(testAttribute, ['test']);

      const result = mergeJtdFilters([complexFilter], [], [], []);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject(complexFilter);
    });
  });
});
