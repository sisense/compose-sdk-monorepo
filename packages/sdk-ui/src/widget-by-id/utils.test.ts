import { Filter, Jaql } from '@sisense/sdk-data';
import {
  getRootPanelItem,
  getFilterRelationsFromJaql,
  mergeFilters,
  isTextWidgetDtoStyle,
} from './utils.js';
import { PanelItem } from './types.js';
import { lineChartWidgetDTO } from './__mocks__/line-chart-widget-dto.js';
import { textWidgetDTO } from './__mocks__/text-widget-dto.js';
import { applyWidgetFiltersToRelations } from '@/utils/filter-relations.js';

const mockFilter1 = {
  config: {
    guid: 'mockFilter1',
  },
  attribute: {
    expression: 'mockExpression1',
  },
  jaql: () => ({
    jaql: 'mockJaql1',
  }),
} as Filter;
const mockFilter2 = {
  config: {
    guid: 'mockFilter2',
  },
  attribute: {
    expression: 'mockExpression2',
  },
  jaql: () => ({
    jaql: 'mockJaql2',
  }),
} as Filter;
const mockFilter3 = {
  config: {
    guid: 'mockFilter3',
  },
  attribute: {
    expression: 'mockExpression3',
  },
  jaql: () => ({
    jaql: 'mockJaql3',
  }),
} as Filter;
const mockFilter4 = {
  config: {
    guid: 'mockFilter4',
  },
  attribute: {
    expression: 'mockExpression4',
  },
  jaql: () => ({
    jaql: 'mockJaql4',
  }),
} as Filter;

describe('getRootPanelItem', () => {
  const mockPanelItem = { jaql: 'mockJaql' as unknown as Jaql } as PanelItem;

  it('should return panel item if only one item exist', () => {
    expect(getRootPanelItem(mockPanelItem)).toEqual(mockPanelItem);
  });

  it('should return root panel item', () => {
    const mockPanel = {
      parent: {
        parent: mockPanelItem,
      },
    } as PanelItem;
    expect(getRootPanelItem(mockPanel)).toEqual(mockPanelItem);
  });
});

describe('mergeFilters', () => {
  it('should merge filters in correct order', () => {
    const filters1 = [mockFilter1, mockFilter2];
    const filters2 = [mockFilter3, mockFilter4];
    expect(mergeFilters(filters1, filters2)).toEqual([
      mockFilter1,
      mockFilter2,
      mockFilter3,
      mockFilter4,
    ]);
  });

  it('should skip duplicate filters', () => {
    const filters1 = [mockFilter1, mockFilter2];
    const filters2 = [mockFilter2, mockFilter1, mockFilter3];
    expect(mergeFilters(filters2, filters1)).toEqual([mockFilter2, mockFilter1, mockFilter3]);
  });
});

describe('getFilterRelationsFromJaql', () => {
  const incomingFilterRelationsJaql = {
    operator: 'AND' as const,
    left: { instanceid: mockFilter1.config.guid },
    right: {
      operator: 'OR' as const,
      left: { instanceid: mockFilter2.config.guid },
      right: {
        operator: 'OR' as const,
        left: { instanceid: mockFilter3.config.guid },
        right: { instanceid: mockFilter4.config.guid },
      },
    },
  };
  const expectedFilterRelations = {
    operator: 'AND' as const,
    left: mockFilter1,
    right: {
      operator: 'OR' as const,
      left: mockFilter2,
      right: {
        operator: 'OR' as const,
        left: mockFilter3,
        right: mockFilter4,
      },
    },
  };

  it('should return filters if relations are undefined', () => {
    const filters = [mockFilter1, mockFilter2];
    expect(getFilterRelationsFromJaql(filters, [], undefined)).toEqual(filters);
  });

  it('should replace filter relations nodes with filters', () => {
    const filters = [mockFilter1, mockFilter2, mockFilter3, mockFilter4];
    expect(getFilterRelationsFromJaql(filters, [], incomingFilterRelationsJaql)).toEqual(
      expectedFilterRelations,
    );
  });

  it('should throw an error if filter relations contain unknown filter', () => {
    const filters = [mockFilter1, mockFilter2];
    expect(() => getFilterRelationsFromJaql(filters, [], incomingFilterRelationsJaql)).toThrow();
  });

  it('should return filters if filter relations and highlights exist', () => {
    const filters = [mockFilter1, mockFilter2];
    const highlights = [mockFilter3, mockFilter4];
    expect(getFilterRelationsFromJaql(filters, highlights, incomingFilterRelationsJaql)).toEqual(
      filters,
    );
  });
});

describe('applyWidgetFiltersToRelations', () => {
  const mockDimFilter = {
    config: { guid: 'dimGuid' },
    attribute: {
      expression: 'dimExpression',
    },
    jaql: () => ({
      jaql: {},
    }),
  } as Filter;
  const mockSameDimFilter = {
    config: { guid: 'sameDimGuid' },
    attribute: {
      expression: 'dimExpression',
    },
    jaql: () => ({
      jaql: {},
    }),
  } as Filter;
  const filterRelationsJaql = {
    operator: 'OR' as const,
    left: { instanceid: mockFilter1.config.guid },
    right: { instanceid: mockDimFilter.config.guid },
  };

  const replacedRelaationsJaql = {
    ...filterRelationsJaql,
    right: { instanceid: mockSameDimFilter.config.guid },
  };

  it('should return undefined if relations are not defined', () => {
    const updatedFilterRelations = applyWidgetFiltersToRelations([], [mockFilter1], undefined);
    expect(updatedFilterRelations).toBeUndefined();
  });

  it('should return relations unchanged if widget filters are not provided', () => {
    const updatedFilterRelations = applyWidgetFiltersToRelations(
      undefined as unknown as Filter[],
      [mockFilter1],
      filterRelationsJaql,
    );
    expect(updatedFilterRelations).toStrictEqual(filterRelationsJaql);
  });

  it('should return relations unchanged if there are no widget filters', () => {
    const updatedFilterRelations = applyWidgetFiltersToRelations(
      [] as Filter[],
      [mockFilter1],
      filterRelationsJaql,
    );
    expect(updatedFilterRelations).toStrictEqual(filterRelationsJaql);
  });

  it('should replace dashboard filter with widget filter for same dimension', () => {
    const updatedFilterRelations = applyWidgetFiltersToRelations(
      [mockSameDimFilter],
      [mockFilter1, mockDimFilter],
      filterRelationsJaql,
    );
    expect(updatedFilterRelations).toStrictEqual(replacedRelaationsJaql);
  });

  it('should not replace any filters with different dimensions', () => {
    const updatedFilterRelations = applyWidgetFiltersToRelations(
      [mockFilter2],
      [mockFilter1, mockDimFilter],
      filterRelationsJaql,
    );
    expect(updatedFilterRelations).toStrictEqual(filterRelationsJaql);
  });
});

describe('isTextWidgetDtoStyle', () => {
  it('should return true if widget is a TextWidget style', () => {
    expect(isTextWidgetDtoStyle(textWidgetDTO.style)).toBe(true);
  });

  it('should return false if widget type is not a TextWidget style', () => {
    expect(isTextWidgetDtoStyle(lineChartWidgetDTO.style)).toBe(false);
  });
});
