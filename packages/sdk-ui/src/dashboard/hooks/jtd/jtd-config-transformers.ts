import type {
  Attribute,
  CalculatedMeasureColumn,
  Column,
  Dimension,
  Measure,
  MeasureColumn,
} from '@sisense/sdk-data';

import { PivotTableDataOptions } from '@/chart-data-options/types';
import { WidgetProps } from '@/props';
import { StyledColumn, StyledMeasureColumn } from '@/types';
import { createPanelItem } from '@/widget-by-id/translate-widget-data-options';
import type { Panel, PanelItem } from '@/widget-by-id/types';
import { isPivotTableWidgetProps } from '@/widget-by-id/utils';

import type {
  JtdConfig,
  JtdTarget,
  JumpToDashboardConfig,
  JumpToDashboardConfigForPivot,
  PivotDimId,
  PivotDimType,
} from './jtd-types';

/**
 * Transform legacy JtdConfig to new JumpToDashboardConfig format
 *
 * @param jtdConfig - The legacy JTD configuration
 * @returns Transformed Jump To Dashboard configuration
 * @internal
 */
export const transformJtdConfigToJumpToDashboardConfig = (
  jtdConfig: JtdConfig,
): JumpToDashboardConfig => {
  // Use the existing jump targets (they're already JtdTarget[]) - create new array for immutability
  const targets: JtdTarget[] = [...jtdConfig.jumpTargets];

  return {
    enabled: jtdConfig.enabled,
    targets,
    interaction: {
      triggerMethod: jtdConfig.navigateType,
      captionPrefix: jtdConfig.jumpToDashboardRightMenuCaption,
      showIcon: jtdConfig.showJtdIcon,
    },
    targetDashboardConfig: jtdConfig.dashboardConfig ?? {},
    filtering: {
      extraFilters: jtdConfig.extraFilters ? [...jtdConfig.extraFilters] : [],
      includeDashboardFilters: jtdConfig.includeDashFilterDims,
      includeWidgetFilters: jtdConfig.includeWidgetFilterDims,
      mergeWithTargetFilters: jtdConfig.mergeTargetDashboardFilters,
    },
    modal: {
      width: jtdConfig.modalWindowWidth,
      height: jtdConfig.modalWindowHeight,
      measurementUnit: jtdConfig.modalWindowMeasurement,
    },
    // Note: Legacy fields drilledDashboardPrefix and modalWindowResize have no
    // representation in JumpToDashboardConfig and will be dropped on conversion.
    // normalizeToJtdConfig returns an input JtdConfig unchanged, but a round‑trip
    // (JtdConfig → JumpToDashboardConfig → JtdConfig) will not restore these fields.
  };
};

export const isPivotJumpToDashboardConfig = (
  config: JumpToDashboardConfig | JumpToDashboardConfigForPivot,
): config is JumpToDashboardConfigForPivot => {
  // if targets is a Map, it is a pivot config
  return !('targets' in config && Array.isArray(config.targets));
};

/**
 * Transform common part of public JumpToDashboardConfig to inner JtdConfig format
 *
 * @param jumpConfig - The new Jump To Dashboard configuration
 * @returns Transformed legacy JTD configuration
 * @internal
 */
export const transformJumpToDashboardConfigToJtdConfigCommon = (
  jumpConfig: JumpToDashboardConfig | JumpToDashboardConfigForPivot,
): Omit<JtdConfig, 'jumpTargets'> => {
  return {
    // Apply default values as documented in JSDoc
    enabled: jumpConfig?.enabled ?? true,
    navigateType: jumpConfig?.interaction?.triggerMethod ?? 'rightclick',
    jumpToDashboardRightMenuCaption: jumpConfig?.interaction?.captionPrefix,
    showJtdIcon: jumpConfig?.interaction?.showIcon ?? true,
    dashboardConfig: jumpConfig?.targetDashboardConfig,
    includeDashFilterDims: jumpConfig?.filtering?.includeDashboardFilters,
    includeWidgetFilterDims: jumpConfig?.filtering?.includeWidgetFilters,
    mergeTargetDashboardFilters: jumpConfig?.filtering?.mergeWithTargetFilters ?? false,
    // Apply modal defaults based on measurement unit
    modalWindowWidth:
      jumpConfig?.modal?.width ?? (jumpConfig.modal?.measurementUnit === '%' ? 85 : 1200),
    modalWindowHeight:
      jumpConfig?.modal?.height ?? (jumpConfig.modal?.measurementUnit === '%' ? 85 : 800),
    modalWindowMeasurement: jumpConfig?.modal?.measurementUnit ?? 'px',
    extraFilters: jumpConfig?.filtering?.extraFilters
      ? [...(jumpConfig?.filtering?.extraFilters || [])]
      : undefined,
  };
};

/**
 * Transform public JumpToDashboardConfig to inner JtdConfig format
 *
 * @param jumpConfig - The public Jump To Dashboard configuration
 * @returns Transformed legacy JTD configuration
 * @internal
 */
const transformJumpToDashboardConfigToJtdConfig = (
  jumpConfig: JumpToDashboardConfig,
): JtdConfig => {
  return {
    ...transformJumpToDashboardConfigToJtdConfigCommon(jumpConfig),
    jumpTargets: [...jumpConfig.targets],
  };
};

export const transformJumpToDashboardConfigToJtdConfigForPivot = (
  jumpConfig: JumpToDashboardConfigForPivot,
  dataOptions: PivotTableDataOptions,
): JtdConfig => {
  const rowPanelItems: PanelItem[] =
    dataOptions.rows?.map((row: StyledColumn | Column) => {
      return 'column' in row ? createPanelItem(row) : createPanelItem({ column: row });
    }) || [];

  const columnPanelItems: PanelItem[] =
    dataOptions.columns?.map((column: StyledColumn | Column) => {
      return 'column' in column ? createPanelItem(column) : createPanelItem({ column: column });
    }) || [];

  const valuePanelItems: PanelItem[] =
    dataOptions.values?.map(
      (value: StyledMeasureColumn | MeasureColumn | CalculatedMeasureColumn) => {
        return 'column' in value ? createPanelItem(value) : createPanelItem({ column: value });
      },
    ) || [];

  // Create Panel objects from PanelItems
  const panels: Panel[] = [
    { name: 'rows', items: rowPanelItems },
    { name: 'columns', items: columnPanelItems },
    { name: 'values', items: valuePanelItems },
  ].filter((panel) => panel.items.length > 0); // Only include panels that have items

  return {
    ...transformJumpToDashboardConfigToJtdConfigCommon(jumpConfig),
    jumpTargets: mapTargetsToArrayTargets(jumpConfig.targets, panels),
  };
};

/**
 * Type guard to check if a config is a JumpToDashboardConfig
 *
 * @param config - The configuration to check
 * @returns True if the config is a JumpToDashboardConfig
 * @internal
 */
export const isJumpToDashboardConfig = (
  config: JtdConfig | JumpToDashboardConfig | JumpToDashboardConfigForPivot,
): config is JumpToDashboardConfig | JumpToDashboardConfigForPivot => {
  return 'targets' in config && !('jumpTargets' in config);
};

/**
 * Normalize configuration to JumpToDashboardConfig format
 * Accepts both legacy JtdConfig and new JumpToDashboardConfig
 *
 * @internal
 * @param config - Either JtdConfig or JumpToDashboardConfig
 * @returns Normalized JumpToDashboardConfig
 */
export const normalizeToJumpToDashboardConfig = (
  config: JtdConfig | JumpToDashboardConfig,
): JumpToDashboardConfig => {
  if (isJumpToDashboardConfig(config)) {
    return config;
  }
  return transformJtdConfigToJumpToDashboardConfig(config);
};

/**
 * Normalize configuration to legacy JtdConfig format
 * Accepts both legacy JtdConfig and new JumpToDashboardConfig
 *
 * @internal
 * @param config - Either JtdConfig or JumpToDashboardConfig
 * @returns Normalized JtdConfig
 */
export const normalizeToJtdConfig = (
  config: JtdConfig | JumpToDashboardConfig | JumpToDashboardConfigForPivot,
  widgetProps: WidgetProps,
): JtdConfig => {
  if (!isJumpToDashboardConfig(config)) {
    return config;
  }
  if (isPivotTableWidgetProps(widgetProps)) {
    if (!isPivotJumpToDashboardConfig(config)) {
      console.warn('Config is not a pivot JumpToDashboardConfig');
      return {
        enabled: false,
        jumpTargets: [],
      };
    }

    return transformJumpToDashboardConfigToJtdConfigForPivot(config, widgetProps.dataOptions);
  }

  // Guard against pivot config being used with non-pivot widget
  if (isPivotJumpToDashboardConfig(config)) {
    console.warn('Pivot JumpToDashboardConfigForPivot cannot be used with non-pivot widget');
    return {
      enabled: false,
      jumpTargets: [],
    };
  }

  return transformJumpToDashboardConfigToJtdConfig(config);
};

// ============================================================================
// Map-based Pivot Transformation Utilities
// ============================================================================

/**
 * Enhanced matching strategy that considers location, expression, level, and other properties
 * @param dimension - The dimension or measure object
 * @param panels - Constructed panels with PanelItems
 * @returns PivotDimId like "columns.0", "rows.1", "values.0"
 * @internal
 */
export const dimensionToPivotDimId = (
  dimension: Attribute | Measure | { dimension: Attribute; location: 'row' | 'column' | 'value' },
  panels: Panel[],
): PivotDimId | null => {
  if ('dimension' in dimension && 'location' in dimension) {
    // Location-aware matching: search in specific panel
    return findDimensionInPanel(dimension.dimension, dimension.location, panels);
  }

  // Search across all panels for best match
  return findDimensionInAllPanels(dimension, panels);
};

/**
 * Find dimension in a specific panel based on location
 */
const findDimensionInPanel = (
  dimension: Attribute | Measure,
  location: 'row' | 'column' | 'value',
  panels: Panel[],
): PivotDimId | null => {
  const panelName = location === 'row' ? 'rows' : location === 'column' ? 'columns' : 'values';
  const targetPanel = panels.find((p) => p.name === panelName);

  if (!targetPanel) return null;

  const itemIndex = findDimensionInItems(dimension, targetPanel.items);
  return itemIndex !== -1 ? (`${panelName}.${itemIndex}` as PivotDimId) : null;
};

/**
 * Search for dimension across all panels
 */
const findDimensionInAllPanels = (
  dimension: Attribute | Measure,
  panels: Panel[],
): PivotDimId | null => {
  for (const panel of panels) {
    const itemIndex = findDimensionInItems(dimension, panel.items);
    if (itemIndex !== -1) {
      return `${panel.name}.${itemIndex}` as PivotDimId;
    }
  }
  return null;
};

/**
 * Find the panel item that corresponds to a dimension
 * Returns the index of the first matching item or -1 if not found
 */
const findDimensionInItems = (dimension: Attribute | Measure, items: PanelItem[]): number => {
  for (let i = 0; i < items.length; i++) {
    if (isDimensionForPanelItem(dimension, items[i])) {
      return i;
    }
  }

  return -1;
};

/**
 * Check if a dimension corresponds to a specific panel item
 */
const isDimensionForPanelItem = (dimension: Attribute | Measure, panelItem: PanelItem): boolean => {
  const dim = dimension as (Attribute | Measure) & {
    type?: string;
    expression?: string;
    granularity?: string;
    aggregation?: string;
    attribute?: { expression?: string; granularity?: string };
  };
  const jaql = panelItem.jaql as {
    formula?: string;
    dim?: string;
    agg?: string;
    level?: string;
    title?: string;
  };

  // Formula/Calculated Measure
  if (dim.type === 'calculatedmeasure' && jaql.formula) {
    return dim.expression === jaql.formula;
  }

  // Base Measure (sum, count, etc.)
  if (dim.type === 'basemeasure' && jaql.agg) {
    const attributeExpression = dim.attribute?.expression;
    if (attributeExpression && jaql.dim) {
      // Verify aggregation type
      const aggregationMatches =
        !dim.aggregation ||
        dim.aggregation === jaql.agg ||
        (dim.aggregation === 'countDistinct' && jaql.agg === 'count');

      // For date-based measures, also check level
      if (dim.attribute?.granularity && jaql.level) {
        const levelMatches = dim.attribute.granularity.toLowerCase() === jaql.level.toLowerCase();
        return attributeExpression === jaql.dim && aggregationMatches && levelMatches;
      }

      return attributeExpression === jaql.dim && aggregationMatches;
    }
  }

  // Date Level Attribute (Days, Months, Years)
  if (dim.type === 'datelevel' && jaql.level) {
    const expressionMatches = dim.expression === jaql.dim;
    const levelMatches = dim.granularity?.toLowerCase() === jaql.level?.toLowerCase();
    return expressionMatches && levelMatches;
  }

  // Regular Attribute (text, numeric)
  if ((dim.type === 'text-attribute' || dim.type === 'numeric-attribute') && jaql.dim) {
    return dim.expression === jaql.dim;
  }

  // Generic Attribute (fallback)
  if (dim.expression && jaql.dim && !jaql.agg && !jaql.formula) {
    return dim.expression === jaql.dim;
  }

  return false;
};

/**
 * Convert PivotDimId back to Dimension/Measure using widget structure
 * @param pivotDimId - PivotDimId like "columns.0", "rows.1", "values.0"
 * @param widgetStructure - Widget structure with rows/columns/values arrays
 * @returns The dimension or measure object, or null if not found
 * @internal
 */
export const pivotDimIdToDimension = (
  pivotDimId: PivotDimId,
  widgetStructure: {
    rows?: Array<Dimension | Measure>;
    columns?: Array<Dimension | Measure>;
    values?: Array<Dimension | Measure>;
  },
): Dimension | Measure | null => {
  const [arrayName, indexStr] = pivotDimId.split('.') as [PivotDimType, string];
  const index = parseInt(indexStr, 10);

  const array = widgetStructure[arrayName];
  if (!array || index < 0 || index >= array.length) {
    return null;
  }

  return array[index];
};

/**
 * Convert Map-based pivot targets to array-based pivot targets (for internal JtdConfig)
 * @param targetsMap - Map of dimensions/measures to targets
 * @param panels - Widget metadata panels (source of truth for dimension positions)
 * @returns Array of targets with pivotDimensions
 * @internal
 */
export const mapTargetsToArrayTargets = (
  targetsMap: Map<
    Attribute | { dimension: Attribute; location: 'row' | 'column' | 'value' } | Measure,
    JtdTarget[]
  >,
  panels: Panel[],
): Array<JtdTarget & { pivotDimensions?: PivotDimId[] }> => {
  // Accumulate final targets
  const out: Array<JtdTarget & { pivotDimensions?: PivotDimId[] }> = [];

  // Group by stable structural key
  const targetGroups = new Map<string, { target: JtdTarget; dims: PivotDimId[] }>();
  for (const [dimension, targetList] of targetsMap) {
    // Use enhanced matching strategy that considers location, level, expression, etc.
    const pivotDimId = dimensionToPivotDimId(dimension, panels);
    if (!pivotDimId) {
      continue; // Skip dimensions that don't match any panel
    }

    for (const target of targetList) {
      const key = JSON.stringify(target);
      const entry = targetGroups.get(key) ?? { target, dims: [] };
      if (!entry.dims.includes(pivotDimId)) {
        entry.dims.push(pivotDimId);
      }
      targetGroups.set(key, entry);
    }
  }

  // Convert grouped entries to the output array
  for (const { target, dims } of targetGroups.values()) {
    out.push({
      ...target,
      pivotDimensions: dims.length ? dims : undefined,
    });
  }

  return out;
};
