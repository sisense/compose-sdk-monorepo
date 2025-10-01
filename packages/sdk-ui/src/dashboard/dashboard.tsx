import { DashboardProps } from '@/dashboard/types';
import { DashboardContainer } from '@/dashboard/components/dashboard-container';
import { ThemeProvider } from '@/theme-provider';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { useDashboardThemeInternal } from './use-dashboard-theme';
import { useComposedDashboardInternal } from './use-composed-dashboard';
import { Filter, FilterRelations } from '@ethings-os/sdk-data';
import { useCallback, useEffect } from 'react';
import { useCustomWidgets } from '@/custom-widgets-provider';
import { TabberWidget } from '@/widgets/tabber-widget';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { useDefaults } from '@/common/hooks/use-defaults';
import { DEFAULT_DASHBOARD_CONFIG } from './constants';
import { WidgetsPanelLayout } from '@/models';

export enum DashboardChangeType {
  /** Dashboard filters have been updated */
  FILTERS_UPDATE = 'FILTERS.UPDATE',
  /** Filters panel collapsed state changed */
  UI_FILTERS_PANEL_COLLAPSE = 'UI.FILTERS.PANEL.COLLAPSE',
  /** Widgets panel layout updated */
  WIDGETS_PANEL_LAYOUT_UPDATE = 'WIDGETS_PANEL_LAYOUT.UPDATE',
  /** Edit mode isEditing changed */
  WIDGETS_PANEL_LAYOUT_IS_EDITING_CHANGE = 'WIDGETS_PANEL.EDIT_MODE.IS_EDITING.CHANGE',
  /** Widgets deleted from the dashboard */
  WIDGETS_DELETE = 'WIDGETS.DELETE',
}

export type DashboardChangeAction =
  | {
      type: DashboardChangeType.FILTERS_UPDATE;
      payload: Filter[] | FilterRelations;
    }
  | {
      type: DashboardChangeType.UI_FILTERS_PANEL_COLLAPSE;
      payload: boolean;
    }
  | {
      type: DashboardChangeType.WIDGETS_PANEL_LAYOUT_UPDATE;
      payload: WidgetsPanelLayout;
    }
  | {
      type: DashboardChangeType.WIDGETS_PANEL_LAYOUT_IS_EDITING_CHANGE;
      payload: boolean;
    }
  | {
      type: DashboardChangeType.WIDGETS_DELETE;
      payload: string[];
    };

/**
 * React component that renders a dashboard whose elements are customizable. It includes internal logic of applying common filters to widgets.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @example
 *
 * Example of rendering a Fusion dashboard using the `useGetDashboardModel hook and the `Dashboard` component.
 *
 * ```ts
 * import { Dashboard, useGetDashboardModel, dashboardModelTranslator } from '@ethings-os/sdk-ui';

const CodeExample = () => {
  const { dashboard } = useGetDashboardModel({
    dashboardOid: '65a82171719e7f004018691c',
    includeFilters: true,
    includeWidgets: true,
  });

  return (
    <>
      {dashboard && (
        <Dashboard {...dashboardModelTranslator.toDashboardProps(dashboard)} />
      )}
    </>
  );
};

export default CodeExample;
 * ```
 *
 * To learn more about this and related dashboard components,
 * see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
 * @group Dashboards
 */
export const Dashboard = asSisenseComponent({
  componentName: 'Dashboard',
  shouldHaveOwnModalRoot: true,
})(
  ({
    title = '',
    layoutOptions,
    config: propConfig,
    widgets,
    filters,
    defaultDataSource,
    widgetsOptions,
    tabbersOptions,
    styleOptions,
    onChange,
  }: DashboardProps) => {
    const { themeSettings } = useDashboardThemeInternal({ styleOptions });
    const { registerCustomWidget } = useCustomWidgets();
    const app = useSisenseContext().app;
    const config = useDefaults(propConfig, DEFAULT_DASHBOARD_CONFIG);

    useEffect(() => {
      const tabberEnabled = app?.settings?.tabberConfig?.enabled || false;
      if (tabberEnabled) {
        registerCustomWidget('WidgetsTabber', TabberWidget);
      }
    }, [app?.settings?.tabberConfig?.enabled, registerCustomWidget]);
    const {
      dashboard: {
        filters: dashboardFilters = [],
        widgets: dashboardWidgets,
        layoutOptions: updatedLayoutOptions,
      },
      setFilters,
    } = useComposedDashboardInternal(
      {
        filters,
        widgets,
        widgetsOptions,
        layoutOptions,
        tabbersOptions,
      },
      {
        onFiltersChange: useCallback(
          (filters: Filter[] | FilterRelations) => {
            onChange?.({ type: DashboardChangeType.FILTERS_UPDATE, payload: filters });
          },
          [onChange],
        ),
      },
    );

    return (
      <ThemeProvider theme={themeSettings}>
        <DashboardContainer
          title={title}
          layoutOptions={updatedLayoutOptions}
          config={config}
          widgets={dashboardWidgets}
          defaultDataSource={defaultDataSource}
          filters={dashboardFilters}
          onFiltersChange={setFilters}
          onChange={onChange}
        />
      </ThemeProvider>
    );
  },
);
