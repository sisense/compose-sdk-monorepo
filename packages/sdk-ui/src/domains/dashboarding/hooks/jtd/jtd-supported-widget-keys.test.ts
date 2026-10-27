import { fusionTypesOfKey } from '@/domains/widgets/widget-identity/index.js';

import {
  JTD_SUPPORTED_WIDGET_KEYS,
  JTD_SUPPORTED_WIDGET_TYPES,
  widgetTypeSupportsJtd,
} from './jtd-supported-widget-keys.js';

describe('JTD supported widget keys', () => {
  it('lists only keys that have at least one Fusion widget type', () => {
    JTD_SUPPORTED_WIDGET_KEYS.forEach((key) => {
      expect(fusionTypesOfKey(key).length).toBeGreaterThan(0);
    });
  });

  it('supports both pivot Fusion types', () => {
    expect(widgetTypeSupportsJtd('pivot')).toBe(true);
    expect(widgetTypeSupportsJtd('pivot2')).toBe(true);
  });

  it('does not support widget types outside the list', () => {
    ['tablewidget', 'chart/funnel', 'treemap', 'dashboardnarrative', 'custom'].forEach((type) => {
      expect(widgetTypeSupportsJtd(type)).toBe(false);
    });
  });

  it('derives the same Fusion widget types as the former hand-written list', () => {
    const formerList = [
      'chart/pie',
      'indicator',
      'richtexteditor',
      'chart/column',
      'chart/bar',
      'chart/line',
      'chart/area',
      'pivot',
      'pivot2',
      'chart/scatter',
      'chart/polar',
    ];
    expect([...JTD_SUPPORTED_WIDGET_TYPES].sort()).toEqual([...formerList].sort());
  });
});
