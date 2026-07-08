import { describe, expect, it } from 'vitest';

import { fromDashboardDto, toDashboardProps } from './dashboard-model-translator.js';

describe('toDashboardProps', () => {
  it('populates the dashboard props id from the model oid', () => {
    const model = fromDashboardDto({
      oid: 'dashboard-oid-123',
      title: 'My Dashboard',
      datasource: { title: 'Sample ECommerce', id: 'localhost_aSampleIAAaECommerce' },
    });

    const props = toDashboardProps(model);

    // The OID must flow through to the props so dashboard customizations can access it.
    expect(props.id).toBe('dashboard-oid-123');
  });
});
