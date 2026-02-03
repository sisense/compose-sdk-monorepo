import { sampleEcommerceDashboard } from '@/domains/dashboarding/dashboard-model/__mocks__/sample-ecommerce-dashboard.js';
import { dashboardModelTranslator } from '@/index';

import { DashboardCodeParams } from '../types.js';
import * as dashboardComposer from './dashboard-composer.js';

describe('dashboardComposer', () => {
  describe('toDashboardCode Client Side', () => {
    let dashboardCodeParams: DashboardCodeParams;
    beforeEach(() => {
      const dashboardProps = dashboardModelTranslator.toDashboardProps(
        dashboardModelTranslator.fromDashboardDto(sampleEcommerceDashboard),
      );
      if (!dashboardProps) return;
      dashboardCodeParams = { dashboardProps }; // react by default
    });

    it('should compose client-side dashboard code in React', () => {
      expect(dashboardComposer.toDashboardCode(dashboardCodeParams)).toMatchSnapshot();
    });
    it('should compose client-side dashboard code in Angular', () => {
      expect(
        dashboardComposer.toDashboardCode({ ...dashboardCodeParams, uiFramework: 'angular' }),
      ).toMatchSnapshot();
    });
    it('should compose client-side dashboard code in Vue', () => {
      expect(
        dashboardComposer.toDashboardCode({ ...dashboardCodeParams, uiFramework: 'vue' }),
      ).toMatchSnapshot();
    });
  });

  describe('toDashboardCode By ID', () => {
    let dashboardCodeParams: DashboardCodeParams;
    beforeEach(() => {
      dashboardCodeParams = {
        dashboardOid: 'SOME_DASHBOARD_OID',
      }; // react by default
    });

    it('should compose By ID dashboard code in React', () => {
      expect(dashboardComposer.toDashboardCode(dashboardCodeParams)).toMatchSnapshot();
    });
    it('should compose By ID widget code in Angular', () => {
      expect(
        dashboardComposer.toDashboardCode({ ...dashboardCodeParams, uiFramework: 'angular' }),
      ).toMatchSnapshot();
    });
    it('should compose By ID widget code in Vue', () => {
      expect(
        dashboardComposer.toDashboardCode({ ...dashboardCodeParams, uiFramework: 'vue' }),
      ).toMatchSnapshot();
    });
    it('should hide filters when visible=false in React', () => {
      expect(
        dashboardComposer.toDashboardCode({
          dashboardOid: 'SOME_DASHBOARD_OID',
          config: {
            filtersPanel: { visible: false },
          },
        }),
      ).toMatchSnapshot();
    });
    it('should hide filters when visible=false in Angular', () => {
      expect(
        dashboardComposer.toDashboardCode({
          dashboardOid: 'SOME_DASHBOARD_OID',
          config: {
            filtersPanel: { visible: false },
          },
          uiFramework: 'angular',
        }),
      ).toMatchSnapshot();
    });
    it('should hide filters when visible=false in Vue', () => {
      expect(
        dashboardComposer.toDashboardCode({
          dashboardOid: 'SOME_DASHBOARD_OID',
          config: {
            filtersPanel: { visible: false },
          },
          uiFramework: 'vue',
        }),
      ).toMatchSnapshot();
    });
  });
});
