import { describe, expect, it } from 'vitest';

import { getSunburstAlerts } from './index';

describe('Sunburst Alerts', () => {
  it('should return no alerts', () => {
    const alerts = getSunburstAlerts();
    expect(alerts).toHaveLength(0);
  });
});
