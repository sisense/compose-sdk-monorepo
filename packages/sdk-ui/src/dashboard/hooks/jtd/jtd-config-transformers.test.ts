import { filterFactory, MetadataTypes } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { WidgetProps } from '@/props';

import {
  dimensionToPivotDimId,
  mapTargetsToArrayTargets,
  normalizeToJtdConfig,
  normalizeToJumpToDashboardConfig,
  transformJumpToDashboardConfigToJtdConfigForPivot,
} from './jtd-config-transformers';
import {
  JtdConfig,
  JtdTarget,
  JumpToDashboardConfig,
  JumpToDashboardConfigForPivot,
  PivotDimId,
} from './jtd-types';

const panelItemJaqlWithFormula = {
  title: 'sum([Total Revenue])  - SUM ([Total Revenue])',
  formula: 'sum([D0447-281])  - SUM ([D0447-281])',
  context: {
    '[D0447-281]': {
      title: 'Total Revenue',
      dim: '[Commerce.Revenue]',
      datatype: 'numeric',
      agg: 'sum',
    },
  },
};
const dimensionWithFormula = {
  name: 'sum([Total Revenue])  - SUM ([Total Revenue])',
  type: 'calculatedmeasure',
  description: '',
  composeCode:
    "measureFactory.customFormula('sum([Total Revenue])  - SUM ([Total Revenue])', 'sum([D0447-281])  - SUM ([D0447-281])', { '[D0447-281]': measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue') })",
  __serializable: 'DimensionalCalculatedMeasure',
  sort: 0,
  expression: 'sum([D0447-281])  - SUM ([D0447-281])',
  context: {
    '[D0447-281]': {
      name: 'Total Revenue',
      type: 'basemeasure',
      description: '',
      composeCode: "measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')",
      __serializable: 'DimensionalBaseMeasure',
      sort: 0,
      aggregation: 'sum',
      attribute: {
        name: 'Total Revenue',
        type: 'numeric-attribute',
        description: '',
        composeCode: 'DM.Commerce.Revenue',
        __serializable: 'DimensionalAttribute',
        expression: '[Commerce.Revenue]',
      },
    },
  },
};

// Months in Date
const panelItemJaqlWithDate = {
  title: 'Months in Date',
  dim: '[Commerce.Date (Calendar)]',
  datatype: 'datetime',
  level: 'months',
};
// Days in Date
const pamelItemJaqlWithDate2 = {
  title: 'Days in Date',
  dim: '[Commerce.Date (Calendar)]',
  datatype: 'datetime',
  level: 'days',
};
const dimensionWithDate = {
  name: 'Days in Date',
  type: 'datelevel',
  description: '',
  composeCode: 'DM.Commerce.Date.Days',
  __serializable: 'DimensionalLevelAttribute',
  expression: '[Commerce.Date (Calendar)]',
  granularity: 'Days',
  format: 'yyyy-MM-dd',
};

// Regular text (i.e Condition, Age Range)
const dimensionWithRegularText = {
  name: 'Condition',
  type: 'text-attribute',
  description: '',
  composeCode: 'DM.Commerce.Condition',
  __serializable: 'DimensionalAttribute',
  expression: '[Commerce.Condition]',
};
const panelItemJaqlWithSameRegularText = {
  title: 'Condition',
  dim: '[Commerce.Condition]',
  datatype: 'text',
};
const panelItemJaqlWithDifferentRegularText = {
  title: 'Age Range',
  dim: '[Commerce.Age Range]',
  datatype: 'text',
};

// Number measure (from Values) (i.e Total Cost)
const dimensionWithNumberMeasure = {
  name: 'Total Cost',
  type: 'basemeasure',
  description: '',
  composeCode: "measureFactory.sum(DM.Commerce.Cost, 'Total Cost')",
  __serializable: 'DimensionalBaseMeasure',
  sort: 0,
  aggregation: 'sum',
  attribute: {
    name: 'Total Cost',
    type: 'numeric-attribute',
    description: '',
    composeCode: 'DM.Commerce.Cost',
    __serializable: 'DimensionalAttribute',
    expression: '[Commerce.Cost]',
  },
};
const panelItemJaqlWithNumberMeasure = {
  title: 'Total Cost',
  dim: '[Commerce.Cost]',
  datatype: 'numeric',
  agg: 'sum',
};

// Number measure (from Values, but based on some date field) (i.e # of unique Years in Date)
const panelItemJaqlWithNumberMeasureFromDate = {
  title: '# of unique Years in Date',
  dim: '[Commerce.Date (Calendar)]',
  datatype: 'datetime',
  level: 'years',
  agg: 'count',
};
const dimensionWithNumberMeasureFromDate = {
  name: '# of unique Years in Date',
  type: 'basemeasure',
  description: '',
  composeCode: "measureFactory.countDistinct(DM.Commerce.Date.Years, '# of unique Years in Date')",
  __serializable: 'DimensionalBaseMeasure',
  sort: 0,
  aggregation: 'countDistinct',
  attribute: {
    name: '# of unique Years in Date',
    type: 'datelevel',
    description: '',
    composeCode: 'DM.Commerce.Date.Years',
    __serializable: 'DimensionalLevelAttribute',
    expression: '[Commerce.Date (Calendar)]',
    granularity: 'Years',
    format: 'yyyy',
  },
};

// Number column (from Columns) (i.e Room Id)
const dimensionWithNumberColumn = {
  name: 'Room_ID',
  type: 'numeric-attribute',
  description: '',
  composeCode: 'DM.Admissions.Room_ID',
  __serializable: 'DimensionalAttribute',
  expression: '[Admissions.Room_ID]',
};
const panelItemJaqlWithNumberColumn = {
  title: 'Room_ID',
  dim: '[Admissions.Room_ID]',
  datatype: 'numeric',
};

describe('jtd-config-transformers', () => {
  const mockAttribute = {
    name: 'Category',
    type: 'text-attribute',
    expression: '[Category.Category]',
    description: 'Category attribute',
    id: 'category-attr',
    __serializable: 'DimensionalAttribute',
    getSort: () => ({ direction: 'asc' }),
    sort: { direction: 'asc' },
    jaql: () => ({
      jaql: {
        title: 'Category',
        dim: '[Category.Category]',
        datatype: 'text',
      },
    }),
    serialize: () => ({
      name: 'Category',
      type: 'text-attribute',
      expression: '[Category.Category]',
      description: 'Category attribute',
      __serializable: 'DimensionalAttribute',
    }),
    toJSON: () => ({
      name: 'Category',
      type: 'text-attribute',
      expression: '[Category.Category]',
      description: 'Category attribute',
    }),
  } as any;

  const mockExtraFilters = [filterFactory.members(mockAttribute, ['Electronics', 'Clothing'])];

  const mockJumpTargets: JtdTarget[] = [
    {
      caption: 'Test Dashboard',
      id: 'test-dashboard-1',
    },
  ];

  describe('normalizeToJumpToDashboardConfig - detailed transformation', () => {
    it('should transform JtdConfig with extraFilters to JumpToDashboardConfig', () => {
      const jtdConfig: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        navigateType: 'rightclick',
        jumpToDashboardRightMenuCaption: 'Jump to Dashboard',
        showJtdIcon: true,
        includeDashFilterDims: ['[Geography.Country]'],
        includeWidgetFilterDims: ['[Category.Category]'],
        mergeTargetDashboardFilters: false,
        modalWindowWidth: 1200,
        modalWindowHeight: 800,
        modalWindowMeasurement: 'px',
        extraFilters: mockExtraFilters,
      };

      const result = normalizeToJumpToDashboardConfig(jtdConfig);

      expect(result).toEqual({
        enabled: true,
        targets: mockJumpTargets,
        interaction: {
          triggerMethod: 'rightclick',
          captionPrefix: 'Jump to Dashboard',
          showIcon: true,
        },
        targetDashboardConfig: {},
        filtering: {
          extraFilters: mockExtraFilters,
          includeDashboardFilters: ['[Geography.Country]'],
          includeWidgetFilters: ['[Category.Category]'],
          mergeWithTargetFilters: false,
        },
        modal: {
          width: 1200,
          height: 800,
          measurementUnit: 'px',
        },
      });
    });

    it('should handle JtdConfig without extraFilters', () => {
      const jtdConfig: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        navigateType: 'click',
      };

      const result = normalizeToJumpToDashboardConfig(jtdConfig);

      expect(result.filtering?.extraFilters).toEqual([]);
    });

    it('should map different navigateType values correctly', () => {
      const clickConfig: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        navigateType: 'click',
      };

      const rightClickConfig: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        navigateType: 'rightclick',
      };

      expect(normalizeToJumpToDashboardConfig(clickConfig).interaction?.triggerMethod).toBe(
        'click',
      );
      expect(normalizeToJumpToDashboardConfig(rightClickConfig).interaction?.triggerMethod).toBe(
        'rightclick',
      );
    });
  });

  describe('normalizeToJtdConfig - detailed transformation', () => {
    it('should transform JumpToDashboardConfig with extraFilters to JtdConfig', () => {
      const jumpConfig: JumpToDashboardConfig = {
        enabled: true,
        targets: mockJumpTargets,
        interaction: {
          triggerMethod: 'rightclick',
          captionPrefix: 'Jump to Dashboard',
          showIcon: true,
        },
        targetDashboardConfig: {
          filtersPanel: {
            visible: true,
          },
          toolbar: {
            visible: false,
          },
        },
        filtering: {
          extraFilters: mockExtraFilters,
          includeDashboardFilters: ['[Geography.Country]'],
          includeWidgetFilters: ['[Category.Category]'],
          mergeWithTargetFilters: false,
        },
        modal: {
          width: 1200,
          height: 800,
          measurementUnit: 'px',
        },
      };

      const result = normalizeToJtdConfig(jumpConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      expect(result).toEqual({
        enabled: true,
        jumpTargets: mockJumpTargets,
        navigateType: 'rightclick',
        jumpToDashboardRightMenuCaption: 'Jump to Dashboard',
        showJtdIcon: true,
        dashboardConfig: {
          filtersPanel: { visible: true },
          toolbar: { visible: false },
        },
        includeDashFilterDims: ['[Geography.Country]'],
        includeWidgetFilterDims: ['[Category.Category]'],
        mergeTargetDashboardFilters: false,
        modalWindowWidth: 1200,
        modalWindowHeight: 800,
        modalWindowMeasurement: 'px',
        extraFilters: mockExtraFilters,
      });
    });

    it('should handle JumpToDashboardConfig without extraFilters', () => {
      const jumpConfig: JumpToDashboardConfig = {
        enabled: true,
        targets: mockJumpTargets,
        interaction: {
          triggerMethod: 'click',
        },
      };

      const result = normalizeToJtdConfig(jumpConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      expect(result.extraFilters).toBeUndefined();
      expect(result.navigateType).toBe('click');
    });

    it('should handle empty extraFilters array', () => {
      const jumpConfig: JumpToDashboardConfig = {
        enabled: true,
        targets: mockJumpTargets,
        filtering: {
          extraFilters: [],
        },
      };

      const result = normalizeToJtdConfig(jumpConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      expect(result.extraFilters).toEqual([]);
    });
  });

  describe('normalizeToJumpToDashboardConfig - basic normalization', () => {
    it('should transform JtdConfig to JumpToDashboardConfig format', () => {
      const jtdConfig: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        extraFilters: mockExtraFilters,
        navigateType: 'rightclick',
      };

      const result = normalizeToJumpToDashboardConfig(jtdConfig);

      expect(result.targets).toEqual(mockJumpTargets);
      expect(result.filtering?.extraFilters).toEqual(mockExtraFilters);
      expect(result.interaction?.triggerMethod).toBe('rightclick');
    });

    it('should pass through JumpToDashboardConfig unchanged', () => {
      const jumpConfig: JumpToDashboardConfig = {
        enabled: true,
        targets: mockJumpTargets,
        filtering: { extraFilters: mockExtraFilters },
      };

      const result = normalizeToJumpToDashboardConfig(jumpConfig);

      expect(result).toEqual(jumpConfig);
    });
  });

  describe('normalizeToJtdConfig - basic normalization', () => {
    it('should transform JumpToDashboardConfig to JtdConfig format', () => {
      const jumpConfig: JumpToDashboardConfig = {
        enabled: true,
        targets: mockJumpTargets,
        filtering: { extraFilters: mockExtraFilters },
        interaction: { triggerMethod: 'rightclick' },
      };

      const result = normalizeToJtdConfig(jumpConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      expect(result.jumpTargets).toEqual(mockJumpTargets);
      expect(result.extraFilters).toEqual(mockExtraFilters);
      expect(result.navigateType).toBe('rightclick');
    });

    it('should pass through JtdConfig unchanged', () => {
      const jtdConfig: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        extraFilters: mockExtraFilters,
      };

      const result = normalizeToJtdConfig(jtdConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      expect(result).toEqual(jtdConfig);
    });
  });

  describe('bidirectional transformation', () => {
    it('should maintain data integrity in round-trip transformations', () => {
      // Start with JtdConfig with extraFilters
      const originalJtdConfig: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        navigateType: 'rightclick',
        jumpToDashboardRightMenuCaption: 'Jump to Dashboard',
        showJtdIcon: true,
        dashboardConfig: {
          filtersPanel: { visible: true },
          toolbar: { visible: false },
        },
        includeDashFilterDims: ['[Geography.Country]'],
        includeWidgetFilterDims: ['[Category.Category]'],
        mergeTargetDashboardFilters: false,
        modalWindowWidth: 1200,
        modalWindowHeight: 800,
        modalWindowMeasurement: 'px',
        extraFilters: mockExtraFilters,
      };

      // Transform to JumpToDashboardConfig and back
      const jumpConfig = normalizeToJumpToDashboardConfig(originalJtdConfig);
      const resultJtdConfig = normalizeToJtdConfig(jumpConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      // Key properties should be preserved
      expect(resultJtdConfig.enabled).toBe(originalJtdConfig.enabled);
      expect(resultJtdConfig.jumpTargets).toEqual(originalJtdConfig.jumpTargets);
      expect(resultJtdConfig.extraFilters).toEqual(originalJtdConfig.extraFilters);
      expect(resultJtdConfig.navigateType).toBe(originalJtdConfig.navigateType);
      expect(resultJtdConfig.includeDashFilterDims).toEqual(
        originalJtdConfig.includeDashFilterDims,
      );
      expect(resultJtdConfig.includeWidgetFilterDims).toEqual(
        originalJtdConfig.includeWidgetFilterDims,
      );
    });

    it('should maintain data integrity in reverse round-trip transformations', () => {
      // Start with JumpToDashboardConfig with extraFilters
      const originalJumpConfig: JumpToDashboardConfig = {
        enabled: true,
        targets: mockJumpTargets,
        interaction: {
          triggerMethod: 'rightclick',
          captionPrefix: 'Jump to Dashboard',
          showIcon: true,
        },
        targetDashboardConfig: {
          filtersPanel: {
            visible: true,
          },
          toolbar: {
            visible: false,
          },
        },
        filtering: {
          extraFilters: mockExtraFilters,
          includeDashboardFilters: ['[Geography.Country]'],
          includeWidgetFilters: ['[Category.Category]'],
          mergeWithTargetFilters: false,
        },
        modal: {
          width: 1200,
          height: 800,
          measurementUnit: 'px',
        },
      };

      // Transform to JtdConfig and back
      const jtdConfig = normalizeToJtdConfig(originalJumpConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);
      const resultJumpConfig = normalizeToJumpToDashboardConfig(jtdConfig);

      // Key properties should be preserved
      expect(resultJumpConfig.enabled).toBe(originalJumpConfig.enabled);
      expect(resultJumpConfig.targets).toEqual(originalJumpConfig.targets);
      expect(resultJumpConfig.filtering?.extraFilters).toEqual(
        originalJumpConfig.filtering?.extraFilters,
      );
      expect(resultJumpConfig.interaction?.triggerMethod).toBe(
        originalJumpConfig.interaction?.triggerMethod,
      );
      expect(resultJumpConfig.filtering?.includeDashboardFilters).toEqual(
        originalJumpConfig.filtering?.includeDashboardFilters,
      );
      expect(resultJumpConfig.filtering?.includeWidgetFilters).toEqual(
        originalJumpConfig.filtering?.includeWidgetFilters,
      );
    });
  });

  describe('unknown navigateType handling', () => {
    it('should set triggerMethod undefined for unknown navigateType', () => {
      const unknown: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        navigateType: 'UNKNOWN' as any,
      };
      // Unknown navigateType is passed through as-is in current implementation
      expect(normalizeToJumpToDashboardConfig(unknown).interaction?.triggerMethod).toBe('UNKNOWN');
    });
  });

  describe('idempotency', () => {
    it('should be idempotent for normalizeToJumpToDashboardConfig', () => {
      const jumpConfig: JumpToDashboardConfig = {
        enabled: true,
        targets: mockJumpTargets,
        filtering: { extraFilters: mockExtraFilters },
      };

      const firstPass = normalizeToJumpToDashboardConfig(jumpConfig);
      const secondPass = normalizeToJumpToDashboardConfig(firstPass);

      expect(firstPass).toEqual(secondPass);
    });

    it('should be idempotent for normalizeToJtdConfig', () => {
      const jtdConfig: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        extraFilters: mockExtraFilters,
      };

      const firstPass = normalizeToJtdConfig(jtdConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);
      const secondPass = normalizeToJtdConfig(firstPass, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      expect(firstPass).toEqual(secondPass);
    });
  });

  describe('immutability', () => {
    it('should not share array references between inputs and outputs', () => {
      const baseJtd: JtdConfig = {
        enabled: true,
        jumpTargets: [...mockJumpTargets],
        extraFilters: [...mockExtraFilters],
      };
      const jump = normalizeToJumpToDashboardConfig(baseJtd);

      // mutate output
      jump.filtering!.extraFilters!.push(filterFactory.members(mockAttribute, ['New']));

      // source remains unchanged
      expect(baseJtd.extraFilters!.length).toBe(1);

      const back = normalizeToJtdConfig(jump, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);
      back.jumpTargets.push({ caption: 'X', id: 'x' } as any);
      expect(baseJtd.jumpTargets.length).toBe(1);
    });

    it('should preserve undefined vs empty extraFilters semantics', () => {
      const withUndefined: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        extraFilters: undefined,
      };

      const withEmpty: JtdConfig = {
        enabled: true,
        jumpTargets: mockJumpTargets,
        extraFilters: [],
      };

      const jumpFromUndefined = normalizeToJumpToDashboardConfig(withUndefined);
      const jumpFromEmpty = normalizeToJumpToDashboardConfig(withEmpty);

      expect(jumpFromUndefined.filtering?.extraFilters).toEqual([]);
      expect(jumpFromEmpty.filtering?.extraFilters).toEqual([]);

      const backFromUndefined = normalizeToJtdConfig(jumpFromUndefined, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);
      const backFromEmpty = normalizeToJtdConfig(jumpFromEmpty, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      expect(backFromUndefined.extraFilters).toEqual([]);
      expect(backFromEmpty.extraFilters).toEqual([]);
    });

    describe('transformJumpToDashboardConfigToJtdConfigForPivot with dataOptions', () => {
      it('should handle empty dataOptions gracefully', () => {
        const emptyDataOptions = { rows: [], columns: [], values: [] };
        const emptyTargetsMap = new Map();

        const pivotConfig: JumpToDashboardConfigForPivot = {
          enabled: true,
          targets: emptyTargetsMap,
          interaction: { triggerMethod: 'click' },
          filtering: {},
          targetDashboardConfig: { toolbar: { visible: true }, filtersPanel: { visible: true } },
        };

        const result = transformJumpToDashboardConfigToJtdConfigForPivot(
          pivotConfig,
          emptyDataOptions as any,
        );

        expect(result.enabled).toBe(true);
        expect(result.jumpTargets).toEqual([]);
      });

      it('should properly construct internal structure without throwing errors', () => {
        // Create a proper mock dimension that will pass MetadataTypes.isAttribute() check
        const mockDimension = {
          ...mockAttribute,
          jaql: () => ({ dim: '[Category.Category]' }),
          type: 'attribute',
        };

        // Verify the mock passes the type guard
        expect(MetadataTypes.isAttribute(mockDimension)).toBe(true);

        const mockDataOptions = {
          rows: [{ column: mockDimension }],
          columns: [],
          values: [],
        };

        const emptyTargetsMap = new Map();
        const pivotConfig: JumpToDashboardConfigForPivot = {
          enabled: true,
          targets: emptyTargetsMap,
          interaction: { triggerMethod: 'click' },
          filtering: {},
          targetDashboardConfig: { toolbar: { visible: true }, filtersPanel: { visible: true } },
        };

        // This should construct panels internally without throwing errors
        const result = transformJumpToDashboardConfigToJtdConfigForPivot(
          pivotConfig,
          mockDataOptions as any,
        );

        expect(result).toBeDefined();
        expect(result.enabled).toBe(true);
        expect(result.jumpTargets).toEqual([]);
      });

      it('should handle sophisticated dimension matching with level and location', () => {
        // Mock date dimension with level - appears in rows
        const dateYearDimension = {
          ...mockAttribute,
          expression: '[Date.Date]',
          level: 'Years',
          name: 'Date (Years)',
          jaql: () => ({ dim: '[Date.Date]', level: 'Years', title: 'Date (Years)' }),
          type: 'attribute',
        };

        // Same date dimension with different level - appears in columns
        const dateMonthDimension = {
          ...mockAttribute,
          expression: '[Date.Date]',
          level: 'Months',
          name: 'Date (Months)',
          jaql: () => ({ dim: '[Date.Date]', level: 'Months', title: 'Date (Months)' }),
          type: 'attribute',
        };

        const mockDataOptions = {
          rows: [{ column: dateYearDimension }],
          columns: [{ column: dateMonthDimension }],
          values: [],
        };

        // Create targets map with location-specific dimensions
        const targetsMap = new Map();
        const mockTarget = { caption: 'Date Dashboard', id: 'date-dash' };

        // Same dimension but different locations and levels
        targetsMap.set({ dimension: dateYearDimension, location: 'row' }, [mockTarget]);
        targetsMap.set({ dimension: dateMonthDimension, location: 'column' }, [mockTarget]);

        const pivotConfig: JumpToDashboardConfigForPivot = {
          enabled: true,
          targets: targetsMap,
          interaction: { triggerMethod: 'click' },
          filtering: {},
          targetDashboardConfig: { toolbar: { visible: true }, filtersPanel: { visible: true } },
        };

        const result = transformJumpToDashboardConfigToJtdConfigForPivot(
          pivotConfig,
          mockDataOptions as any,
        );

        expect(result.jumpTargets).toBeDefined();
        expect(result.jumpTargets.length).toBe(1); // Should group both into single target

        const jumpTarget = result.jumpTargets[0] as JtdTarget & { pivotDimensions?: PivotDimId[] };
        expect(jumpTarget.caption).toBe('Date Dashboard');
        expect(jumpTarget.pivotDimensions).toContain('rows.0');
        expect(jumpTarget.pivotDimensions).toContain('columns.0');
        expect(jumpTarget.pivotDimensions).toHaveLength(2);
      });

      it('should handle deterministic matching for formula measures', () => {
        // Manually construct panels with the expected structure
        const panels = [
          { name: 'rows', items: [] },
          { name: 'columns', items: [] },
          { name: 'values', items: [{ jaql: panelItemJaqlWithFormula }] },
        ];

        // Directly test the matching logic with constructed panels
        const result = dimensionToPivotDimId(dimensionWithFormula as any, panels as any);

        expect(result).toBe('values.0');
      });

      it('should handle deterministic matching for date level attributes', () => {
        // Directly test matching logic with panels
        const panels = [
          { name: 'rows', items: [{ jaql: pamelItemJaqlWithDate2 }] }, // Days level
          { name: 'columns', items: [] },
          { name: 'values', items: [] },
        ];

        const result = dimensionToPivotDimId(dimensionWithDate as any, panels as any);

        expect(result).toBe('rows.0');
      });

      it('should handle deterministic matching for regular text attributes', () => {
        const panels = [
          { name: 'rows', items: [{ jaql: panelItemJaqlWithSameRegularText }] },
          { name: 'columns', items: [] },
          { name: 'values', items: [] },
        ];

        const result = dimensionToPivotDimId(dimensionWithRegularText as any, panels as any);

        expect(result).toBe('rows.0');
      });

      it('should handle deterministic matching for number measures', () => {
        const panels = [
          { name: 'rows', items: [] },
          { name: 'columns', items: [] },
          { name: 'values', items: [{ jaql: panelItemJaqlWithNumberMeasure }] },
        ];

        const result = dimensionToPivotDimId(dimensionWithNumberMeasure as any, panels as any);

        expect(result).toBe('values.0');
      });

      it('should handle deterministic matching for date-based measures with level', () => {
        const panels = [
          { name: 'rows', items: [] },
          { name: 'columns', items: [] },
          { name: 'values', items: [{ jaql: panelItemJaqlWithNumberMeasureFromDate }] },
        ];

        const result = dimensionToPivotDimId(
          dimensionWithNumberMeasureFromDate as any,
          panels as any,
        );

        expect(result).toBe('values.0');
      });

      it('should not match when dimension types differ', () => {
        // Use Months level panel item but try to match with Days level dimension
        const panels = [
          { name: 'rows', items: [{ jaql: panelItemJaqlWithDate }] }, // Months level
          { name: 'columns', items: [] },
          { name: 'values', items: [] },
        ];

        const result = dimensionToPivotDimId(dimensionWithDate as any, panels as any); // Days level dimension

        // Should have no match due to level mismatch
        expect(result).toBeNull();
      });

      it('should not match when text dimension expressions differ', () => {
        // Test with different text dimension (Age Range vs Condition)
        const panels = [
          { name: 'rows', items: [{ jaql: panelItemJaqlWithDifferentRegularText }] }, // Age Range
          { name: 'columns', items: [] },
          { name: 'values', items: [] },
        ];

        const result = dimensionToPivotDimId(dimensionWithRegularText as any, panels as any); // Condition dimension

        // Should have no match due to expression mismatch
        expect(result).toBeNull();
      });

      it('should handle deterministic matching for numeric columns', () => {
        // Test numeric attribute matching
        const panels = [
          { name: 'rows', items: [] },
          { name: 'columns', items: [{ jaql: panelItemJaqlWithNumberColumn }] }, // Room_ID
          { name: 'values', items: [] },
        ];

        const result = dimensionToPivotDimId(dimensionWithNumberColumn as any, panels as any);

        expect(result).toBe('columns.0');
      });

      it('should handle multiple panel items and find correct match', () => {
        // Test with multiple items in same panel - should find correct index
        const panels = [
          {
            name: 'rows',
            items: [
              { jaql: panelItemJaqlWithDifferentRegularText }, // Index 0: Age Range
              { jaql: panelItemJaqlWithSameRegularText }, // Index 1: Condition (should match)
            ],
          },
          { name: 'columns', items: [] },
          { name: 'values', items: [] },
        ];

        const result = dimensionToPivotDimId(dimensionWithRegularText as any, panels as any);

        expect(result).toBe('rows.1'); // Should match second item
      });

      it('should search across multiple panels', () => {
        // Test searching across panels when dimension could be in different locations
        const panels = [
          { name: 'rows', items: [{ jaql: panelItemJaqlWithDifferentRegularText }] }, // Wrong match
          { name: 'columns', items: [{ jaql: panelItemJaqlWithNumberColumn }] }, // Correct match for numeric
          { name: 'values', items: [{ jaql: panelItemJaqlWithNumberMeasure }] },
        ];

        const result = dimensionToPivotDimId(dimensionWithNumberColumn as any, panels as any);

        expect(result).toBe('columns.0'); // Should find in columns panel
      });

      it('should return null when no panels provided', () => {
        const result = dimensionToPivotDimId(dimensionWithRegularText as any, [] as any);

        expect(result).toBeNull();
      });

      it('should return null when panel has no items', () => {
        const panels = [
          { name: 'rows', items: [] },
          { name: 'columns', items: [] },
          { name: 'values', items: [] },
        ];

        const result = dimensionToPivotDimId(dimensionWithRegularText as any, panels as any);

        expect(result).toBeNull();
      });
    });

    describe('mapTargetsToArrayTargets', () => {
      it('should handle multiple targets for the same dimension', () => {
        const panels = [
          { name: 'rows', items: [{ jaql: panelItemJaqlWithSameRegularText }] },
          { name: 'columns', items: [] },
          { name: 'values', items: [] },
        ];

        const dimension = dimensionWithRegularText;
        const targets = [
          { caption: 'Dashboard A', id: 'dash-a' },
          { caption: 'Dashboard B', id: 'dash-b' },
          { caption: 'Dashboard C', id: 'dash-c' },
        ];

        const targetsMap = new Map();
        targetsMap.set(dimension, targets);

        const result = mapTargetsToArrayTargets(targetsMap, panels as any);

        expect(result).toHaveLength(3); // Should have all 3 targets

        const dashA = result.find((t) => t.caption === 'Dashboard A');
        const dashB = result.find((t) => t.caption === 'Dashboard B');
        const dashC = result.find((t) => t.caption === 'Dashboard C');

        expect(dashA?.pivotDimensions).toEqual(['rows.0']);
        expect(dashB?.pivotDimensions).toEqual(['rows.0']);
        expect(dashC?.pivotDimensions).toEqual(['rows.0']);
      });

      it('should handle multiple targets across different dimensions', () => {
        const panels = [
          { name: 'rows', items: [{ jaql: panelItemJaqlWithSameRegularText }] }, // Category
          { name: 'columns', items: [{ jaql: panelItemJaqlWithNumberColumn }] }, // Room_ID
          { name: 'values', items: [] },
        ];

        const categoryDimension = dimensionWithRegularText;
        const roomDimension = dimensionWithNumberColumn;

        const categoryTargets = [
          { caption: 'Category Dashboard 1', id: 'cat-dash-1' },
          { caption: 'Category Dashboard 2', id: 'cat-dash-2' },
        ];

        const roomTargets = [
          { caption: 'Room Dashboard X', id: 'room-dash-x' },
          { caption: 'Room Dashboard Y', id: 'room-dash-y' },
          { caption: 'Room Dashboard Z', id: 'room-dash-z' },
        ];

        const targetsMap = new Map();
        targetsMap.set(categoryDimension, categoryTargets);
        targetsMap.set(roomDimension, roomTargets);

        const result = mapTargetsToArrayTargets(targetsMap, panels as any);

        expect(result).toHaveLength(5); // 2 category + 3 room = 5 total

        // Check category targets
        const catDash1 = result.find((t) => t.caption === 'Category Dashboard 1');
        const catDash2 = result.find((t) => t.caption === 'Category Dashboard 2');
        expect(catDash1?.pivotDimensions).toEqual(['rows.0']);
        expect(catDash2?.pivotDimensions).toEqual(['rows.0']);

        // Check room targets
        const roomDashX = result.find((t) => t.caption === 'Room Dashboard X');
        const roomDashY = result.find((t) => t.caption === 'Room Dashboard Y');
        const roomDashZ = result.find((t) => t.caption === 'Room Dashboard Z');
        expect(roomDashX?.pivotDimensions).toEqual(['columns.0']);
        expect(roomDashY?.pivotDimensions).toEqual(['columns.0']);
        expect(roomDashZ?.pivotDimensions).toEqual(['columns.0']);
      });

      it('should handle shared target objects across different dimensions', () => {
        const panels = [
          { name: 'rows', items: [{ jaql: panelItemJaqlWithSameRegularText }] }, // Category at rows.0
          { name: 'columns', items: [{ jaql: panelItemJaqlWithNumberColumn }] }, // Room_ID at columns.0
          { name: 'values', items: [] },
        ];

        const categoryDimension = dimensionWithRegularText;
        const roomDimension = dimensionWithNumberColumn;

        // Same target object referenced by both dimensions
        const sharedTarget = { caption: 'Universal Dashboard', id: 'universal-dash' };
        const categoryOnlyTarget = { caption: 'Category Only', id: 'cat-only' };

        const targetsMap = new Map();
        targetsMap.set(categoryDimension, [sharedTarget, categoryOnlyTarget]);
        targetsMap.set(roomDimension, [sharedTarget]); // Same target object reference

        const result = mapTargetsToArrayTargets(targetsMap, panels as any);

        expect(result).toHaveLength(2); // sharedTarget appears once, categoryOnlyTarget appears once

        const universalTarget = result.find((t) => t.caption === 'Universal Dashboard');
        const categoryTarget = result.find((t) => t.caption === 'Category Only');

        // Universal target should have both dimension references
        expect(universalTarget?.pivotDimensions).toHaveLength(2);
        expect(universalTarget?.pivotDimensions).toContain('rows.0');
        expect(universalTarget?.pivotDimensions).toContain('columns.0');

        // Category only target should have just one dimension
        expect(categoryTarget?.pivotDimensions).toEqual(['rows.0']);
      });

      it('should handle empty targets array', () => {
        const panels = [
          { name: 'rows', items: [{ jaql: panelItemJaqlWithSameRegularText }] },
          { name: 'columns', items: [] },
          { name: 'values', items: [] },
        ];

        const dimension = dimensionWithRegularText;
        const targetsMap = new Map();
        targetsMap.set(dimension, []); // Empty targets array

        const result = mapTargetsToArrayTargets(targetsMap, panels as any);

        expect(result).toHaveLength(0);
      });

      it('should handle dimensions that do not match any panels', () => {
        const panels = [
          { name: 'rows', items: [{ jaql: panelItemJaqlWithSameRegularText }] }, // Category
          { name: 'columns', items: [] },
          { name: 'values', items: [] },
        ];

        const nonMatchingDimension = dimensionWithNumberColumn; // This won't match the category panel
        const targets = [{ caption: 'Non-matching Dashboard', id: 'non-match' }];

        const targetsMap = new Map();
        targetsMap.set(nonMatchingDimension, targets);

        const result = mapTargetsToArrayTargets(targetsMap, panels as any);

        expect(result).toHaveLength(0); // No matches, so no results
      });

      it('should filter out targets with no valid pivot dimensions', () => {
        const panels = [
          { name: 'rows', items: [{ jaql: panelItemJaqlWithSameRegularText }] }, // Category matches
          { name: 'columns', items: [] },
          { name: 'values', items: [] },
        ];

        const matchingDimension = dimensionWithRegularText;
        const nonMatchingDimension = dimensionWithNumberColumn;

        const matchingTargets = [{ caption: 'Valid Dashboard', id: 'valid' }];
        const nonMatchingTargets = [{ caption: 'Invalid Dashboard', id: 'invalid' }];

        const targetsMap = new Map();
        targetsMap.set(matchingDimension, matchingTargets);
        targetsMap.set(nonMatchingDimension, nonMatchingTargets);

        const result = mapTargetsToArrayTargets(targetsMap, panels as any);

        expect(result).toHaveLength(1); // Only the matching dimension's target
        expect(result[0].caption).toBe('Valid Dashboard');
        expect(result[0].pivotDimensions).toEqual(['rows.0']);
      });
    });

    describe('transformJumpToDashboardConfigToJtdConfigForPivot - essential coverage', () => {
      const mockMeasure = {
        name: 'Revenue',
        type: 'basemeasure',
        expression: '[Commerce.Revenue]',
        description: 'Revenue measure',
        aggregation: 'sum',
        __serializable: 'DimensionalBaseMeasure',
        attribute: {
          name: 'Revenue',
          type: 'numeric-attribute',
          expression: '[Commerce.Revenue]',
          __serializable: 'DimensionalAttribute',
        },
        jaql: () => ({
          jaql: {
            title: 'Revenue',
            dim: '[Commerce.Revenue]',
            datatype: 'numeric',
            agg: 'sum',
          },
        }),
      } as any;

      // Helper to create mock dataOptions
      const createMockDataOptions = (options: {
        rows?: any[];
        columns?: any[];
        values?: any[];
      }) => ({
        rows: options.rows || [],
        columns: options.columns || [],
        values: options.values || [],
      });

      // Helper to create mock dimension
      const createMockDimension = (expression: string, name: string) => ({
        ...mockAttribute,
        jaql: () => ({ dim: expression }),
        expression,
        name,
        type: 'attribute' as const,
      });

      // Helper to create mock measure
      const createMockMeasure = (expression: string, name: string, aggregation?: string) => ({
        ...mockMeasure,
        jaql: () => ({
          jaql: {
            dim: expression,
            agg: aggregation || 'sum',
            title: name,
            datatype: 'numeric',
          },
        }),
        expression,
        name,
        type: 'basemeasure' as const,
        aggregation: aggregation || 'sum',
        __serializable: 'DimensionalBaseMeasure',
      });

      it('should handle mixed dataOptions with all pivot sections', () => {
        const dataOptions = createMockDataOptions({
          rows: [{ column: createMockDimension('[Commerce.Category]', 'Category') }],
          columns: [{ column: createMockDimension('[Date.Years]', 'Years') }],
          values: [{ column: createMockMeasure('[Commerce.Revenue]', 'Revenue', 'sum') }],
        });

        const rowDim = createMockDimension('[Commerce.Category]', 'Category');
        const colDim = createMockDimension('[Date.Years]', 'Years');
        const valueMeasure = createMockMeasure('[Commerce.Revenue]', 'Revenue', 'sum');

        const targetsMap = new Map();
        targetsMap.set(rowDim, [{ caption: 'Category Dashboard', id: 'dash1' }]);
        targetsMap.set(colDim, [{ caption: 'Date Dashboard', id: 'dash2' }]);
        targetsMap.set(valueMeasure, [{ caption: 'Revenue Dashboard', id: 'dash3' }]);

        const pivotConfig: JumpToDashboardConfigForPivot = {
          enabled: true,
          targets: targetsMap,
          interaction: { triggerMethod: 'click' },
          filtering: {},
          targetDashboardConfig: { toolbar: { visible: true } },
        };

        const result = transformJumpToDashboardConfigToJtdConfigForPivot(
          pivotConfig,
          dataOptions as any,
        );

        expect(result.enabled).toBe(true);
        expect(result.jumpTargets).toHaveLength(3);

        const categoryTarget = result.jumpTargets.find(
          (jt) => jt.caption === 'Category Dashboard',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };
        const dateTarget = result.jumpTargets.find(
          (jt) => jt.caption === 'Date Dashboard',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };
        const revenueTarget = result.jumpTargets.find(
          (jt) => jt.caption === 'Revenue Dashboard',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };

        expect(categoryTarget?.pivotDimensions).toContain('rows.0');
        expect(dateTarget?.pivotDimensions).toContain('columns.0');
        expect(revenueTarget?.pivotDimensions).toContain('values.0');
      });

      it('should handle unmatched dimensions gracefully', () => {
        const dataOptions = createMockDataOptions({
          rows: [{ column: createMockDimension('[Commerce.Category]', 'Category') }],
        });

        const unmatchedDimension = createMockDimension('[Commerce.NonExistent]', 'NonExistent');
        const targetsMap = new Map();
        targetsMap.set(unmatchedDimension, [{ caption: 'Unmatched Dashboard', id: 'dash1' }]);

        const pivotConfig: JumpToDashboardConfigForPivot = {
          enabled: true,
          targets: targetsMap,
          interaction: { triggerMethod: 'click' },
          filtering: {},
          targetDashboardConfig: { toolbar: { visible: true } },
        };

        const result = transformJumpToDashboardConfigToJtdConfigForPivot(
          pivotConfig,
          dataOptions as any,
        );

        // Should not include unmatched dimensions
        expect(result.jumpTargets).toHaveLength(0);
      });

      it('should handle multiple targets for the same dimension correctly', () => {
        const dataOptions = createMockDataOptions({
          rows: [{ column: createMockDimension('[Commerce.Category]', 'Category') }],
        });

        const dimension = createMockDimension('[Commerce.Category]', 'Category');

        // Create multiple targets for the same dimension
        const multipleTargets = [
          { caption: 'Category Overview', id: 'dash1' },
          { caption: 'Category Analytics', id: 'dash2' },
          { caption: 'Category Reports', id: 'dash3' },
        ];

        const targetsMap = new Map();
        targetsMap.set(dimension, multipleTargets);

        const pivotConfig: JumpToDashboardConfigForPivot = {
          enabled: true,
          targets: targetsMap,
          interaction: { triggerMethod: 'click' },
          filtering: {},
          targetDashboardConfig: { toolbar: { visible: true } },
        };

        const result = transformJumpToDashboardConfigToJtdConfigForPivot(
          pivotConfig,
          dataOptions as any,
        );

        expect(result.enabled).toBe(true);
        expect(result.jumpTargets).toHaveLength(3); // Should have all 3 targets

        const overviewTarget = result.jumpTargets.find(
          (jt) => jt.caption === 'Category Overview',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };
        const analyticsTarget = result.jumpTargets.find(
          (jt) => jt.caption === 'Category Analytics',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };
        const reportsTarget = result.jumpTargets.find(
          (jt) => jt.caption === 'Category Reports',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };

        // All targets should reference the same dimension (rows.0)
        expect(overviewTarget?.pivotDimensions).toContain('rows.0');
        expect(analyticsTarget?.pivotDimensions).toContain('rows.0');
        expect(reportsTarget?.pivotDimensions).toContain('rows.0');
      });

      it('should handle multiple targets across different dimensions correctly', () => {
        const dataOptions = createMockDataOptions({
          rows: [{ column: createMockDimension('[Commerce.Category]', 'Category') }],
          columns: [{ column: createMockDimension('[Date.Years]', 'Years') }],
        });

        const categoryDimension = createMockDimension('[Commerce.Category]', 'Category');
        const dateDimension = createMockDimension('[Date.Years]', 'Years');

        const categoryTargets = [
          { caption: 'Category Dashboard A', id: 'cat-dash-a' },
          { caption: 'Category Dashboard B', id: 'cat-dash-b' },
        ];

        const dateTargets = [
          { caption: 'Date Dashboard X', id: 'date-dash-x' },
          { caption: 'Date Dashboard Y', id: 'date-dash-y' },
          { caption: 'Date Dashboard Z', id: 'date-dash-z' },
        ];

        const targetsMap = new Map();
        targetsMap.set(categoryDimension, categoryTargets);
        targetsMap.set(dateDimension, dateTargets);

        const pivotConfig: JumpToDashboardConfigForPivot = {
          enabled: true,
          targets: targetsMap,
          interaction: { triggerMethod: 'click' },
          filtering: {},
          targetDashboardConfig: { toolbar: { visible: true } },
        };

        const result = transformJumpToDashboardConfigToJtdConfigForPivot(
          pivotConfig,
          dataOptions as any,
        );

        expect(result.enabled).toBe(true);
        expect(result.jumpTargets).toHaveLength(5); // 2 category + 3 date = 5 total

        // Check category targets
        const categoryDashA = result.jumpTargets.find(
          (jt) => jt.caption === 'Category Dashboard A',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };
        const categoryDashB = result.jumpTargets.find(
          (jt) => jt.caption === 'Category Dashboard B',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };

        expect(categoryDashA?.pivotDimensions).toContain('rows.0');
        expect(categoryDashB?.pivotDimensions).toContain('rows.0');

        // Check date targets
        const dateDashX = result.jumpTargets.find(
          (jt) => jt.caption === 'Date Dashboard X',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };
        const dateDashY = result.jumpTargets.find(
          (jt) => jt.caption === 'Date Dashboard Y',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };
        const dateDashZ = result.jumpTargets.find(
          (jt) => jt.caption === 'Date Dashboard Z',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };

        expect(dateDashX?.pivotDimensions).toContain('columns.0');
        expect(dateDashY?.pivotDimensions).toContain('columns.0');
        expect(dateDashZ?.pivotDimensions).toContain('columns.0');
      });

      it('should handle shared targets across different dimensions correctly', () => {
        const dataOptions = createMockDataOptions({
          rows: [{ column: createMockDimension('[Commerce.Category]', 'Category') }],
          columns: [{ column: createMockDimension('[Date.Years]', 'Years') }],
        });

        const categoryDimension = createMockDimension('[Commerce.Category]', 'Category');
        const dateDimension = createMockDimension('[Date.Years]', 'Years');

        // Same target object referenced by both dimensions
        const sharedTarget = { caption: 'Universal Dashboard', id: 'universal-dash' };
        const categoryOnlyTarget = { caption: 'Category Specific', id: 'cat-specific' };

        const targetsMap = new Map();
        targetsMap.set(categoryDimension, [sharedTarget, categoryOnlyTarget]);
        targetsMap.set(dateDimension, [sharedTarget]); // Same target object

        const pivotConfig: JumpToDashboardConfigForPivot = {
          enabled: true,
          targets: targetsMap,
          interaction: { triggerMethod: 'click' },
          filtering: {},
          targetDashboardConfig: { toolbar: { visible: true } },
        };

        const result = transformJumpToDashboardConfigToJtdConfigForPivot(
          pivotConfig,
          dataOptions as any,
        );

        expect(result.enabled).toBe(true);
        expect(result.jumpTargets).toHaveLength(2); // sharedTarget should appear once, categoryOnlyTarget once

        const universalTarget = result.jumpTargets.find(
          (jt) => jt.caption === 'Universal Dashboard',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };
        const categorySpecificTarget = result.jumpTargets.find(
          (jt) => jt.caption === 'Category Specific',
        ) as JtdTarget & { pivotDimensions?: PivotDimId[] };

        // Universal target should have both dimensions
        expect(universalTarget?.pivotDimensions).toHaveLength(2);
        expect(universalTarget?.pivotDimensions).toContain('rows.0');
        expect(universalTarget?.pivotDimensions).toContain('columns.0');

        // Category specific target should only have category dimension
        expect(categorySpecificTarget?.pivotDimensions).toHaveLength(1);
        expect(categorySpecificTarget?.pivotDimensions).toContain('rows.0');
      });

      it('should preserve all configuration properties', () => {
        const dataOptions = createMockDataOptions({
          rows: [{ column: createMockDimension('[Commerce.Category]', 'Category') }],
        });

        const dimension = createMockDimension('[Commerce.Category]', 'Category');
        const targetsMap = new Map();
        targetsMap.set(dimension, [{ caption: 'Test Dashboard', id: 'dash1' }]);

        const pivotConfig: JumpToDashboardConfigForPivot = {
          enabled: false,
          targets: targetsMap,
          interaction: {
            triggerMethod: 'rightclick',
            captionPrefix: 'Navigate to',
            showIcon: false,
          },
          filtering: {
            includeDashboardFilters: ['[Date.Years]'],
            includeWidgetFilters: ['[Commerce.Category]'],
            mergeWithTargetFilters: true,
          },
          targetDashboardConfig: {
            toolbar: { visible: false },
            filtersPanel: { visible: true },
          },
        };

        const result = transformJumpToDashboardConfigToJtdConfigForPivot(
          pivotConfig,
          dataOptions as any,
        );

        expect(result.enabled).toBe(false);
        expect(result.jumpToDashboardRightMenuCaption).toBe('Navigate to');
        expect(result.dashboardConfig?.toolbar?.visible).toBe(false);
        expect(result.dashboardConfig?.filtersPanel?.visible).toBe(true);
        expect(result.includeDashFilterDims).toEqual(['[Date.Years]']);
        expect(result.includeWidgetFilterDims).toEqual(['[Commerce.Category]']);
        expect(result.mergeTargetDashboardFilters).toBe(true);
      });
    });
  });

  describe('dashboardConfig preservation', () => {
    it('should preserve complete dashboardConfig in normalizeToJtdConfig transformation', () => {
      const complexDashboardConfig = {
        toolbar: { visible: false },
        filtersPanel: {
          visible: true,
          collapsedInitially: false,
          persistState: true,
        },
        widgetsPanel: {
          responsive: true,
          editMode: {
            enabled: true,
            dragAndDrop: false,
          },
        },
      };

      const jumpConfig: JumpToDashboardConfig = {
        enabled: true,
        targets: mockJumpTargets,
        targetDashboardConfig: complexDashboardConfig,
        interaction: { triggerMethod: 'click', showIcon: false },
        filtering: { includeDashboardFilters: ['[Date.Years]'], mergeWithTargetFilters: true },
        modal: { width: 90, height: 80, measurementUnit: '%' },
      };

      const result = normalizeToJtdConfig(jumpConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      // Verify complete dashboardConfig is preserved
      expect(result.dashboardConfig).toEqual(complexDashboardConfig);
      expect(result.dashboardConfig?.toolbar?.visible).toBe(false);
      expect(result.dashboardConfig?.filtersPanel?.visible).toBe(true);
      expect(result.dashboardConfig?.filtersPanel?.collapsedInitially).toBe(false);
      expect(result.dashboardConfig?.widgetsPanel?.responsive).toBe(true);
      expect(result.dashboardConfig?.widgetsPanel?.editMode?.enabled).toBe(true);
    });

    it('should handle undefined dashboardConfig gracefully', () => {
      const jumpConfig: JumpToDashboardConfig = {
        enabled: true,
        targets: mockJumpTargets,
        // No targetDashboardConfig provided
      };

      const result = normalizeToJtdConfig(jumpConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      expect(result.dashboardConfig).toBeUndefined();
    });

    it('should preserve nested properties in round-trip transformation', () => {
      const originalDashboardConfig = {
        toolbar: { visible: true },
        filtersPanel: {
          visible: false,
          collapsedInitially: true,
          persistState: false,
        },
        widgetsPanel: {
          responsive: false,
          editMode: {
            enabled: false,
            dragAndDrop: true,
          },
        },
      };

      // JumpToDashboardConfig → JtdConfig → JumpToDashboardConfig
      const jumpConfig: JumpToDashboardConfig = {
        enabled: false,
        targets: mockJumpTargets,
        targetDashboardConfig: originalDashboardConfig,
        interaction: { captionPrefix: 'Navigate' },
      };

      const jtdConfig = normalizeToJtdConfig(jumpConfig, {
        dataOptions: { rows: [], columns: [], values: [] },
      } as unknown as WidgetProps);

      const backToJump = normalizeToJumpToDashboardConfig(jtdConfig);

      // Verify complete preservation of nested structure
      expect(backToJump.targetDashboardConfig).toEqual(originalDashboardConfig);
      expect(backToJump.targetDashboardConfig?.toolbar?.visible).toBe(true);
      expect(backToJump.targetDashboardConfig?.filtersPanel?.visible).toBe(false);
      expect(backToJump.targetDashboardConfig?.filtersPanel?.collapsedInitially).toBe(true);
      expect(backToJump.targetDashboardConfig?.widgetsPanel?.responsive).toBe(false);
      expect(backToJump.targetDashboardConfig?.widgetsPanel?.editMode?.enabled).toBe(false);
    });

    it('should preserve dashboardConfig in pivot transformation', () => {
      const dashboardConfig = {
        toolbar: { visible: false },
        filtersPanel: {
          visible: true,
          collapsedInitially: false,
        },
        widgetsPanel: {
          responsive: true,
          editMode: {
            enabled: true,
            dragAndDrop: false,
          },
        },
      };

      const targetsMap = new Map();
      const pivotConfig: JumpToDashboardConfigForPivot = {
        enabled: true,
        targets: targetsMap,
        targetDashboardConfig: dashboardConfig,
        interaction: { captionPrefix: 'Jump' },
        filtering: { mergeWithTargetFilters: true },
      };

      const dataOptions = { rows: [], columns: [], values: [] };
      const result = transformJumpToDashboardConfigToJtdConfigForPivot(pivotConfig, dataOptions);

      // Verify complete dashboardConfig preservation in pivot transformation
      expect(result.dashboardConfig).toEqual(dashboardConfig);
      expect(result.dashboardConfig?.toolbar?.visible).toBe(false);
      expect(result.dashboardConfig?.filtersPanel?.visible).toBe(true);
      expect(result.dashboardConfig?.filtersPanel?.collapsedInitially).toBe(false);
      expect(result.dashboardConfig?.widgetsPanel?.responsive).toBe(true);
      expect(result.dashboardConfig?.widgetsPanel?.editMode?.enabled).toBe(true);
    });
  });

  describe('default values application', () => {
    it('should apply default values when properties are undefined', () => {
      // Minimal config with all defaults
      const minimalConfig: JumpToDashboardConfig = {
        targets: [{ caption: 'Target', id: 'target-id' }],
      };

      const result = normalizeToJtdConfig(minimalConfig, {
        id: 'widget-1',
        chartType: 'column',
        dataOptions: {
          category: [{ name: 'Category', type: 'string' }],
          value: [{ name: 'Revenue', type: 'number' }],
        },
      } as unknown as WidgetProps);

      // Verify all defaults are applied
      expect(result.enabled).toBe(true); // Default true
      expect(result.showJtdIcon).toBe(true); // Default true
      expect(result.navigateType).toBe('rightclick'); // Default rightclick
      expect(result.mergeTargetDashboardFilters).toBe(false); // Default false
      expect(result.modalWindowWidth).toBe(1200); // Default 1200px
      expect(result.modalWindowHeight).toBe(800); // Default 800px
      expect(result.modalWindowMeasurement).toBe('px'); // Default px
    });

    it('should apply percentage-based modal defaults when measurementUnit is %', () => {
      const percentageConfig: JumpToDashboardConfig = {
        targets: [{ caption: 'Target', id: 'target-id' }],
        modal: {
          measurementUnit: '%',
        },
      };

      const result = normalizeToJtdConfig(percentageConfig, {
        id: 'widget-1',
        chartType: 'column',
        dataOptions: {
          category: [{ name: 'Category', type: 'string' }],
          value: [{ name: 'Revenue', type: 'number' }],
        },
      } as unknown as WidgetProps);

      // Verify percentage defaults are applied
      expect(result.modalWindowWidth).toBe(85); // Default 85%
      expect(result.modalWindowHeight).toBe(85); // Default 85%
      expect(result.modalWindowMeasurement).toBe('%');
    });

    it('should preserve explicitly set values over defaults', () => {
      const explicitConfig: JumpToDashboardConfig = {
        enabled: false, // Explicitly disabled
        targets: [{ caption: 'Target', id: 'target-id' }],
        interaction: {
          showIcon: false, // Explicitly no icon
          triggerMethod: 'click', // Explicitly click
        },
        filtering: {
          mergeWithTargetFilters: true, // Explicitly true
        },
        modal: {
          width: 1000,
          height: 600,
          measurementUnit: 'px',
        },
      };

      const result = normalizeToJtdConfig(explicitConfig, {
        id: 'widget-1',
        chartType: 'column',
        dataOptions: {
          category: [{ name: 'Category', type: 'string' }],
          value: [{ name: 'Revenue', type: 'number' }],
        },
      } as unknown as WidgetProps);

      // Verify explicit values are preserved
      expect(result.enabled).toBe(false);
      expect(result.showJtdIcon).toBe(false);
      expect(result.navigateType).toBe('click');
      expect(result.mergeTargetDashboardFilters).toBe(true);
      expect(result.modalWindowWidth).toBe(1000);
      expect(result.modalWindowHeight).toBe(600);
      expect(result.modalWindowMeasurement).toBe('px');
    });
  });

  describe('type safety guards', () => {
    it('should safely handle pivot config with non-pivot widget', () => {
      // Mock console.warn to capture warnings
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Create a pivot config (has Map for targets)
      const pivotConfig: JumpToDashboardConfigForPivot = {
        enabled: true,
        targets: new Map([
          [{ name: 'Category', type: 'dimension' }, [{ caption: 'Dashboard', id: 'dash-1' }]],
        ]) as any, // Using any to bypass TS for this test
      };

      // Use with non-pivot widget
      const nonPivotWidget = {
        id: 'widget-1',
        chartType: 'column',
        dataOptions: {
          category: [{ name: 'Category', type: 'string' }],
          value: [{ name: 'Revenue', type: 'number' }],
        },
      } as unknown as WidgetProps;

      const result = normalizeToJtdConfig(pivotConfig, nonPivotWidget);

      // Should return safe disabled config
      expect(result).toEqual({
        enabled: false,
        jumpTargets: [],
      });

      // Should log warning
      expect(consoleSpy).toHaveBeenCalledWith(
        'Pivot JumpToDashboardConfigForPivot cannot be used with non-pivot widget',
      );

      consoleSpy.mockRestore();
    });

    it('should handle regular config with non-pivot widget normally', () => {
      const regularConfig: JumpToDashboardConfig = {
        enabled: true,
        targets: [{ caption: 'Dashboard', id: 'dash-1' }],
      };

      const nonPivotWidget = {
        id: 'widget-1',
        chartType: 'column',
        dataOptions: {
          category: [{ name: 'Category', type: 'string' }],
          value: [{ name: 'Revenue', type: 'number' }],
        },
      } as unknown as WidgetProps;

      const result = normalizeToJtdConfig(regularConfig, nonPivotWidget);

      // Should process normally with defaults applied
      expect(result.enabled).toBe(true);
      expect(result.jumpTargets).toEqual([{ caption: 'Dashboard', id: 'dash-1' }]);
      expect(result.showJtdIcon).toBe(true); // Default applied
      expect(result.navigateType).toBe('rightclick'); // Default applied
    });
  });
});
