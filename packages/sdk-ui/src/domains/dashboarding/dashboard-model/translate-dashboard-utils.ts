import {
  CascadingFilter,
  createDimensionalElementFromJaql,
  createFilterFromJaql,
  Dimension,
  Filter,
  filterFactory,
  FilterRelations,
  FormulaContext,
  FormulaJaql,
  isMembersFilter,
  Measure,
  MetadataTypes,
} from '@sisense/sdk-data';
import flow from 'lodash-es/flow';

import { CommonFiltersApplyMode } from '@/domains/dashboarding/common-filters/types';
import { dimensionToPivotDimId } from '@/domains/dashboarding/hooks/jtd/jtd-config-transformers';
import {
  isJumpTargetWithId,
  JtdTarget,
  JumpToDashboardConfig,
  JumpToDashboardConfigForPivot,
  TriggerMethod,
} from '@/domains/dashboarding/hooks/jtd/jtd-types';
import type {
  JtdConfigDto,
  JtdPivotTargetDto,
  JtdTargetDto,
} from '@/domains/dashboarding/hooks/jtd/jtd-types';
import { TabberConfig, TabbersConfig } from '@/domains/dashboarding/hooks/use-tabber';
import {
  applyPartialDtoStyle,
  extractUnsupportedStyleOptions,
} from '@/domains/widgets/components/widget-by-id/translate-widget-style-options/index.js';
import {
  isJaqlWithFormula,
  isSharedFormulaReferenceContext,
  Panel,
  PanelItem,
  SharedFormulaReferenceContext,
  TabberWidgetDto,
  WidgetDashboardFilterMode,
  WidgetDto,
} from '@/domains/widgets/components/widget-by-id/types';
import {
  isChartTypeFusionWidget,
  isIndicatorFusionWidget,
  isPieChartFusionWidget,
  isPivotTableFusionWidget,
  isTextFusionWidget,
  widgetTypeSupportsJtd,
} from '@/domains/widgets/components/widget-by-id/utils';
import { RestApi } from '@/infra/api/rest-api';
import {
  type CascadingFilterDto,
  DashboardDto,
  type FilterDto,
  isCascadingFilterDto,
  type LayoutDto,
} from '@/infra/api/types/dashboard-dto';
import {
  combineFiltersAndRelations,
  convertFilterRelationsModelToRelationRules,
  isTrivialSingleNodeRelations,
} from '@/shared/utils/filter-relations';

import type { SpecificWidgetOptions, WidgetsOptions, WidgetsPanelColumnLayout } from './types';

type WidgetJtdDtoSlice = Pick<WidgetDto, 'oid' | 'type' | 'metadata' | 'drillToDashboardConfig'>;

/** Default width (100%) when Fusion omits it for a single-widget subcell. */
const DEFAULT_SUBCELL_WIDTH = 100;

export const translateLayout = (layout: LayoutDto): WidgetsPanelColumnLayout => ({
  columns: (layout.columns || []).map((c) => ({
    widthPercentage: c.width,
    rows: (c.cells || []).map((cell) => {
      const totalWidth = cell.subcells.reduce(
        (acc, subcell) => acc + (subcell.width ?? DEFAULT_SUBCELL_WIDTH),
        0,
      );

      return {
        cells: cell.subcells.map((subcell) => {
          const effectiveWidth = subcell.width ?? DEFAULT_SUBCELL_WIDTH;
          return {
            // If the total width of the subcells is less than 100, we increase width percentage to make the subcells fill the column
            widthPercentage:
              totalWidth > 0 && totalWidth < 100
                ? effectiveWidth / (totalWidth / 100)
                : effectiveWidth,
            height: subcell.elements[0].height,
            widgetId: subcell.elements[0].widgetid,
            minWidth: subcell.elements[0].minWidth,
            maxWidth: subcell.elements[0].maxWidth,
            minHeight: subcell.elements[0].minHeight,
            maxHeight: subcell.elements[0].maxHeight,
          };
        }),
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
  // sdk-data maps `{ all: true }` to an empty include (`excludeMembers: false`),
  // which FilterWidget shows as "Set filter". Remap to inverted select-all here so the
  // dashboard selection behavior remains consistent without changing sdk-data.
  const clause = filterDto.jaql?.filter as { all?: boolean } | undefined;
  return clause?.all ? asFilterWidgetSelectAll(filter) : filter;
};

/**
 * Converts a cleared-include MembersFilter into FilterWidget select-all
 * (`excludeMembers: true`, empty list). No-op for non-members / non-empty filters.
 * @param filter - Filter produced by JAQL translation
 * @returns Select-all MembersFilter when the input was a cleared include; otherwise `filter`
 * @internal
 */
function asFilterWidgetSelectAll(filter: Filter): Filter {
  if (!isMembersFilter(filter) || filter.members.length > 0 || filter.config.excludeMembers) {
    return filter;
  }
  return filterFactory.members(filter.attribute, [], {
    guid: filter.config.guid,
    disabled: filter.config.disabled,
    locked: filter.config.locked,
    enableMultiSelection: filter.config.enableMultiSelection,
    excludeMembers: true,
    deactivatedMembers: filter.config.deactivatedMembers,
    ...(filter.config.backgroundFilter ? { backgroundFilter: filter.config.backgroundFilter } : {}),
  });
}

const createFilterFromCascadingFilterDto = (
  cascadingFilterDto: CascadingFilterDto,
): CascadingFilter => {
  const { levels, instanceid, disabled, locked } = cascadingFilterDto;

  const innerFilters = levels.map((level) => {
    const filter = createFilterFromJaql(level, level.instanceid);
    const clause = level.filter as { all?: boolean } | undefined;
    return clause?.all ? asFilterWidgetSelectAll(filter) : filter;
  });
  return new CascadingFilter(innerFilters, { guid: instanceid, disabled, locked });
};

export function extractDashboardFilters(
  dashboardFilters: Array<FilterDto | CascadingFilterDto>,
  filterRelationsDtoOptions?: DashboardDto['filterRelations'],
): Filter[] | FilterRelations {
  const filters = dashboardFilters.map((f) =>
    isCascadingFilterDto(f) ? createFilterFromCascadingFilterDto(f) : createFilterFromFilterDto(f),
  );
  if (!filterRelationsDtoOptions?.length) {
    return filters;
  }

  // Fusion stores one filter-relations group per entry; top-level combination is always AND.
  // Convert each entry and AND them together to reconstruct the full dashboard relations.
  const allRules = filterRelationsDtoOptions
    .map(({ filterRelations: model }) => convertFilterRelationsModelToRelationRules(model, filters))
    .filter((rules): rules is NonNullable<typeof rules> => rules !== null);

  // Return a flat array when no explicit non-trivial relations exist (avoids spurious filter-relations tile).
  if (allRules.length === 0 || allRules.every(isTrivialSingleNodeRelations)) {
    return filters;
  }

  const [first, ...rest] = allRules;
  const combinedRules = rest.reduce(
    (acc, rules) => ({ left: acc, right: rules, operator: 'AND' as const }),
    first,
  );

  return combineFiltersAndRelations(filters, combinedRules);
}

/**
 * Type guard to check if a widget DTO is a Tabber widget.
 * Checks the DTO subtype which is 'WidgetsTabber' in Fusion.
 * Note: This is the DTO type, not the CSDK component type ('tabber-buttons').
 */
const isTabberWidgetDto = (widget: WidgetDto): widget is TabberWidgetDto => {
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

export const getJtdNavigateType = (widget: WidgetJtdDtoSlice): TriggerMethod => {
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

export const convertDimensionsToDimIndexes = (
  widget: WidgetJtdDtoSlice,
  dimensionIds: string[],
) => {
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
  widget: WidgetJtdDtoSlice,
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
export function extractPivotTargetsConfigFromWidgetDto(widget: WidgetJtdDtoSlice):
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
          dimensionObj = findDimensionByInstanceId(widget.metadata?.panels ?? [], pivotDimensionId);
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

function jumpToDashboardConfigFromJtdDtoSlice(
  source: WidgetJtdDtoSlice,
): JumpToDashboardConfig | JumpToDashboardConfigForPivot | undefined {
  if (!source?.drillToDashboardConfig?.version) {
    return undefined;
  }
  return translateToJtdConfig(source);
}

/**
 * Converts a Fusion {@link WidgetDto}'s `drillToDashboardConfig` into Compose SDK JumpToDashboardConfig | JumpToDashboardConfigForPivot
 * {@link JumpToDashboardConfig} {@link JumpToDashboardConfigForPivot} for use with {@link useJtdWidget}
 * @param widget - Fusion widget DTO (or the subset of fields used for JTD translation)
 * @returns JTD config, or `undefined` when there is no versioned JTD DTO or the widget type does not support JTD
 * @group Dashboards
 */
export function jumpToDashboardConfigFromWidgetDto(
  widget: WidgetJtdDtoSlice,
): JumpToDashboardConfig | JumpToDashboardConfigForPivot | undefined {
  return jumpToDashboardConfigFromJtdDtoSlice(widget);
}

export function translateWidgetsOptions(widgets: WidgetDto[] = []): WidgetsOptions {
  const widgetsOptionsMap: WidgetsOptions = {};

  widgets.forEach((widget: WidgetDto) => {
    const jtd = jumpToDashboardConfigFromWidgetDto(widget);

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
      partialDtoOptions: {
        options: widget.options,
        style: extractUnsupportedStyleOptions(widget.type, widget.style),
      },
    };
  });

  return widgetsOptionsMap;
}

/** Default JTD config DTO values used when persisting JumpToDashboardConfig. */
const DEFAULT_JTD_CONFIG_DTO: JtdConfigDto = {
  drilledDashboardPrefix: '_drill',
  drilledDashboardsFolderPrefix: '',
  displayFilterPane: true,
  displayDashboardsPane: true,
  displayToolbarRow: true,
  displayHeaderRow: true,
  volatile: false,
  hideDrilledDashboards: true,
  hideSharedDashboardsForNonOwner: true,
  drillToDashboardRightMenuCaption: 'Jump to ',
  drillToDashboardNavigateType: 1,
  drillToDashboardNavigateTypePivot: 2,
  drillToDashboardNavigateTypeCharts: 1,
  drillToDashboardNavigateTypeOthers: 3,
  drilledDashboardDisplayType: 2,
  dashboardIds: [],
  modalWindowResize: false,
  modalWindowMeasurement: '%',
  modalWindowWidth: 85,
  modalWindowHeight: 85,
  showFolderNameOnMenuSelection: false,
  resetDashFiltersAfterJTD: false,
  sameCubeRestriction: true,
  showJTDIcon: true,
  sendPieChartMeasureFiltersOnClick: true,
  forceZeroInsteadNull: false,
  mergeTargetDashboardFilters: false,
  drillToDashboardByName: false,
  sendBreakByValueFilter: true,
  ignoreFiltersSource: false,
  sendFormulaFiltersDuplicate: 'none',
};

const triggerMethodToNavigateType = (method: TriggerMethod): number =>
  method === 'rightclick' ? 1 : 3;

/**
 * Builds the shared (target-independent) {@link JtdConfigDto} fields from a JTD config.
 * Both the array (non-pivot) and Map (pivot) serializers layer their `dashboardIds`
 * on top of this. The pivot variant reuses these fields because
 * {@link JumpToDashboardConfigForPivot} is `JumpToDashboardConfig` minus `targets`.
 */
function jtdConfigDtoCommonFields(config: Omit<JumpToDashboardConfig, 'targets'>): JtdConfigDto {
  const triggerMethod = config.interaction?.triggerMethod ?? 'rightclick';
  return {
    // `dashboardIds` defaults to `[]` here (from DEFAULT_JTD_CONFIG_DTO); callers override it
    // with the array- or pivot-specific targets.
    ...DEFAULT_JTD_CONFIG_DTO,
    // The read path (`jumpToDashboardConfigFromJtdDtoSlice`) only restores JTD when
    // `drillToDashboardConfig.version` is set, so a persisted config without it would
    // be silently dropped on the next dashboard load. Stamp the current version.
    version: '1',
    enabled: config.enabled ?? true,
    drillToDashboardRightMenuCaption: config.interaction?.captionPrefix ?? 'Jump to ',
    drillToDashboardNavigateType: triggerMethodToNavigateType(triggerMethod),
    drillToDashboardNavigateTypeCharts: triggerMethodToNavigateType(triggerMethod),
    drillToDashboardNavigateTypePivot: 2,
    drillToDashboardNavigateTypeOthers: triggerMethodToNavigateType(triggerMethod),
    displayToolbarRow: config.targetDashboardConfig?.toolbar?.visible ?? true,
    displayFilterPane: config.targetDashboardConfig?.filtersPanel?.visible ?? true,
    modalWindowHeight: config.modal?.height,
    modalWindowWidth: config.modal?.width,
    modalWindowMeasurement: config.modal?.measurementUnit ?? '%',
    showJTDIcon: config.interaction?.showIcon ?? true,
    mergeTargetDashboardFilters: config.filtering?.mergeWithTargetFilters ?? false,
    includeDashFilterDims: config.filtering?.includeDashboardFilters,
    includeWidgetFilterDims: config.filtering?.includeWidgetFilters,
  };
}

/**
 * Translates a non-pivot {@link JumpToDashboardConfig} (array targets) to {@link JtdConfigDto}.
 */
function jtdConfigToDto(config: JumpToDashboardConfig): JtdConfigDto {
  return {
    ...jtdConfigDtoCommonFields(config),
    dashboardIds: config.targets.map(
      (t): JtdTargetDto => ({
        caption: t.caption,
        id: isJumpTargetWithId(t) ? t.id : undefined,
        oid: isJumpTargetWithId(t) ? t.id : undefined,
      }),
    ),
  };
}

/**
 * Serializes a pivot {@link JumpToDashboardConfigForPivot} (Map targets) onto a pivot
 * {@link WidgetDto}, the inverse of {@link extractPivotTargetsConfigFromWidgetDto}.
 *
 * Each Map entry is a (dimension → targets) pair. The dimension is matched to a panel
 * item via {@link dimensionToPivotDimId} (by JAQL expression/aggregation/level), and a
 * `dashboardIds` entry is emitted per target with `pivotDimensions` referencing that
 * panel item's `instanceid`. Because `toWidgetDto` does not emit `instanceid`s, we stamp
 * a deterministic one (the positional pivot-dim id, e.g. `"rows.0"`) onto the matched
 * item so the targets resolve again on reload — `findDimensionByInstanceId` matches it
 * by string equality. Returns the (possibly newly-stamped) panels alongside the config.
 * @internal
 */
function pivotJtdConfigToDto(
  config: JumpToDashboardConfigForPivot,
  panels: Panel[],
): { drillToDashboardConfig: JtdConfigDto; panels: Panel[] } {
  let stampedPanels = panels;
  const ensureWritablePanels = (): Panel[] => {
    if (stampedPanels === panels) {
      stampedPanels = panels.map((panel) => ({
        ...panel,
        items: panel.items.map((item) => ({ ...item })),
      }));
    }
    return stampedPanels;
  };

  const dashboardIds: Array<JtdTargetDto | JtdPivotTargetDto> = [];

  config.targets.forEach((targets, dimension) => {
    const pivotDimId = dimensionToPivotDimId(dimension, panels);
    if (!pivotDimId) {
      console.warn(
        '[pivotJtdConfigToDto] Could not locate a pivot dimension for a JTD target; skipping it.',
      );
      return;
    }
    const separatorIndex = pivotDimId.lastIndexOf('.');
    const panelName = pivotDimId.slice(0, separatorIndex);
    const itemIndex = Number(pivotDimId.slice(separatorIndex + 1));
    const writablePanels = ensureWritablePanels();
    const item = writablePanels.find((panel) => panel.name === panelName)?.items[itemIndex];
    if (!item) {
      return;
    }
    // Reuse an existing instanceid (none today, since toWidgetDto omits them) or stamp the
    // positional id so the panel item and the target reference the same opaque key.
    const instanceid = item.instanceid ?? pivotDimId;
    item.instanceid = instanceid;
    targets.forEach((target) => {
      const id = isJumpTargetWithId(target) ? target.id : undefined;
      dashboardIds.push({
        caption: target.caption,
        id,
        oid: id,
        pivotDimensions: [instanceid],
      });
    });
  });

  return {
    drillToDashboardConfig: { ...jtdConfigDtoCommonFields(config), dashboardIds },
    panels: stampedPanels,
  };
}

/**
 * Applies {@link SpecificWidgetOptions} to a {@link WidgetDto}.
 * Merges filtersOptions and jtdConfig into the DTO for persistence.
 * @internal
 */
export function withSpecificWidgetOptions(
  widgetOptions?: SpecificWidgetOptions,
): (widgetDto: WidgetDto) => WidgetDto {
  return (widgetDto: WidgetDto) => {
    if (!widgetOptions) {
      return widgetDto;
    }
    const { filtersOptions, jtdConfig, partialDtoOptions } = widgetOptions;

    // Merge partialDtoOptions.options as the base layer so original server options are preserved.
    // filtersOptions-derived values are applied on top and take precedence.
    const baseOptions = partialDtoOptions?.options
      ? { ...partialDtoOptions.options, ...widgetDto.options }
      : widgetDto.options;

    const options = filtersOptions
      ? {
          ...baseOptions,
          dashboardFiltersMode:
            filtersOptions.applyMode === CommonFiltersApplyMode.FILTER
              ? (WidgetDashboardFilterMode.FILTER as `${WidgetDashboardFilterMode}`)
              : (WidgetDashboardFilterMode.SELECT as `${WidgetDashboardFilterMode}`),
          selector: filtersOptions.shouldAffectFilters ?? true,
        }
      : baseOptions;

    // JTD: array (non-pivot) targets serialize to `dashboardIds` directly; Map (pivot)
    // targets additionally stamp `instanceid`s on the referenced panel items so the
    // per-dimension targets resolve on reload (see `pivotJtdConfigToDto`).
    let drillToDashboardConfig = widgetDto.drillToDashboardConfig;
    let panels = widgetDto.metadata.panels;
    if (jtdConfig) {
      if (jtdConfig.targets instanceof Map) {
        const pivot = pivotJtdConfigToDto(jtdConfig as JumpToDashboardConfigForPivot, panels);
        drillToDashboardConfig = pivot.drillToDashboardConfig;
        panels = pivot.panels;
      } else {
        drillToDashboardConfig = jtdConfigToDto(jtdConfig as JumpToDashboardConfig);
      }
    }

    const metadataBase =
      panels === widgetDto.metadata.panels ? widgetDto.metadata : { ...widgetDto.metadata, panels };
    const metadata =
      filtersOptions?.ignoreFilters != null
        ? {
            ...metadataBase,
            ignore: {
              all: filtersOptions.ignoreFilters.all ?? false,
              ids: filtersOptions.ignoreFilters.ids ?? [],
            },
          }
        : metadataBase;

    // Re-attach unsupported style fields snapshot from the original DTO so they
    // survive Fusion → CSDK → Fusion round-trips. Rebuilt style takes precedence,
    // partialDtoOptions.style only fills gaps the rebuild leaves untouched.
    const style = applyPartialDtoStyle(widgetDto.style, partialDtoOptions?.style);

    return {
      ...widgetDto,
      ...(options && { options }),
      metadata,
      style,
      ...(drillToDashboardConfig && { drillToDashboardConfig }),
    };
  };
}

/**
 * The dashboard-level context held about a single widget, gathered from the
 * (separate) containers it can live in: `widgetsOptions[id]`
 * ({@link SpecificWidgetOptions}: common filters, JTD, partial DTO snapshot) and
 * `config.tabbers[id]` ({@link TabberConfig}: per-tab show/hide mapping).
 *
 * Consumed by {@link withDashboardWidgetContext} to re-project this context onto a
 * freshly-translated {@link WidgetDto} on add/duplicate, so dashboard-level config
 * survives the model → DTO write path.
 * @internal
 */
export type WidgetContext = {
  /** Per-widget options from `widgetsOptions[id]`. */
  options?: SpecificWidgetOptions;
  /** Tabber show/hide mapping from `config.tabbers[id]`. */
  tabber?: TabberConfig;
};

/**
 * Overlays a {@link TabberConfig} onto a tabber {@link WidgetDto}.
 *
 * The widget-level translator (`toTabberWidgetStyle`) rebuilds `style.tabs[]` with
 * tab names / `activeTab` / styling but empty `displayWidgetIds` — the widget model
 * does not know about other widgets' ids. This overlays the dashboard-level
 * show/hide mapping back onto those tabs by index. No-op for non-tabber DTOs or
 * when there is no tabber config.
 * @internal
 */
export function withTabberWidgetConfig(
  tabberConfig?: TabberConfig,
): (widgetDto: WidgetDto) => WidgetDto {
  return (widgetDto: WidgetDto) => {
    if (!tabberConfig || !isTabberWidgetDto(widgetDto)) {
      return widgetDto;
    }
    const tabs = (widgetDto.style.tabs ?? []).map((tab, index) => ({
      ...tab,
      displayWidgetIds: tabberConfig.tabs[index]?.displayWidgetIds ?? tab.displayWidgetIds,
    }));
    return {
      ...widgetDto,
      style: { ...widgetDto.style, tabs },
    };
  };
}

/**
 * Projects all dashboard-level {@link WidgetContext} for a widget onto a freshly
 * translated {@link WidgetDto}. Composes the per-container projections
 * ({@link withSpecificWidgetOptions} for `widgetsOptions`, {@link withTabberWidgetConfig}
 * for `config.tabbers`); each is last-write-wins and a no-op when its slice is absent.
 *
 * This is the single seam that re-attaches dashboard-level widget config on
 * add/duplicate; a new per-widget side-channel adds its projection here.
 * @internal
 */
export function withDashboardWidgetContext(
  context: WidgetContext,
): (widgetDto: WidgetDto) => WidgetDto {
  return flow(withSpecificWidgetOptions(context.options), withTabberWidgetConfig(context.tabber));
}

export function translateTabbersOptions(widgets: WidgetDto[] = []): TabbersConfig {
  const tabberOptionsMap: Record<string, TabberConfig> = {};

  widgets.forEach((widget: WidgetDto) => {
    if (isTabberWidgetDto(widget)) {
      // legacy tabber config can have tabs stored directly in widget.tabs
      const dtoTabs = widget.style.tabs || widget.tabs || [];
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
