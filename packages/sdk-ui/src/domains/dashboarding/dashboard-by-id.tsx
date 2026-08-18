import { useCallback, useMemo } from 'react';

import { withoutUndefinedDerivedFlags } from '@/domains/dashboarding/dashboard-model/as-permission-derived-config';
import * as dashboardModelTranslator from '@/domains/dashboarding/dashboard-model/dashboard-model-translator';
import { useDashboardModelInternal } from '@/domains/dashboarding/dashboard-model/use-dashboard-model/use-dashboard-model';
import { dashboardChangeEventToUseDashboardModelAction } from '@/domains/dashboarding/dashboard-model/use-dashboard-model/use-dashboard-model-utils';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { LoadingOverlay } from '@/shared/components/loading-overlay';
import { useDefaults } from '@/shared/hooks/use-defaults';

import { DEFAULT_DASHBOARD_BY_ID_CONFIG } from './constants.js';
import { Dashboard } from './dashboard.js';
import { createDashboardPersistenceManager } from './persistence/persistence-manager.js';
import type { DashboardPersistenceManager } from './persistence/types.js';
import { DashboardByIdProps, DashboardChangeEvent, DashboardConfig } from './types.js';

/**
 * React component that renders a dashboard created in Sisense Fusion by its ID.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @example
 *
 * ```ts
 * import { DashboardById } from '@sisense/sdk-ui';

  const CodeExample = () => {
    return (
      <>
        <DashboardById
          dashboardOid="65a82171719e7f004018691c"
        />
      </>
    );
  };

  export default CodeExample;
 * ```
 *
 * To learn more about this and related dashboard components,
 * see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
 * @group Fusion Assets
 * @fusionEmbed
 */
export const DashboardById = asSisenseComponent({
  componentName: 'DashboardById',
})(({ dashboardOid, config: propConfig }: DashboardByIdProps) => {
  const config = useDefaults(propConfig, DEFAULT_DASHBOARD_BY_ID_CONFIG);

  const { dashboard, isLoading, isError, error, dispatchChanges } = useDashboardModelInternal({
    dashboardOid,
    includeWidgets: true,
    includeFilters: true,
    persist: config.persist,
    sharedMode: config.sharedMode,
  });

  const handleChange = useCallback(
    (event: DashboardChangeEvent) => {
      const useDashModelAction = dashboardChangeEventToUseDashboardModelAction(event);
      if (useDashModelAction) {
        void dispatchChanges(useDashModelAction);
      }
    },
    [dispatchChanges],
  );

  const persistence: DashboardPersistenceManager = useMemo(
    () => createDashboardPersistenceManager(dispatchChanges),
    [dispatchChanges],
  );

  if (isError && error)
    throw new TranslatableError('errors.dashboardLoadFailed', { error: error.message });

  const dashboardProps = useMemo(() => {
    return dashboard && dashboardModelTranslator.toDashboardProps(dashboard);
  }, [dashboard]);

  // This is the props layer of the config merge below, so anything set here wins over the defaults
  // derived from the dashboard's permissions in `toDashboardProps`. Every permission-derived flag is
  // therefore carried through from `propConfig` untouched — nothing computes them here — which is
  // what lets a developer's explicit value override the permissions while leaving the derived
  // default in place when they say nothing.
  const propsConfigInternal: DashboardConfig = useMemo(
    // Flags a developer set to an explicit `undefined` mean "no preference", exactly like omitting
    // them, so they must not reach the merge — see `withoutUndefinedDerivedFlags`.
    () => withoutUndefinedDerivedFlags(propConfig ?? {}),
    [propConfig],
  );

  const dashboardConfig = useDefaults<DashboardConfig>(
    propsConfigInternal,
    useDefaults(dashboardProps?.config, DEFAULT_DASHBOARD_BY_ID_CONFIG),
  );

  return (
    <LoadingOverlay isVisible={isLoading}>
      {dashboardProps && (
        <Dashboard
          {...dashboardProps}
          persistence={config.persist ? persistence : undefined}
          onChange={handleChange}
          config={dashboardConfig}
        />
      )}
    </LoadingOverlay>
  );
});
