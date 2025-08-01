import {
  type LayoutDto,
  type FilterDto,
  type CascadingFilterDto,
  isCascadingFilterDto,
  DashboardDto,
} from '../../api/types/dashboard-dto';
import type { WidgetsPanelColumnLayout, WidgetsOptions, TabbersOptions } from './types';
import {
  CascadingFilter,
  Filter,
  createFilterFromJaql,
  FilterRelations,
  FilterRelationsModel,
  FilterRelationsModelNode,
  FormulaJaql,
  FormulaContext,
} from '@sisense/sdk-data';
import { CommonFiltersApplyMode } from '@/common-filters/types';
import {
  combineFiltersAndRelations,
  convertFilterRelationsModelToRelationRules,
  isTrivialSingleNodeRelations,
} from '@/utils/filter-relations';
import {
  isJaqlWithFormula,
  isSharedFormulaReferenceContext,
  JtdConfig,
  JtdNavigateType,
  SharedFormulaReferenceContext,
  WidgetDto,
} from '@/widget-by-id/types';
import { SizeMeasurement } from '@/types';
import { RestApi } from '@/api/rest-api';
import { TabberConfig, TabberDtoStyle } from '@/types';
import {
  isChartTypeFusionWidget,
  isIndicatorFusionWidget,
  isPieChartFusionWidget,
  isPivotTableFusionWidget,
  isTextFusionWidget,
  widgetTypeSupportsJtd,
} from '@/widget-by-id/utils';

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

const isTabberWidgetDto = (widget: WidgetDto): widget is WidgetDto & { style: TabberDtoStyle } => {
  return widget.subtype === 'WidgetsTabber';
};

const translateNavigateType = (navigateType: number): JtdNavigateType => {
  switch (navigateType) {
    case 1:
      return JtdNavigateType.RIGHT_CLICK;
    case 2:
      return JtdNavigateType.PIVOT_LINK;
    case 3:
      return JtdNavigateType.CLICK;
    case 4:
      return JtdNavigateType.BLOX;
    default:
  }
  console.warn(`Unknown navigate type: ${navigateType}, using CLICK instead`);
  return JtdNavigateType.CLICK;
};

const getJtdNavigateType = (widget: WidgetDto): JtdNavigateType => {
  const jtdConfigDto = widget.drillToDashboardConfig;
  if (!jtdConfigDto) {
    // default one
    return JtdNavigateType.RIGHT_CLICK;
  }

  if (isPivotTableFusionWidget(widget.type)) {
    return translateNavigateType(jtdConfigDto.drillToDashboardNavigateTypePivot);
  }

  if (isPieChartFusionWidget(widget.type)) {
    const chartCategories = widget.metadata?.panels.find((p) => p.name === 'categories');
    const isPieChartWithoutCategories = (chartCategories?.items?.length || 0) > 0;
    if (isPieChartWithoutCategories) {
      return JtdNavigateType.CLICK;
    }
  }
  if (isChartTypeFusionWidget(widget.type)) {
    return translateNavigateType(jtdConfigDto.drillToDashboardNavigateTypeCharts);
  }
  if (isIndicatorFusionWidget(widget.type) || isTextFusionWidget(widget.type)) {
    return JtdNavigateType.CLICK;
  }
  return JtdNavigateType.RIGHT_CLICK;
};

const translateToJtdConfig = (widget: WidgetDto): JtdConfig | undefined => {
  const jtdConfigDto = widget.drillToDashboardConfig;
  if (!jtdConfigDto) {
    return undefined;
  }
  if (!widgetTypeSupportsJtd(widget.type)) {
    return undefined;
  }
  const measurement = jtdConfigDto.modalWindowMeasurement || SizeMeasurement.PERCENT;

  return {
    ...jtdConfigDto,
    modalWindowHeight:
      jtdConfigDto.modalWindowHeight || (measurement === SizeMeasurement.PERCENT ? 85 : 800),
    modalWindowWidth:
      jtdConfigDto.modalWindowWidth || (measurement === SizeMeasurement.PERCENT ? 85 : 1200),
    enabled: typeof jtdConfigDto.enabled === 'boolean' ? jtdConfigDto.enabled : true,
    modalWindowMeasurement: measurement,
    navigateType: getJtdNavigateType(widget),
    drillTargets: jtdConfigDto.dashboardIds.map((drillTarget) => ({
      caption: drillTarget.caption,
      id: drillTarget.id || drillTarget.oid,
    })),
    showJtdIcon: typeof jtdConfigDto.showJTDIcon === 'boolean' ? jtdConfigDto.showJTDIcon : true,
  };
};

export function translateWidgetsOptions(widgets: WidgetDto[] = []): WidgetsOptions {
  const widgetsOptionsMap: WidgetsOptions = {};

  widgets.forEach((widget: WidgetDto) => {
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
      ...(widget?.drillToDashboardConfig &&
        widget.drillToDashboardConfig.version && {
          jtdConfig: translateToJtdConfig(widget),
        }),
    };
  });

  return widgetsOptionsMap;
}

export function translateTabbersOptions(widgets: WidgetDto[] = []): TabbersOptions {
  const tabberOptionsMap: Record<string, TabberConfig> = {};

  widgets.forEach((widget: WidgetDto) => {
    if (isTabberWidgetDto(widget)) {
      tabberOptionsMap[widget.oid] = {
        tabs: widget.style.tabs || [],
        activeTab: parseInt(widget.style.activeTab || '1', 10),
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
