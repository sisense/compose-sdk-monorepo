import { type FunctionComponent, useMemo } from 'react';

import { Filter, getFiltersArray } from '@sisense/sdk-data';
import flow from 'lodash-es/flow';
import isUndefined from 'lodash-es/isUndefined';
import omitBy from 'lodash-es/omitBy';

import {
  DashboardModel,
  dashboardModelTranslator,
} from '@/domains/dashboarding/dashboard-model/index.js';
import { useGetDashboardModelInternal } from '@/domains/dashboarding/dashboard-model/use-get-dashboard-model.js';
import { DashboardProps } from '@/domains/dashboarding/types.js';
import { useComposedDashboardInternal } from '@/domains/dashboarding/use-composed-dashboard.js';
import { useDashboardThemeInternal } from '@/domains/dashboarding/use-dashboard-theme.js';
import { Widget } from '@/domains/widgets/components/widget.js';
import { ThemeProvider } from '@/infra/contexts/theme-provider/index.js';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component.js';
import { TranslatableError } from '@/infra/translation/translatable-error.js';
import { WidgetByIdProps, WidgetProps } from '@/props.js';
import { LoadingOverlay } from '@/shared/components/loading-overlay.js';
import { FiltersMergeStrategy, mergeFiltersByStrategy } from '@/shared/utils/filter-relations.js';
import { DrilldownOptions, PivotTableDrilldownOptions } from '@/types.js';

/**
 * The WidgetById component, which is a thin wrapper on the {@link ChartWidget} component,
 * is used to render a widget created in a Sisense Fusion instance.
 *
 * To learn more about using Sisense Fusion Widgets in Compose SDK,
 * see [Sisense Fusion Widgets](/guides/sdk/guides/charts/guide-fusion-widgets.html).
 *
 * **Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * ## Example
 *
 * Display two dashboard widgets from a Fusion instance.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=fusion-assets%2Ffusion-widgets&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
export const WidgetById: FunctionComponent<WidgetByIdProps> = asSisenseComponent({
  componentName: 'WidgetById',
  customContextErrorMessageKey: 'errors.widgetByIdNoSisenseContext',
})((props) => {
  const {
    widgetOid,
    dashboardOid,
    includeDashboardFilters = false,
    filters: filtersFromProps,
    highlights: highlightsFromProps,
    filtersMergeStrategy,
    drilldownOptions: drilldownOptionsFromProps,
    styleOptions: styleOptionsFromProps,
    ...restExternalProps
  } = props;

  const {
    dashboard: dashboardModel,
    isLoading,
    error,
  } = useGetDashboardModelInternal({
    dashboardOid,
    includeWidgets: true,
    includeFilters: includeDashboardFilters,
  });

  if (error) throw new TranslatableError('errors.widgetLoadFailed', { error: error.message });

  if (dashboardModel && !dashboardModel.widgets.some((widget) => widget.oid === widgetOid)) {
    throw new TranslatableError('errors.widgetByIdInvalidIdentifier', {
      widgetOid,
      dashboardOid,
    });
  }

  const customizedDashboardModel: DashboardModel | undefined = useMemo(() => {
    if (!dashboardModel) {
      return undefined;
    }
    return flow(withOnlySingleWidget(widgetOid), withDisabledCrossfiltering)(dashboardModel);
  }, [dashboardModel, widgetOid]);

  const fetchedDashboardProps: DashboardProps | undefined = useMemo(() => {
    return customizedDashboardModel
      ? dashboardModelTranslator.toDashboardProps(customizedDashboardModel)
      : undefined;
  }, [customizedDashboardModel]);

  const { dashboard: composedDashboardProps } = useComposedDashboardInternal(
    fetchedDashboardProps || {
      widgets: [],
    },
  );

  const { themeSettings: dashboardThemeSettings } = useDashboardThemeInternal(
    fetchedDashboardProps ? composedDashboardProps : {},
  );

  const widgetProps = composedDashboardProps?.widgets.find((widget) => widget.id === widgetOid);

  const customizedWidgetProps = useMemo(() => {
    if (!widgetProps) {
      return undefined;
    }
    return flow(
      withFiltersFromProps(filtersFromProps, filtersMergeStrategy),
      withHighlightsFromProps(highlightsFromProps, filtersMergeStrategy),
      withDrilldownOptionsFromProps(drilldownOptionsFromProps),
      withStyleOptionsFromProps(styleOptionsFromProps),
      withRestExternalProps(restExternalProps),
    )(widgetProps);
  }, [
    widgetProps,
    filtersFromProps,
    filtersMergeStrategy,
    highlightsFromProps,
    drilldownOptionsFromProps,
    styleOptionsFromProps,
    restExternalProps,
  ]);

  return (
    <ThemeProvider theme={dashboardThemeSettings}>
      <LoadingOverlay isVisible={isLoading}>
        {customizedWidgetProps && <Widget {...customizedWidgetProps} />}
      </LoadingOverlay>
    </ThemeProvider>
  );
});

/**
 * Returns a dashboard model with only the widget with the given oid.
 * @param widgetOid - The oid of the widget to return.
 * @returns The dashboard model with only the widget with the given oid.
 */
function withOnlySingleWidget(widgetOid: string): DashboardModelTransformer {
  return (dashboardModel: DashboardModel) => {
    const targetWidget = dashboardModel.widgets.find((widget) => widget.oid === widgetOid);

    if (!targetWidget) {
      return dashboardModel;
    }

    return {
      ...dashboardModel,
      // leave only the target widget
      widgets: [targetWidget],
      widgetsOptions: {
        // leave only the options for the target widget
        [targetWidget.oid]: dashboardModel.widgetsOptions[targetWidget.oid],
      },
    };
  };
}

/**
 * Disables crossfiltering behavior for all widgets in the dashboard model.
 * @param dashboardModel - The dashboard model to disable crossfiltering for.
 * @returns The dashboard model with crossfiltering disabled for all widgets.
 */
function withDisabledCrossfiltering(dashboardModel: DashboardModel): DashboardModel {
  const customizedWidgetsOptionsEntries = Object.entries(dashboardModel.widgetsOptions).map(
    ([widgetOid, widgetOptions]) => {
      return [
        widgetOid,
        {
          ...widgetOptions,
          filtersOptions: {
            ...widgetOptions.filtersOptions,
            shouldAffectFilters: false,
          },
        },
      ];
    },
  );
  return {
    ...dashboardModel,
    widgetsOptions: Object.fromEntries(customizedWidgetsOptionsEntries),
  };
}

/**
 * Merges the filters from the external props with the local filters of the widget props.
 * @param filtersFromProps - The filters from the props.
 * @param filtersMergeStrategy - The strategy to merge the filters.
 * @returns The widget props with the merged filters.
 */
function withFiltersFromProps(
  filtersFromProps?: Filter[],
  filtersMergeStrategy?: FiltersMergeStrategy,
): WidgetPropsTransformer {
  return (widgetProps: WidgetProps) => {
    if (!filtersFromProps || !('filters' in widgetProps)) {
      return widgetProps;
    }

    const mergedFilters = mergeFiltersByStrategy(
      widgetProps.filters || [],
      filtersFromProps,
      filtersMergeStrategy,
    );

    return { ...widgetProps, filters: mergedFilters };
  };
}

/**
 * Merges the highlights from the external props with the local highlights of the widget props.
 * @param highlightsFromProps - The highlights from the props.
 * @param filtersMergeStrategy - The strategy to merge the highlights.
 * @returns The widget props with the merged highlights.
 */
function withHighlightsFromProps(
  highlightsFromProps?: Filter[],
  filtersMergeStrategy?: FiltersMergeStrategy,
): WidgetPropsTransformer {
  return (widgetProps: WidgetProps) => {
    if (!highlightsFromProps || !('highlights' in widgetProps)) {
      return widgetProps;
    }
    const mergedHighlights = getFiltersArray(
      mergeFiltersByStrategy(widgetProps.highlights, highlightsFromProps, filtersMergeStrategy),
    );
    return { ...widgetProps, highlights: mergedHighlights };
  };
}

/**
 * Merges the drilldown options from the external props with the local drilldown options of the widget props.
 * @param drilldownOptions - The drilldown options from the props.
 * @returns The widget props with the merged drilldown options.
 */
function withDrilldownOptionsFromProps(
  drilldownOptions?: DrilldownOptions | PivotTableDrilldownOptions,
): WidgetPropsTransformer {
  return (widgetProps: WidgetProps) => {
    if (!drilldownOptions || !('drilldownOptions' in widgetProps)) {
      return widgetProps;
    }
    return {
      ...widgetProps,
      drilldownOptions: {
        ...widgetProps.drilldownOptions,
        ...drilldownOptions,
      },
    } as WidgetProps;
  };
}

/**
 * Merges the style options from the external props with the local style options of the widget props.
 * @param styleOptions - The style options from the props.
 * @returns The widget props with the merged style options.
 */
function withStyleOptionsFromProps(
  styleOptions?: WidgetProps['styleOptions'],
): WidgetPropsTransformer {
  return (widgetProps: WidgetProps) => {
    if (!styleOptions || !('styleOptions' in widgetProps)) {
      return widgetProps;
    }
    return {
      ...widgetProps,
      styleOptions: {
        ...widgetProps.styleOptions,
        ...styleOptions,
      },
    } as WidgetProps;
  };
}

/**
 * Merges the rest external props with the widget props, omitting undefined values.
 * @param restExternalProps - The rest external props.
 * @returns The widget props with the merged rest external props.
 */
function withRestExternalProps(restExternalProps: Partial<WidgetProps>): WidgetPropsTransformer {
  return (widgetProps: WidgetProps) => {
    const nonEmptyExternalProps = omitBy(restExternalProps, isUndefined);
    return { ...widgetProps, ...nonEmptyExternalProps } as WidgetProps;
  };
}
/** A function that transforms a dashboard model. */
type DashboardModelTransformer = (dashboardModel: DashboardModel) => DashboardModel;

/** A function that transforms widget props. */
type WidgetPropsTransformer = (widgetProps: WidgetProps) => WidgetProps;
