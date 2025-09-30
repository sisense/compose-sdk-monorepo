import { describe, it, expect } from 'vitest';
import { getTreemapAlerts } from './index';

describe('Treemap Alerts', () => {
  it('should return no alerts', () => {
    const alerts = getTreemapAlerts();
    expect(alerts).toHaveLength(0);
  });
});
