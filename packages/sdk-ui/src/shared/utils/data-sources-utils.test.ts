import type { DataSourceInfo } from '@sisense/sdk-data';

import { getDataSourceLabel, toDataSourceLabel } from './data-sources-utils.js';

describe('toDataSourceLabel', () => {
  it('should return the display name when present', () => {
    expect(toDataSourceLabel('ECommerce', 'Online Store')).toBe('Online Store');
  });

  it.each([undefined, null, '', '   '])(
    'should fall back to the title for a blank display name (%j)',
    (displayName) => {
      expect(toDataSourceLabel('ECommerce', displayName)).toBe('ECommerce');
    },
  );

  it('should return the first non-blank display name', () => {
    expect(toDataSourceLabel('ECommerce', ' ', null, 'Store')).toBe('Store');
  });
});

describe('getDataSourceLabel', () => {
  const info: DataSourceInfo = { title: 'ECommerce', type: 'elasticube' };

  it('should return the title when no display names are known', () => {
    expect(getDataSourceLabel('ECommerce')).toBe('ECommerce');
    expect(getDataSourceLabel(info)).toBe('ECommerce');
  });

  it('should resolve the server display name by title', () => {
    const serverDisplayNames = new Map([['ECommerce', 'Online Store']]);

    expect(getDataSourceLabel('ECommerce', serverDisplayNames)).toBe('Online Store');
    expect(getDataSourceLabel(info, serverDisplayNames)).toBe('Online Store');
  });

  it('should not resolve display names from inherited object keys', () => {
    expect(getDataSourceLabel('constructor', new Map())).toBe('constructor');
  });
});
