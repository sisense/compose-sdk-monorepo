import { describe, expect, it } from 'vitest';

import { getTreemapAlerts } from './index.js';

describe('Treemap Alerts', () => {
  it('should return no alerts', () => {
    const alerts = getTreemapAlerts();
    expect(alerts).toHaveLength(0);
  });
});
