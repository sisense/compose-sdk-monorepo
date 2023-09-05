import { MockParams } from 'vitest-fetch-mock';
import mockGlobals from './data/mock-globals.json';
import mockPalettes from './data/mock-palettes.json';
import mockWidgetDrilldown from './data/mock-widget-drilldown.json';
import mockJaqlDrilldown from './data/mock-jaql-drilldown.json';
import mockJaqlDates from './data/mock-jaql-dates.json';

export const mockUrl = `http://10.50.0.1:30845`;
export const mockToken = 'fake-token';
export const mockDashboardId = 'fake-dashboard-id';
export const mockWidgetId = 'fake-widget-id';

export const fetchMocks: Record<string, [string, MockParams]> = {
  globals: [JSON.stringify(mockGlobals), { status: 200 }],
  palettes: [JSON.stringify(mockPalettes), { status: 200 }],
  widgetDrilldown: [JSON.stringify(mockWidgetDrilldown), { status: 200 }],
  jaqlDrilldown: [JSON.stringify(mockJaqlDrilldown), { status: 200 }],
  jaqlDates: [JSON.stringify(mockJaqlDates), { status: 200 }],
};
