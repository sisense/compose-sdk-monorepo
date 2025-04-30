import * as dashboardComposer from './dashboard-composer.js';
import { DashboardCodeParams } from '../types.js';
import { dashboardModelTranslator } from '@/index';
import { sampleEcommerceDashboard } from '@/models/__mocks__/sample-ecommerce-dashboard.js';

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
  });
});
