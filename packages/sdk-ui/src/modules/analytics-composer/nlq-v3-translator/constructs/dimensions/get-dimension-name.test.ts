import { describe, expect, it } from 'vitest';

import { getDimensionName } from './get-dimension-name.js';

describe('getDimensionName', () => {
  it('strips only the DM. module prefix', () => {
    expect(getDimensionName('DM.Commerce.Date.Years')).toBe('Commerce.Date.Years');
    expect(getDimensionName('DM.Commerce.[[Age Range]]')).toBe('Commerce.[[Age Range]]');
    expect(getDimensionName('DM.Commerce.Revenue')).toBe('Commerce.Revenue');
    expect(getDimensionName('Commerce.Revenue')).toBe('Commerce.Revenue');
  });
});
