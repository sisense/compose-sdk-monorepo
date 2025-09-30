import { describe, it, expect } from 'vitest';
import { getSunburstAlerts } from './index';

describe('Sunburst Alerts', () => {
  it('should return no alerts', () => {
    const alerts = getSunburstAlerts();
    expect(alerts).toHaveLength(0);
  });
});
