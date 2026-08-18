import { describe, expect, it } from 'vitest';

import { DashboardUserAuth } from '@/infra/app/settings/types/role-manifest.js';

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

  describe('permission-derived config', () => {
    const modelWithUserAuth = (userAuth?: Record<string, unknown>) =>
      fromDashboardDto({
        oid: 'dashboard-oid-123',
        title: 'My Dashboard',
        datasource: { title: 'Sample ECommerce', id: 'localhost_aSampleIAAaECommerce' },
        // Only the permissions under test are populated, so the cast is scoped to this partial
        // fixture and the rest of the DTO stays validated against `DashboardDto`.
        ...(userAuth ? { userAuth: userAuth as DashboardUserAuth } : {}),
      });

    it('emits filter-action and edit-mode defaults alongside tabbers', () => {
      // The derived config must extend what the translator already emits, not replace it.
      const props = toDashboardProps(
        modelWithUserAuth({
          dashboards: { toggle_edit_mode: true, filters: { create: true, advanced: false } },
          widgets: { widgetViewOnly: false },
        }),
      );

      expect(props.config).toMatchObject({
        widgetsPanel: { editMode: { enabled: true } },
        filtersPanel: {
          actions: {
            addFilter: { enabled: true },
            deleteFilter: { enabled: true },
            lockFilter: { enabled: false },
          },
        },
      });
      expect(props.config).toHaveProperty('tabbers');
    });

    it('emits nothing derived when the dashboard carries no permissions', () => {
      const props = toDashboardProps(modelWithUserAuth());

      expect(props.config?.filtersPanel).toBeUndefined();
      expect(props.config?.widgetsPanel).toBeUndefined();
    });
  });
});
