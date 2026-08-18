import get from 'lodash-es/get';
import has from 'lodash-es/has';
import set from 'lodash-es/set';
import { describe, expect, it } from 'vitest';

import type { DashboardUserAuth } from '@/infra/app/settings/types/role-manifest';

import {
  asPermissionDerivedConfig,
  PERMISSION_MAPPINGS,
  withoutUndefinedDerivedFlags,
} from './as-permission-derived-config';

/**
 * Builds a `DashboardUserAuth` carrying only the permissions a test cares about. The real object
 * holds the full role manifest shape, which is irrelevant here.
 */
const userAuthWith = (dashboards: Record<string, unknown>, widgets: Record<string, unknown> = {}) =>
  ({ dashboards, widgets } as unknown as DashboardUserAuth);

/** Shorthand for the nested `dashboards.filters` permissions. */
const userAuthWithFilters = (filters: Record<string, unknown>) => userAuthWith({ filters });

/**
 * One authorization fixture per mapped configuration flag, keyed by the flag's path. Kept beside the
 * mapping table so `every mapping has a fixture` fails when a new row is added without one.
 */
const MAPPING_FIXTURES: Record<string, (allowed: boolean) => DashboardUserAuth> = {
  'widgetsPanel.editMode.enabled': (allowed) => userAuthWith({ toggle_edit_mode: allowed }),
  'widgetsPanel.editMode.renameWidget.enabled': (allowed) => userAuthWith({}, { rename: allowed }),
  'widgetsPanel.editMode.deleteWidget.enabled': (allowed) => userAuthWith({}, { delete: allowed }),
  'widgetsPanel.editMode.duplicateWidget.enabled': (allowed) =>
    userAuthWith({}, { duplicate: allowed, create: allowed }),
  'widgetsPanel.actions.downloadCsv.enabled': (allowed) =>
    userAuthWith({}, { export_csv: allowed }),
  'widgetsPanel.actions.downloadExcel.enabled': (allowed) =>
    userAuthWith({}, { export_csv: allowed }),
  'filtersPanel.actions.addFilter.enabled': (allowed) => userAuthWithFilters({ create: allowed }),
  // Ungated in Fusion, so the fixture only has to produce a `userAuth`; the value is constant.
  'filtersPanel.actions.editFilter.enabled': () => userAuthWith({}),
  'filtersPanel.actions.editFilter.ranking.visible': (allowed) =>
    userAuthWithFilters({ modify_type: allowed }),
  'filtersPanel.actions.addFilter.ranking.visible': (allowed) =>
    userAuthWithFilters({ modify_type: allowed }),
  'filtersPanel.actions.deleteFilter.enabled': (allowed) =>
    userAuthWith({}, { widgetViewOnly: !allowed }),
  'filtersPanel.actions.reorderFilters.enabled': (allowed) =>
    userAuthWith({}, { widgetViewOnly: !allowed }),
  'filtersPanel.actions.lockFilter.enabled': (allowed) =>
    userAuthWith({ toggle_edit_mode: allowed, filters: { advanced: allowed } }),
  'filtersPanel.actions.addFilter.multiSelect.visible': (allowed) =>
    userAuthWithFilters({ modify_type: allowed }),
  'filtersPanel.actions.editFilter.multiSelect.visible': (allowed) =>
    userAuthWithFilters({ modify_type: allowed }),
  'filtersPanel.actions.toggleFilter.visible': (allowed) =>
    userAuthWithFilters({ on_off: allowed }),
  'filtersPanel.actions.expandFilter.visible': (allowed) =>
    userAuthWithFilters({ toggle_expansion: allowed }),
};

describe('asPermissionDerivedConfig', () => {
  describe('when userAuth is absent', () => {
    it('derives nothing, so code defaults apply unchanged', () => {
      expect(asPermissionDerivedConfig(undefined)).toEqual({});
    });

    it('does not revoke permissive code defaults on older Sisense versions', () => {
      // Absent authorization must not turn features off — that would remove working functionality
      // from deployments whose API does not return `userAuth`, with no security gain, since the
      // server rejects unauthorized writes regardless.
      expect(asPermissionDerivedConfig(undefined)).not.toHaveProperty('widgetsPanel');
    });
  });

  describe('edit mode', () => {
    it('enables edit mode when the dashboard permits toggling it', () => {
      const config = asPermissionDerivedConfig(userAuthWith({ toggle_edit_mode: true }));

      expect(config.widgetsPanel?.editMode?.enabled).toBe(true);
    });

    it('disables edit mode when the dashboard denies toggling it', () => {
      const config = asPermissionDerivedConfig(userAuthWith({ toggle_edit_mode: false }));

      expect(config.widgetsPanel?.editMode?.enabled).toBe(false);
    });

    it('is driven by toggle_edit_mode, not by edit_layout', () => {
      // Fusion moved the edit-mode gate off `edit_layout` in 2015; `edit_layout` governs
      // restructuring the column grid once already editing.
      const config = asPermissionDerivedConfig(
        userAuthWith({ toggle_edit_mode: true, edit_layout: false }),
      );

      expect(config.widgetsPanel?.editMode?.enabled).toBe(true);
    });

    it('omits the flag when the governing permission is missing', () => {
      const config = asPermissionDerivedConfig(userAuthWith({}));

      expect(config.widgetsPanel?.editMode?.enabled).toBeUndefined();
    });
  });

  describe('widget actions', () => {
    it('derives renaming from the widget rename permission', () => {
      expect(
        asPermissionDerivedConfig(userAuthWith({}, { rename: true })).widgetsPanel?.editMode
          ?.renameWidget?.enabled,
      ).toBe(true);
      expect(
        asPermissionDerivedConfig(userAuthWith({}, { rename: false })).widgetsPanel?.editMode
          ?.renameWidget?.enabled,
      ).toBe(false);
    });

    it('requires both duplicating and creating to allow duplication', () => {
      // Duplication is the only path that creates a widget, so deriving from `duplicate` alone would
      // let it bypass `create` — the gate Fusion enforces on every other widget-creation path.
      const duplicateEnabled = (widgets: Record<string, unknown>) =>
        asPermissionDerivedConfig(userAuthWith({}, widgets)).widgetsPanel?.editMode?.duplicateWidget
          ?.enabled;

      expect(duplicateEnabled({ duplicate: true, create: true })).toBe(true);
      expect(duplicateEnabled({ duplicate: true, create: false })).toBe(false);
      expect(duplicateEnabled({ duplicate: false, create: true })).toBe(false);
      expect(duplicateEnabled({ duplicate: false, create: false })).toBe(false);
    });

    it('lets a denial settle duplication even when the other permission is missing', () => {
      // A single denial is enough to answer the conjunction, so there is nothing to guess at.
      const config = asPermissionDerivedConfig(userAuthWith({}, { duplicate: false }));

      expect(config.widgetsPanel?.editMode?.duplicateWidget?.enabled).toBe(false);
    });

    it('omits duplication when a granted permission leaves the conjunction unknown', () => {
      // Neither permission denies, but one is absent, so the code default has to decide rather than
      // this guessing that the missing half is a grant.
      const config = asPermissionDerivedConfig(userAuthWith({}, { duplicate: true }));

      expect(config.widgetsPanel?.editMode?.duplicateWidget).toBeUndefined();
    });

    it('derives deletion from the widget delete permission', () => {
      expect(
        asPermissionDerivedConfig(userAuthWith({}, { delete: true })).widgetsPanel?.editMode
          ?.deleteWidget?.enabled,
      ).toBe(true);
      expect(
        asPermissionDerivedConfig(userAuthWith({}, { delete: false })).widgetsPanel?.editMode
          ?.deleteWidget?.enabled,
      ).toBe(false);
    });

    it('omits every flag when the governing permissions are missing', () => {
      const editMode = asPermissionDerivedConfig(userAuthWith({})).widgetsPanel?.editMode;

      expect(editMode?.renameWidget).toBeUndefined();
      expect(editMode?.duplicateWidget).toBeUndefined();
      // Deletion revokes: its code default is `true`, so an absent permission must leave the flag out
      // rather than derive a `false` that would take the affordance away.
      expect(editMode?.deleteWidget).toBeUndefined();
    });

    it('reproduces a view-only share: no widget action is offered', () => {
      const editMode = asPermissionDerivedConfig(
        userAuthWith(
          { toggle_edit_mode: false },
          {
            rename: false,
            duplicate: false,
            create: false,
            delete: false,
            edit: true,
            widgetViewOnly: true,
          },
        ),
      ).widgetsPanel?.editMode;

      expect(editMode?.renameWidget?.enabled).toBe(false);
      expect(editMode?.duplicateWidget?.enabled).toBe(false);
      expect(editMode?.deleteWidget?.enabled).toBe(false);
    });

    it('reproduces an edit share: every widget action is granted', () => {
      const editMode = asPermissionDerivedConfig(
        userAuthWith(
          { toggle_edit_mode: true },
          { rename: true, duplicate: true, create: true, delete: true, widgetViewOnly: false },
        ),
      ).widgetsPanel?.editMode;

      expect(editMode?.renameWidget?.enabled).toBe(true);
      expect(editMode?.duplicateWidget?.enabled).toBe(true);
      expect(editMode?.deleteWidget?.enabled).toBe(true);
    });

    it('is not driven by widgets.edit, which stays granted for a view-only share', () => {
      // `widgets.edit` is `true` even under a view share, so it is not a usable gate for anything.
      const editMode = asPermissionDerivedConfig(
        userAuthWith({}, { edit: true, rename: false, duplicate: false, create: false }),
      ).widgetsPanel?.editMode;

      expect(editMode?.renameWidget?.enabled).toBe(false);
      expect(editMode?.duplicateWidget?.enabled).toBe(false);
    });
  });

  describe('widget export actions', () => {
    const exportActions = (userAuth: DashboardUserAuth) =>
      asPermissionDerivedConfig(userAuth).widgetsPanel?.actions;

    it('offers both downloads when the user may export widget data', () => {
      // The only granting derivation: the code default is `false`, so this is the one direction in
      // which these rows change anything.
      const actions = exportActions(userAuthWith({}, { export_csv: true }));

      expect(actions?.downloadCsv?.enabled).toBe(true);
      expect(actions?.downloadExcel?.enabled).toBe(true);
    });

    it('withholds both downloads when exporting is denied', () => {
      const actions = exportActions(userAuthWith({}, { export_csv: false }));

      expect(actions?.downloadCsv?.enabled).toBe(false);
      expect(actions?.downloadExcel?.enabled).toBe(false);
    });

    it('derives Excel from the CSV permission, there being no separate Excel permission', () => {
      const actions = exportActions(userAuthWith({}, { export_csv: true, export_pdf: false }));

      expect(actions?.downloadExcel?.enabled).toBe(true);
    });

    it('omits both flags when the export permission is missing', () => {
      expect(exportActions(userAuthWith({}, { rename: true }))?.downloadCsv).toBeUndefined();
      expect(exportActions(userAuthWith({}, { rename: true }))?.downloadExcel).toBeUndefined();
    });
  });

  describe('filter actions', () => {
    it('reproduces a view-only share: values stay editable, structure does not', () => {
      // The permission shape a view share produces. Structural actions are denied, but editing is
      // not: Fusion offers the editor to a view-only share too, so only its contents narrow.
      const actions = asPermissionDerivedConfig(
        userAuthWith(
          {
            toggle_edit_mode: false,
            filters: { create: false, modify: true, modify_type: false, advanced: false },
          },
          { widgetViewOnly: true },
        ),
      ).filtersPanel?.actions;

      expect(actions?.addFilter?.enabled).toBe(false);
      expect(actions?.deleteFilter?.enabled).toBe(false);
      expect(actions?.reorderFilters?.enabled).toBe(false);
      expect(actions?.lockFilter?.enabled).toBe(false);
      // Editing stays available — Fusion offers it to a view-only share too, and the write is
      // scoped to this user's own copy — but ranking is withheld, since `modify_type` is denied.
      expect(actions?.editFilter?.enabled).toBe(true);
      expect(actions?.editFilter?.ranking?.visible).toBe(false);
      expect(actions?.addFilter?.ranking?.visible).toBe(false);
      expect(actions?.editFilter?.multiSelect?.visible).toBe(false);
    });

    it('reproduces an edit share: every filter action is granted', () => {
      const actions = asPermissionDerivedConfig(
        userAuthWith(
          {
            toggle_edit_mode: true,
            filters: { create: true, modify: true, modify_type: true, advanced: true },
          },
          { widgetViewOnly: false },
        ),
      ).filtersPanel?.actions;

      expect(actions?.addFilter?.enabled).toBe(true);
      expect(actions?.editFilter?.enabled).toBe(true);
      expect(actions?.deleteFilter?.enabled).toBe(true);
      expect(actions?.reorderFilters?.enabled).toBe(true);
      expect(actions?.lockFilter?.enabled).toBe(true);
      expect(actions?.editFilter?.ranking?.visible).toBe(true);
      expect(actions?.addFilter?.ranking?.visible).toBe(true);
      expect(actions?.editFilter?.multiSelect?.visible).toBe(true);
    });

    it('derives deleting and reordering from widgetViewOnly, not from the unused permissions', () => {
      // `dashboards.filters.delete` and `.reorder` are both dead in the permission manifest — a
      // view-only share leaves them set while the affordances are denied — so mapping onto them
      // would grant deletion and reordering to viewers.
      const actions = asPermissionDerivedConfig(
        userAuthWith({ filters: { delete: true, reorder: true } }, { widgetViewOnly: true }),
      ).filtersPanel?.actions;

      expect(actions?.deleteFilter?.enabled).toBe(false);
      expect(actions?.reorderFilters?.enabled).toBe(false);
    });

    describe('locking', () => {
      const lockEnabled = (dashboards: Record<string, unknown>) =>
        asPermissionDerivedConfig(userAuthWith(dashboards)).filtersPanel?.actions?.lockFilter;

      it('requires both advanced filters and edit mode to allow locking', () => {
        // Fusion offers lock/unlock only inside edit mode, so `advanced` alone would hand the
        // affordance to a user who may not edit the dashboard at all.
        expect(lockEnabled({ toggle_edit_mode: true, filters: { advanced: true } })?.enabled).toBe(
          true,
        );
        expect(lockEnabled({ toggle_edit_mode: false, filters: { advanced: true } })?.enabled).toBe(
          false,
        );
        expect(lockEnabled({ toggle_edit_mode: true, filters: { advanced: false } })?.enabled).toBe(
          false,
        );
        expect(
          lockEnabled({ toggle_edit_mode: false, filters: { advanced: false } })?.enabled,
        ).toBe(false);
      });

      it('lets a denial settle locking even when the other permission is missing', () => {
        // A single denial answers the conjunction, so there is nothing left to guess at.
        expect(lockEnabled({ filters: { advanced: false } })?.enabled).toBe(false);
        expect(lockEnabled({ toggle_edit_mode: false })?.enabled).toBe(false);
      });

      it('omits locking when a granted permission leaves the conjunction unknown', () => {
        // Neither permission denies, but one is absent, so the code default decides rather than this
        // guessing that the missing half is a grant.
        expect(lockEnabled({ filters: { advanced: true } })).toBeUndefined();
        expect(lockEnabled({ toggle_edit_mode: true })).toBeUndefined();
      });
    });

    it('hides the multi-select toggles when filter types may not be changed', () => {
      // The one revoking derivation: the code default is `true`, and Fusion hides the toggle for a
      // user without `modify_type` — verified live against a view-only share.
      const actions = asPermissionDerivedConfig(
        userAuthWithFilters({ create: false, modify_type: false }),
      ).filtersPanel?.actions;

      expect(actions?.addFilter?.multiSelect?.visible).toBe(false);
      expect(actions?.editFilter?.multiSelect?.visible).toBe(false);
    });

    it('keeps the tile controls when the permissions grant them', () => {
      const actions = asPermissionDerivedConfig(
        userAuthWithFilters({ on_off: true, toggle_expansion: true }),
      ).filtersPanel?.actions;

      expect(actions?.toggleFilter?.visible).toBe(true);
      expect(actions?.expandFilter?.visible).toBe(true);
    });

    it('hides the tile controls the permissions withhold', () => {
      // Two more revoking derivations: both controls are shown by default, so a role narrowed to
      // deny switching filters on and off, or expanding them, has to take them away.
      const actions = asPermissionDerivedConfig(
        userAuthWithFilters({ on_off: false, toggle_expansion: false }),
      ).filtersPanel?.actions;

      expect(actions?.toggleFilter?.visible).toBe(false);
      expect(actions?.expandFilter?.visible).toBe(false);
    });

    it('hides each tile control independently of the other', () => {
      const actions = asPermissionDerivedConfig(
        userAuthWithFilters({ on_off: false, toggle_expansion: true }),
      ).filtersPanel?.actions;

      expect(actions?.toggleFilter?.visible).toBe(false);
      expect(actions?.expandFilter?.visible).toBe(true);
    });

    it('omits the tile controls when their permissions are missing', () => {
      const actions = asPermissionDerivedConfig(userAuthWithFilters({ create: true })).filtersPanel
        ?.actions;

      expect(actions?.toggleFilter).toBeUndefined();
      expect(actions?.expandFilter).toBeUndefined();
    });

    it('leaves the permissive multi-select default alone when userAuth is absent', () => {
      // Revoking on absent authorization would remove a working affordance from deployments whose
      // API does not report permissions.
      expect(asPermissionDerivedConfig(undefined)).not.toHaveProperty('filtersPanel');
    });

    it('omits flags whose governing permission is missing', () => {
      const config = asPermissionDerivedConfig(userAuthWithFilters({ create: true }));

      expect(config.filtersPanel?.actions?.addFilter?.enabled).toBe(true);
      // `editFilter.enabled` is a constant grant, so it is present even here; only the
      // permission-dependent `ranking.visible` is omitted.
      expect(config.filtersPanel?.actions?.editFilter?.enabled).toBe(true);
      expect(config.filtersPanel?.actions?.editFilter?.ranking).toBeUndefined();
      expect(config.filtersPanel?.actions?.addFilter?.ranking).toBeUndefined();
      expect(config.filtersPanel?.actions?.deleteFilter).toBeUndefined();
      expect(config.filtersPanel?.actions?.reorderFilters).toBeUndefined();
      expect(config.filtersPanel?.actions?.lockFilter).toBeUndefined();
    });
  });

  describe('never emits isEditing', () => {
    // `Dashboard` treats the presence of `isEditing` as "the host controls edit state", so emitting
    // it — even as `undefined` — would take the runtime edit toggle away from every consumer.
    it.each([true, false])('with toggle_edit_mode: %s', (allowed) => {
      const editMode = asPermissionDerivedConfig(userAuthWith({ toggle_edit_mode: allowed }))
        .widgetsPanel?.editMode;

      expect(editMode).toBeDefined();
      expect(editMode && 'isEditing' in editMode).toBe(false);
    });
  });

  describe('withoutUndefinedDerivedFlags', () => {
    it.each(PERMISSION_MAPPINGS.map(({ path }) => path))(
      'drops an explicitly undefined %s, so the derived default survives the merge',
      (path) => {
        // `has`, not `get`: a key present and set to `undefined` is exactly what must disappear, and
        // `get` with a fallback cannot tell the two apart.
        const config = set({}, path, undefined);
        expect(has(config, path)).toBe(true);

        expect(has(withoutUndefinedDerivedFlags(config), path)).toBe(false);
      },
    );

    it.each(PERMISSION_MAPPINGS.map(({ path }) => path))(
      'keeps an explicit false for %s',
      (path) => {
        const result = withoutUndefinedDerivedFlags(set({}, path, false));

        expect(get(result, path)).toBe(false);
      },
    );

    it('keeps isEditing, whose presence alone hands edit state to the host', () => {
      // Stripping it would silently return control of the edit toggle to the component.
      const config = { widgetsPanel: { editMode: { isEditing: undefined, enabled: undefined } } };

      const result = withoutUndefinedDerivedFlags(config);

      expect('isEditing' in result.widgetsPanel!.editMode!).toBe(true);
      expect('enabled' in result.widgetsPanel!.editMode!).toBe(false);
    });

    it('does not mutate the configuration it is given', () => {
      const config = { widgetsPanel: { editMode: { enabled: undefined } } };

      withoutUndefinedDerivedFlags(config);

      expect('enabled' in config.widgetsPanel.editMode).toBe(true);
    });

    it('returns the same reference when there is nothing to drop', () => {
      const config = { filtersPanel: { actions: { addFilter: { enabled: true } } } };

      expect(withoutUndefinedDerivedFlags(config)).toBe(config);
    });

    it('does not materialise branches the configuration never had', () => {
      expect(withoutUndefinedDerivedFlags({})).toEqual({});
    });
  });

  describe('mapping table', () => {
    it('has a fixture for every mapping', () => {
      // Adding a mapping without a fixture would let it escape the both-directions guarantee below.
      expect(Object.keys(MAPPING_FIXTURES).sort()).toEqual(
        PERMISSION_MAPPINGS.map(({ path }) => path).sort(),
      );
    });

    /**
     * Flags granted unconditionally rather than from a permission — the affordance is ungated in
     * Fusion, so there is nothing to vary. They still must be emitted explicitly.
     */
    const CONSTANT_PATHS = new Set(['filtersPanel.actions.editFilter.enabled']);

    // The invariant that makes a denying permission beat a permissive code default: every mapped
    // flag must be emitted explicitly, never left absent for the default to fill in.
    it.each(PERMISSION_MAPPINGS.map(({ path }) => path))(
      '%s is emitted explicitly in both directions',
      (path) => {
        const buildUserAuth = MAPPING_FIXTURES[path];

        expect(get(asPermissionDerivedConfig(buildUserAuth(true)), path)).toBe(true);
        expect(get(asPermissionDerivedConfig(buildUserAuth(false)), path)).toBe(
          CONSTANT_PATHS.has(path) ? true : false,
        );
      },
    );
  });
});
