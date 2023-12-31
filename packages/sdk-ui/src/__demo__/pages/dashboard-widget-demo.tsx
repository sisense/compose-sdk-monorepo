import { Filter } from '@sisense/sdk-data';
import { DashboardWidget } from '../../dashboard-widget/dashboard-widget';
import * as DM from '../sample-ecommerce-autogenerated';

const widgetOid = window.location.hash?.replace('#', '') || '6423154e48cbdd002900cccc';
const dashboardOid = '642314fe48cbdd002900ccca';

const filters: Filter[] = [];

const drilldownOptions = {
  drilldownDimensions: [DM.Commerce.AgeRange, DM.Commerce.Gender, DM.Commerce.Condition],
};

export const DashboardWidgetDemo = () => (
  <div className="csdk-h-fit">
    <DashboardWidget
      widgetOid={widgetOid}
      dashboardOid={dashboardOid}
      filters={filters}
      drilldownOptions={drilldownOptions}
    />
  </div>
);
