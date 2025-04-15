import type {
  DashboardByIdConfig as DashboardByIdConfigPreact,
  DashboardConfig as DashboardConfigPreact,
  DashboardFiltersPanelConfig as DashboardFiltersPanelConfigPreact,
} from '@sisense/sdk-ui-preact';

/**
 * {@inheritDoc @sisense/sdk-ui!DashboardFiltersPanelConfig}
 */
export interface DashboardFiltersPanelConfig
  extends Omit<DashboardFiltersPanelConfigPreact, 'actions'> {}

/**
 * {@inheritDoc @sisense/sdk-ui!DashboardConfig}
 */
export interface DashboardConfig extends Omit<DashboardConfigPreact, 'filtersPanel'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardConfig.filtersPanel}
   */
  filtersPanel?: DashboardFiltersPanelConfig;
}

/**
 * {@inheritDoc @sisense/sdk-ui!DashboardByIdConfig}
 */
export interface DashboardByIdConfig extends Omit<DashboardByIdConfigPreact, 'filtersPanel'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardByIdConfig.filtersPanel}
   */
  filtersPanel?: DashboardFiltersPanelConfig;
}
