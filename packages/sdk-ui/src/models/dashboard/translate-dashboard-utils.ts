import {
  CascadingFilter,
  createDimensionalElementFromJaql,
  createFilterFromJaql,
  Dimension,
  Filter,
  FilterRelations,
  FilterRelationsModel,
  FilterRelationsModelNode,
  FormulaContext,
  FormulaJaql,
  Measure,
  MetadataTypes,
} from '@sisense/sdk-data';

import { RestApi } from '@/api/rest-api';
import { CommonFiltersApplyMode } from '@/common-filters/types';
import {
  JtdTarget,
  JumpToDashboardConfig,
  JumpToDashboardConfigForPivot,
  TriggerMethod,
} from '@/dashboard/hooks/jtd/jtd-types';
import { TabberConfig, TabbersConfig } from '@/dashboard/hooks/use-tabber';
import {
  combineFiltersAndRelations,
  convertFilterRelationsModelToRelationRules,
  isTrivialSingleNodeRelations,
} from '@/utils/filter-relations';
import {
  isJaqlWithFormula,
  isSharedFormulaReferenceContext,
  Panel,
  PanelItem,
  SharedFormulaReferenceContext,
  WidgetDto,
} from '@/widget-by-id/types';
import { TabberWidgetDtoStyle } from '@/widget-by-id/types';
import {
  isChartTypeFusionWidget,
  isIndicatorFusionWidget,
  isPieChartFusionWidget,
  isPivotTableFusionWidget,
  isTextFusionWidget,
  widgetTypeSupportsJtd,
} from '@/widget-by-id/utils';

import {
  type CascadingFilterDto,
  DashboardDto,
  type FilterDto,
  isCascadingFilterDto,
  type LayoutDto,
} from '../../api/types/dashboard-dto';
import type { WidgetsOptions, WidgetsPanelColumnLayout } from './types';

export const translateLayout = (layout: LayoutDto): WidgetsPanelColumnLayout => ({
  columns: (layout.columns || []).map((c) => ({
    widthPercentage: c.width,
    rows: (c.cells || []).map((cell) => {
      const totalWidth = cell.subcells.reduce((acc, subcell) => acc + subcell.width, 0);

      return {
        cells: cell.subcells.map((subcell) => ({
          // If the total width of the subcells is less than 100, we increase width percentage to make the subcells fill the column
          widthPercentage: totalWidth < 100 ? subcell.width / (totalWidth / 100) : subcell.width,
          height: subcell.elements[0].height,
          widgetId: subcell.elements[0].widgetid,
          minWidth: subcell.elements[0].minWidth,
          maxWidth: subcell.elements[0].maxWidth,
          minHeight: subcell.elements[0].minHeight,
          maxHeight: subcell.elements[0].maxHeight,
        })),
      };
    }),
  })),
});

const createFilterFromFilterDto = (filterDto: FilterDto): Filter => {
  const filter: Filter = createFilterFromJaql(
    filterDto.jaql,
    filterDto.instanceid,
    filterDto.disabled,
    filterDto.locked,
  );
  return filter;
};

const createFilterFromCascadingFilterDto = (
  cascadingFilterDto: CascadingFilterDto,
): CascadingFilter => {
  const { levels, instanceid, disabled, locked } = cascadingFilterDto;

  const innerFilters = levels.map((level) => createFilterFromJaql(level, level.instanceid));
  return new CascadingFilter(innerFilters, { guid: instanceid, disabled, locked });
};

export function extractDashboardFilters(
  dashboardFilters: Array<FilterDto | CascadingFilterDto>,
  filterRelationsModel?: FilterRelationsModel | FilterRelationsModelNode,
): Filter[] | FilterRelations {
  const filters = dashboardFilters.map((f) =>
    isCascadingFilterDto(f) ? createFilterFromCascadingFilterDto(f) : createFilterFromFilterDto(f),
  );
  if (!filterRelationsModel) {
    return filters;
  }
  const filterRelations = convertFilterRelationsModelToRelationRules(filterRelationsModel, filters);
  if (!filterRelations || isTrivialSingleNodeRelations(filterRelations)) {
    return filters;
  }
  return combineFiltersAndRelations(filters, filterRelations);
}

/**
 * Type guard to check if a widget DTO is a Tabber widget.
 * Checks the DTO subtype which is 'WidgetsTabber' in Fusion.
 * Note: This is the DTO type, not the CSDK component type ('tabber-buttons').
 */
const isTabberWidgetDto = (
  widget: WidgetDto,
): widget is WidgetDto & { style: TabberWidgetDtoStyle } => {
  return widget.subtype === 'WidgetsTabber';
};

const translateNavigateType = (navigateType: number): TriggerMethod => {
  switch (navigateType) {
    case 1:
      return 'rightclick';
    case 2:
      // Legacy PIVOT_LINK - mapped to CLICK for backward compatibility
      return 'click';
    case 3:
      return 'click';
    case 4:
      // Legacy BLOX - mapped to CLICK for backward compatibility
      return 'click';
    default:
  }
  console.warn(`Unknown navigate type: ${navigateType}, using CLICK instead`);
  return 'click';
};

export const getJtdNavigateType = (widget: WidgetDto): TriggerMethod => {
  const jtdConfigDto = widget.drillToDashboardConfig;
  if (!jtdConfigDto) {
    // default one
    return 'rightclick';
  }

  if (isPivotTableFusionWidget(widget.type)) {
    return translateNavigateType(jtdConfigDto.drillToDashboardNavigateTypePivot);
  }

  if (isPieChartFusionWidget(widget.type)) {
    const chartCategories = widget.metadata?.panels.find((p) => p.name === 'categories');
    const isPieChartWithoutCategories = (chartCategories?.items?.length || 0) === 0;
    if (isPieChartWithoutCategories) {
      return 'click';
    }
  }
  if (isChartTypeFusionWidget(widget.type)) {
    return translateNavigateType(jtdConfigDto.drillToDashboardNavigateTypeCharts);
  }
  if (isIndicatorFusionWidget(widget.type) || isTextFusionWidget(widget.type)) {
    return 'click';
  }
  return 'rightclick';
};

export const convertDimensionsToDimIndexes = (widget: WidgetDto, dimensionIds: string[]) => {
  const columns = widget.metadata?.panels.find((p) => p.name === 'columns');
  const rows = widget.metadata?.panels.find((p) => p.name === 'rows');
  const values = widget.metadata?.panels.find((p) => p.name === 'values');

  return dimensionIds.map((dimensionId) => {
    const columnsIndex = columns?.items?.findIndex((item) => item.instanceid === dimensionId);
    if (columnsIndex !== undefined && columnsIndex !== -1) {
      return `columns.${columnsIndex}`;
    }
    const rowsIndex = rows?.items?.findIndex((item) => item.instanceid === dimensionId);
    if (rowsIndex !== undefined && rowsIndex !== -1) {
      return `rows.${rowsIndex}`;
    }
    const valuesIndex = values?.items?.findIndex((item) => item.instanceid === dimensionId);
    if (valuesIndex !== undefined && valuesIndex !== -1) {
      return `values.${valuesIndex}`;
    }
    console.warn(
      `Error converting JTD config: Dimension ${dimensionId} not found in widget ${widget.oid}`,
    );
    return dimensionId;
  });
};

const translateToJtdConfig = (
  widget: WidgetDto,
): JumpToDashboardConfig | JumpToDashboardConfigForPivot | undefined => {
  const jtdConfigDto = widget.drillToDashboardConfig;
  if (!jtdConfigDto) {
    return undefined;
  }
  if (!widgetTypeSupportsJtd(widget.type)) {
    return undefined;
  }
  // in fusion, '%' is default value, so we translate fusion dto with '%' by default
  const measurement = jtdConfigDto.modalWindowMeasurement || '%';
  const PartialJumpToDashboardConfig: Omit<JumpToDashboardConfig, 'targets'> = {
    enabled: typeof jtdConfigDto.enabled === 'boolean' ? jtdConfigDto.enabled : true,
    filtering: {},
    targetDashboardConfig: {
      toolbar: {
        visible: jtdConfigDto.displayToolbarRow || false,
      },
      filtersPanel: {
        visible: jtdConfigDto.displayFilterPane || false,
      },
    },
    modal: {
      height: jtdConfigDto.modalWindowHeight || (measurement === '%' ? 85 : 800),
      width: jtdConfigDto.modalWindowWidth || (measurement === '%' ? 85 : 1200),
      measurementUnit: measurement,
    },
    interaction: {
      triggerMethod: getJtdNavigateType(widget),
      showIcon: typeof jtdConfigDto.showJTDIcon === 'boolean' ? jtdConfigDto.showJTDIcon : true,
      captionPrefix: jtdConfigDto.drillToDashboardRightMenuCaption || 'Jump to',
    },
  };

  if (isPivotTableFusionWidget(widget.type)) {
    return {
      ...PartialJumpToDashboardConfig,
      targets:
        extractPivotTargetsConfigFromWidgetDto(widget) ||
        new Map<
          Dimension | { dimension: Dimension; location: 'row' | 'column' | 'value' } | Measure,
          JtdTarget[]
        >(),
    };
  }
  return {
    ...PartialJumpToDashboardConfig,
    targets: jtdConfigDto.dashboardIds.map(
      (drillTarget) =>
        ({
          caption: drillTarget.caption,
          id: drillTarget.id,
        } as JtdTarget),
    ),
  };
};

/**
 * Extract pivot targets configuration from widget DTO and build Map-based targets
 * @param widget - Widget DTO with drillToDashboardConfig
 * @returns Map of dimensions/measures to their targets or undefined if no targets found
 * @internal
 */
export function extractPivotTargetsConfigFromWidgetDto(widget: WidgetDto):
  | Map<
      | Dimension
      | {
          dimension: Dimension;
          location: 'row' | 'column' | 'value';
        }
      | Measure,
      JtdTarget[]
    >
  | undefined {
  const jtdConfigDto = widget.drillToDashboardConfig;
  if (!jtdConfigDto || !jtdConfigDto.dashboardIds || jtdConfigDto.dashboardIds.length === 0) {
    return undefined;
  }

  const targets = new Map<
    | Dimension
    | {
        dimension: Dimension;
        location: 'row' | 'column' | 'value';
      }
    | Measure,
    JtdTarget[]
  >();
  // Cache dimension objects by instanceId to ensure same object reference for same dimension
  const dimensionCache = new Map<
    string,
    | Dimension
    | {
        dimension: Dimension;
        location: 'row' | 'column' | 'value';
      }
    | Measure
  >();

  // Process each drill target
  jtdConfigDto.dashboardIds.forEach((drillTarget) => {
    const jtdTarget: JtdTarget = {
      caption: drillTarget.caption,
      id: drillTarget.id || drillTarget.oid || '',
    };

    // Check if this is a pivot target with pivotDimensions
    if ('pivotDimensions' in drillTarget && drillTarget.pivotDimensions) {
      drillTarget.pivotDimensions.forEach((pivotDimensionId) => {
        // Check cache first to ensure same object reference for same dimension
        let dimensionObj = dimensionCache.get(pivotDimensionId);

        if (!dimensionObj) {
          // Find and convert the panel item to Dimension/Measure
          dimensionObj = findDimensionByInstanceId(widget.metadata.panels, pivotDimensionId);
          if (dimensionObj) {
            dimensionCache.set(pivotDimensionId, dimensionObj);
          }
        }

        if (dimensionObj) {
          // Add target to existing array or create new array
          const existingTargets = targets.get(dimensionObj) || [];
          existingTargets.push(jtdTarget);
          targets.set(dimensionObj, existingTargets);
        } else {
          console.warn(
            `Could not find dimension with instanceId: ${pivotDimensionId} in widget panels`,
          );
        }
      });
    } else {
      // Non-pivot target - this shouldn't happen for pivot widgets but handle gracefully
      console.warn('Pivot widget has drill target without pivotDimensions:', drillTarget);
    }
  });

  return targets;
}

export function translateWidgetsOptions(widgets: WidgetDto[] = []): WidgetsOptions {
  const widgetsOptionsMap: WidgetsOptions = {};

  widgets.forEach((widget: WidgetDto) => {
    // Safely translate JTD config, avoiding non-null assertion
    const jtd: JumpToDashboardConfig | JumpToDashboardConfigForPivot | undefined =
      widget?.drillToDashboardConfig && widget.drillToDashboardConfig.version
        ? translateToJtdConfig(widget)
        : undefined;

    widgetsOptionsMap[widget.oid] = {
      filtersOptions: {
        applyMode:
          widget.options?.dashboardFiltersMode === 'filter'
            ? CommonFiltersApplyMode.FILTER
            : CommonFiltersApplyMode.HIGHLIGHT,
        shouldAffectFilters: widget.options?.selector,
        ignoreFilters: {
          all: widget.metadata.ignore?.all,
          ids: widget.metadata.ignore?.ids,
        },
        forceApplyBackgroundFilters: true,
      },
      ...(jtd ? { jtdConfig: jtd } : {}),
    };
  });

  return widgetsOptionsMap;
}

export function translateTabbersOptions(widgets: WidgetDto[] = []): TabbersConfig {
  const tabberOptionsMap: Record<string, TabberConfig> = {};

  widgets.forEach((widget: WidgetDto) => {
    if (isTabberWidgetDto(widget)) {
      const dtoTabs = widget.style.tabs || [];
      tabberOptionsMap[widget.oid] = {
        tabs: dtoTabs.map((tab) => ({
          displayWidgetIds: tab.displayWidgetIds,
        })),
      };
    }
  });

  return tabberOptionsMap;
}

/**
 * Replace all shared formulas, which defined by id references, in the dashboard with their actual values.
 *
 * @param dashboard - The dashboard DTO to replace shared formulas in
 * @param api - The REST API instance
 * @returns The dashboard DTO with shared formulas, defined by id references, replaced
 * @internal
 */
export async function withSharedFormulas(
  dashboard: DashboardDto,
  api: RestApi,
): Promise<DashboardDto> {
  // collect shared formulas ids from all widgets
  const sharedFormulasIds = getSharedFormulas(dashboard.widgets || []);
  if (sharedFormulasIds.length === 0) {
    return dashboard;
  }
  // load all shared formulas in parallel
  const sharedFormulasDictionary = await api.getSharedFormulas(sharedFormulasIds);
  // return dashboard with widgets updated with shared formulas
  return {
    ...dashboard,
    widgets: dashboard.widgets?.map((widget) =>
      applySharedFormulas(widget, sharedFormulasDictionary),
    ),
  };
}

/**
 * Extracts unique shared formulas ids from widgets
 *
 * @param widgets - An array of widgets to extract shared formulas from
 * @returns An array of unique shared formulas ids
 * @internal
 */
function getSharedFormulas(widgets: WidgetDto[]): string[] {
  const sharedFormulas = widgets.flatMap((widget) =>
    widget.metadata.panels.flatMap((panel) =>
      panel.items.flatMap((item) => {
        if (!isJaqlWithFormula(item.jaql) || !item.jaql.context) return [];
        const formulaContexts: (FormulaContext | SharedFormulaReferenceContext)[] = Object.values(
          item.jaql.context,
        );
        return formulaContexts.filter(isSharedFormulaReferenceContext).map((ctx) => ctx.formulaRef);
      }),
    ),
  );

  return Array.from(new Set(sharedFormulas));
}

/**
 * Applies shared formulas to a widget
 *
 * @param widget - The widget to apply shared formulas to
 * @param sharedFormulasDictionary - A dictionary of shared formulas
 * @returns The widget with shared formulas applied
 * @internal
 */
function applySharedFormulas(
  widget: WidgetDto,
  sharedFormulasDictionary: Record<string, FormulaJaql>,
): WidgetDto {
  const updatedPanels = widget.metadata.panels.map((panel) => {
    const updatedPanelItems = panel.items.map((panelItem) => {
      const { jaql } = panelItem;
      if (!isJaqlWithFormula(jaql) || !jaql.context) {
        return panelItem;
      }

      const newContext = Object.fromEntries(
        Object.entries(jaql.context).map(([key, value]) =>
          isSharedFormulaReferenceContext(value)
            ? [key, sharedFormulasDictionary[value.formulaRef]]
            : [key, value],
        ),
      );

      return {
        ...panelItem,
        jaql: {
          ...jaql,
          context: newContext,
        },
      };
    });

    return { ...panel, items: updatedPanelItems };
  });

  return {
    ...widget,
    metadata: {
      ...widget.metadata,
      panels: updatedPanels,
    },
  };
}

/**
 * Find dimension or measure by instanceId in widget panels and convert to proper type
 * @param panels - Widget metadata panels to search
 * @param pivotDimension - Instance ID to find, this is not a PivotDimId, it is the instanceId of the dimension or measure
 * @returns Dimension/Measure object with optional location info or undefined if not found
 * @internal
 */
export function findDimensionByInstanceId(
  panels: Panel[],
  pivotDimension: string,
):
  | Dimension
  | Measure
  | {
      dimension: Dimension;
      location: 'row' | 'column' | 'value';
    }
  | undefined {
  // Find the panel item by instanceid
  for (const panel of panels) {
    const item: PanelItem | undefined = panel.items.find(
      (item) => item.instanceid === pivotDimension,
    );
    if (item) {
      // Create the dimension/measure object from JAQL - this is the key conversion
      const element = createDimensionalElementFromJaql(item.jaql);

      // Determine the location based on panel name
      const panelName = panel.name || item.panel;

      // For rows and columns panels, return with location info for dimensions only
      if (panelName === 'rows' && MetadataTypes.isAttribute(element)) {
        return { dimension: element as Dimension, location: 'row' };
      } else if (panelName === 'columns' && MetadataTypes.isAttribute(element)) {
        return { dimension: element as Dimension, location: 'column' };
      }

      // For all other cases (values/measures, filters, or measures in rows/columns),
      // return the element directly without location info
      return element as Dimension | Measure;
    }
  }

  return undefined;
}
