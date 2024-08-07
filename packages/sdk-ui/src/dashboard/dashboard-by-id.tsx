import { useGetDashboardModel } from '@/models';
import { Dashboard } from './dashboard';
import { DashboardByIdProps } from './types';
import { LoadingOverlay } from '@/common/components/loading-overlay';
import { useThemeContext } from '@/theme-provider';

/**
 * React component that renders a dashboard created in Sisense Fusion Embed
 *
 * **Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * @internal
 */
export const DashboardById = ({ dashboardOid }: DashboardByIdProps) => {
  const { themeSettings } = useThemeContext();
  const { dashboard, isLoading, isError } = useGetDashboardModel({
    dashboardOid,
    includeWidgets: true,
    includeFilters: true,
  });

  if (isError) throw new Error('Failed to load Dashboard');

  return (
    <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
      {dashboard && <Dashboard {...dashboard.getDashboardProps()} />}
    </LoadingOverlay>
  );
};
