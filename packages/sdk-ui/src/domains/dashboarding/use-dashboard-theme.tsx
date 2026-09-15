import { useMemo } from 'react';

import { DashboardStyleOptions } from '@/domains/dashboarding/dashboard-model';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { withTracking } from '@/infra/decorators/hook-decorators';

/**
 * @internal
 */
export interface DashboardThemeParams {
  styleOptions?: DashboardStyleOptions;
}

/**
 * {@link useDashboardTheme} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the dashboard to be retrieved
 * @internal
 */
export const useDashboardThemeInternal = ({ styleOptions }: DashboardThemeParams) => {
  const { themeSettings: appThemeSettings } = useThemeContext();

  const themeSettings = useMemo(() => {
    const { palette, ...restDashboardStyles } = styleOptions ?? {};

    return {
      ...(palette && { palette }),
      dashboard: {
        ...appThemeSettings.dashboard,
        ...restDashboardStyles,
      },
    };
  }, [styleOptions, appThemeSettings.dashboard]);

  return { themeSettings };
};

/**
 * React hook that returns dashboard theme settings
 *
 * @example
 * ```tsx
 * import { useDashboardTheme } from '@sisense/sdk-ui';
 *
 * const CodeExample = () => {
 *   const { themeSettings } = useDashboardTheme({
 *     styleOptions: { backgroundColor: '#f5f5f5', dividerLineColor: '#e0e0e0' },
 *   });
 *
 *   return <pre>{JSON.stringify(themeSettings, null, 2)}</pre>;
 * };
 *
 * export default CodeExample;
 * ```
 *
 * @group Dashboards
 *
 * @alpha
 */
export const useDashboardTheme = withTracking('useDashboardTheme')(useDashboardThemeInternal);
