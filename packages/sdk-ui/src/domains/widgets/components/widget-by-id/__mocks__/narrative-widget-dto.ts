import { WidgetDto } from '../types.js';

/** A Fusion dashboard narrative widget as saved by the dashboard toolbar action: no panels, no style keys of its own. */
export const narrativeWidgetDto: WidgetDto = {
  _id: '6a7c86df80e710c23c5137b0',
  title: 'Dashboard Narrative',
  type: 'dashboardnarrative',
  subtype: 'dashboardnarrative',
  oid: '6a7c86df80e710c23c5137af',
  desc: null,
  source: null,
  owner: '662ba7319f04e5001cbc7f58',
  userId: '662ba7319f04e5001cbc7f58',
  created: '2026-08-12T12:17:10.314Z',
  lastUpdated: '2026-08-12T12:19:14.010Z',
  instanceType: 'owner',
  datasource: {
    address: 'LocalHost',
    title: 'Sample ECommerce',
    id: 'localhost_aSampleIAAaECommerce',
    database: 'aSampleIAAaECommerce',
    fullname: 'localhost/Sample ECommerce',
    live: false,
  },
  selection: null,
  metadata: {
    ignore: {
      dimensions: [],
      ids: [],
      all: false,
    },
    panels: [],
    usedFormulasMapping: {},
  },
  tags: [],
  style: {},
  options: {
    dashboardFiltersMode: 'select',
    selector: false,
    triggersDomready: true,
    drillToAnywhere: false,
    autoUpdateOnEveryChange: true,
  },
};
