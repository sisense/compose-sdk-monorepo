import { describe, expect, it } from 'vitest';

import { isConnectorItem, isPillItem } from './types';

describe('isConnectorItem / isPillItem', () => {
  it('identifies connector items', () => {
    const connector = { type: 'connector' as const, label: 'by' };
    expect(isConnectorItem(connector)).toBe(true);
    expect(isPillItem(connector)).toBe(false);
  });

  it('identifies pill items', () => {
    const pill = { type: 'pill' as const, label: 'Revenue', category: 'measure' as const };
    expect(isConnectorItem(pill)).toBe(false);
    expect(isPillItem(pill)).toBe(true);
  });
});
