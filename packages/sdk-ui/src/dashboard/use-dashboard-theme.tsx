import { useMemo } from 'react';
import { DashboardStyleOptions } from '@/models';
import { useThemeContext } from '@/theme-provider';
import { withTracking } from '@/decorators/hook-decorators';

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
 * @group Dashboards
 * @alpha
 * @internal
 */
export const useDashboardTheme = withTracking('useDashboardTheme')(useDashboardThemeInternal);
