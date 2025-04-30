import { DashboardCodeParams, isByIdDashboardCodeParams } from '../types.js';
import { toDashboardCodeClientSide, toDashboardCodeById } from './to-dashboard-code.js';

/**
 * Converts dashboard props to CSDK code.
 *
 * @param dashboardProps - Dashboard props
 * @returns CSDK code string
 */
export const toDashboardCode = (dashboardCodeParams: DashboardCodeParams): string => {
  if (isByIdDashboardCodeParams(dashboardCodeParams)) {
    return toDashboardCodeById(dashboardCodeParams);
  } else {
    return toDashboardCodeClientSide(dashboardCodeParams);
  }
};
