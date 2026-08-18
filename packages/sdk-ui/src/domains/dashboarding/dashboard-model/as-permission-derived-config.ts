import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import has from 'lodash-es/has';
import set from 'lodash-es/set';
import unset from 'lodash-es/unset';

import type { DashboardConfig } from '@/domains/dashboarding/types';
import type { DashboardUserAuth } from '@/infra/app/settings/types/role-manifest';

/**
 * Reads the permission that governs a single configuration flag.
 *
 * Returns `undefined` when the permission is not present in the authorization object, which keeps
 * the corresponding configuration flag out of the derived defaults entirely.
 */
type PermissionReader = (userAuth: DashboardUserAuth) => boolean | undefined;

/**
 * Inverts a permission that expresses a restriction rather than a grant, keeping an absent
 * permission absent so the flag still stays out of the derived defaults.
 *
 * @param restricted - The permission that withholds the affordance, absent when not reported
 * @returns The granting sense of the permission, or `undefined` when the restriction is absent
 */
const inverted = (restricted: boolean | undefined): boolean | undefined =>
  restricted === undefined ? undefined : !restricted;

/**
 * Combines permissions that Fusion requires together, keeping the absent-permission convention: a
 * single denial settles the result, and otherwise a missing permission leaves the flag out of the
 * derived defaults rather than guessing at the conjunction.
 *
 * @param permissions - The permissions Fusion requires together, each absent when not reported
 * @returns `false` when any permission denies, `undefined` when none deny but one is absent, and
 * `true` only when every permission grants
 */
const allGranted = (...permissions: readonly (boolean | undefined)[]): boolean | undefined => {
  if (permissions.includes(false)) {
    return false;
  }
  return permissions.includes(undefined) ? undefined : true;
};

/**
 * Maps one {@link DashboardConfig} flag to the dashboard permission that governs it.
 *
 * @internal
 */
type PermissionMapping = {
  /** Dot path of the flag inside {@link DashboardConfig}. */
  path: string;
  /** Reads the governing permission out of a dashboard's authorization object. */
  permission: PermissionReader;
};

/**
 * Single source of truth for configuration flags whose defaults follow the dashboard's permissions.
 *
 * Add a row here when a configuration flag should follow a dashboard permission — the transformer
 * emits an explicit value for **every** row, so a denying permission always wins over a permissive
 * code default. Deriving a flag ad hoc instead of adding a row reintroduces that bug.
 *
 * A row is faithful only when the permission gates the *same* capability the flag controls. Widening
 * a narrow permission onto a broad flag takes away affordances the permission never covered, so
 * where a permission has no matching flag, add the narrow flag rather than reach for a broad one.
 *
 * A row may revoke. `ranking.visible` and `multiSelect.visible` both default to `true`, so denying
 * `modify_type` takes them away — which is what the permission means, and because each flag is
 * scoped to the capability it names, the revocation stops there. `deleteWidget.enabled` revokes the
 * same way, from the widget delete permission. An absent `userAuth` still derives nothing, so
 * permissive defaults survive on deployments that cannot report permissions.
 *
 * A row may also grant, and the export rows below are the only ones that do: their code default is
 * already `false`, so the derivation can only ever hand an affordance out. See the reasoning there —
 * a granting row changes what a Fusion dashboard shows by default, so it needs a deliberate decision
 * rather than the mechanical faithfulness the revoking rows get by construction.
 *
 * @internal
 */
export const PERMISSION_MAPPINGS: readonly PermissionMapping[] = [
  {
    // Fusion gates entering edit mode on `toggle_edit_mode`, not on `edit_layout` — the latter
    // governs restructuring the column grid once already editing.
    path: 'widgetsPanel.editMode.enabled',
    permission: (userAuth) => userAuth.dashboards?.toggle_edit_mode,
  },
  {
    // Fusion gates renaming on `widgets.rename` in all three places it is offered — the widget
    // header menu, the inline title editor and the widget editor's toolbar — reading it from the
    // dashboard's authorization. It additionally requires the widget's own `disallowWidgetTitle`
    // option to be unset, which is per-widget and has no equivalent in a dashboard-wide flag.
    path: 'widgetsPanel.editMode.renameWidget.enabled',
    permission: (userAuth) => userAuth.widgets?.rename,
  },
  {
    // Another revoking row: deletion is offered to every widget while editing, so the code default
    // is `true` and denying `widgets.delete` takes the affordance away. Fusion gates the widget's
    // delete action on the same permission, read from the dashboard's authorization. It also hides
    // the action outside edit mode, which this flag needs no equivalent for — the menu item only
    // exists while the layout is editable.
    path: 'widgetsPanel.editMode.deleteWidget.enabled',
    permission: (userAuth) => userAuth.widgets?.delete,
  },
  {
    // Both halves of Fusion's test are needed: `duplicate` to copy the widget and `create` to add
    // the copy to the dashboard. Deriving from `duplicate` alone under-enforces, because duplication
    // is the only path that creates a widget here, so it would bypass `create` entirely.
    //
    // The two halves come from different scopes: Fusion reads `create` from the dashboard's
    // authorization, so that half is exact here, but `duplicate` from the *widget's* own. A
    // dashboard-wide flag cannot express a single widget being denied, so such a widget keeps the
    // affordance and the server refuses the write. Fusion also disables the menu item for a widget
    // the server lists in `_toDisableOptionsList`, which is a separate channel from `userAuth`
    // altogether and has no equivalent here.
    path: 'widgetsPanel.editMode.duplicateWidget.enabled',
    permission: (userAuth) => allGranted(userAuth.widgets?.duplicate, userAuth.widgets?.create),
  },
  // The two export rows are the only granting derivations here, and the only ones whose effect shows
  // in a single direction. Their code default is `false`, so a denial derives `false` and changes
  // nothing; the whole observable change is that a Fusion dashboard whose user may export now offers
  // the widget download menu without the developer opting in. That matches what those dashboards do
  // in Fusion, which is the point of deriving from `userAuth` at all, and it is an accepted breaking
  // change for consumers relying on the download menu staying hidden — setting the flags to `false`
  // explicitly still wins.
  //
  // Fusion gates both formats on the single `export_csv` permission, so both rows read it. It offers
  // Excel export only for pivot widgets, which is a per-widget distinction with no equivalent in a
  // dashboard-wide flag — a separate parity gap, not a permission one.
  {
    path: 'widgetsPanel.actions.downloadCsv.enabled',
    permission: (userAuth) => userAuth.widgets?.export_csv,
  },
  {
    path: 'widgetsPanel.actions.downloadExcel.enabled',
    permission: (userAuth) => userAuth.widgets?.export_csv,
  },
  {
    path: 'filtersPanel.actions.addFilter.enabled',
    permission: (userAuth) => userAuth.dashboards?.filters?.create,
  },
  {
    // Opening the filter editor is ungated in Fusion — verified live, a view-only share still gets
    // the edit affordance — and the write it produces is scoped to the acting user's own copy of
    // the dashboard, so it always succeeds and cannot affect anyone else. Nothing to gate on, hence
    // the constant: the grant follows from the dashboard being a Fusion dashboard at all.
    path: 'filtersPanel.actions.editFilter.enabled',
    permission: () => true,
  },
  {
    // `modify_type` governs *which filter kinds* the editor offers — documented as "include in the
    // filter options 'Ranking' and 'Starred', in addition to 'List' and 'Text'" — not whether the
    // editor opens, so it restricts the editor's contents rather than hiding it. Ranking is the only
    // one of those kinds this editor has: 'List' and 'Text' must stay, and 'Starred' has no
    // equivalent here at all. These two rows are therefore the whole faithful mapping.
    path: 'filtersPanel.actions.editFilter.ranking.visible',
    permission: (userAuth) => userAuth.dashboards?.filters?.modify_type,
  },
  {
    // The same permission gates the kinds offered while *creating* a filter, which runs through the
    // same editor.
    path: 'filtersPanel.actions.addFilter.ranking.visible',
    permission: (userAuth) => userAuth.dashboards?.filters?.modify_type,
  },
  {
    // `dashboards.filters.delete` exists in the permission manifest but nothing reads it. Fusion
    // gates the delete affordance on `widgetViewOnly`, which is the flag that actually
    // distinguishes a view-only share — `widgets.edit` stays `true` even for a viewer.
    path: 'filtersPanel.actions.deleteFilter.enabled',
    permission: (userAuth) => inverted(userAuth.widgets?.widgetViewOnly),
  },
  {
    // Like deletion, reordering is gated on the view-only flag rather than on
    // `dashboards.filters.reorder`, which is another key nothing reads. The gate is indirect: the
    // filters panel derives a "can drag" flag from view-only, and the drag directive makes a tile
    // draggable only once that flag turns true.
    path: 'filtersPanel.actions.reorderFilters.enabled',
    permission: (userAuth) => inverted(userAuth.widgets?.widgetViewOnly),
  },
  {
    // Fusion gates lock/unlock on `advanced` *and* on the dashboard being in edit mode, so a user
    // who may not enter edit mode never reaches the affordance there — hence `toggle_edit_mode` is
    // part of the test rather than `advanced` alone, which would grant locking to a viewer.
    //
    // Only the permission half of edit mode is reproduced, not the runtime state: this flag is
    // deliberately not conjoined with "currently editing", because a host that drives edit mode
    // itself would then lose the affordance whenever it keeps the dashboard out of edit mode.
    path: 'filtersPanel.actions.lockFilter.enabled',
    permission: (userAuth) =>
      allGranted(userAuth.dashboards?.filters?.advanced, userAuth.dashboards?.toggle_edit_mode),
  },
  // Fusion hides the single/multi-selection toggle in the member selector unless the user owns the
  // dashboard or holds `modify_type`, which its member selector reads directly to decide whether the
  // toggle renders at all. Verified live: absent for a view-only share. So the same permission
  // legitimately gates two distinct affordances, this toggle and the ranking conditions above; the
  // rows are not redundant.
  //
  // The ownership half of that test is not reproduced: it needs the current user's id, which neither
  // the dashboard model nor the app settings expose. An owner whose role denies `modify_type`
  // therefore keeps the toggle in Fusion but loses it here. Uncommon, since the roles that deny
  // `modify_type` are broadly the ones that do not create dashboards, but reachable — an admin may
  // deny it for any role — and setting the flag explicitly restores it.
  {
    path: 'filtersPanel.actions.addFilter.multiSelect.visible',
    permission: (userAuth) => userAuth.dashboards?.filters?.modify_type,
  },
  {
    path: 'filtersPanel.actions.editFilter.multiSelect.visible',
    permission: (userAuth) => userAuth.dashboards?.filters?.modify_type,
  },
  {
    // Another revoking row: the switch is shown by default, and `on_off` is the permission that
    // governs turning a filter on and off, so denying it takes the switch away. Every stock role
    // grants it, so this only bites a role an administrator narrowed on purpose.
    path: 'filtersPanel.actions.toggleFilter.visible',
    permission: (userAuth) => userAuth.dashboards?.filters?.on_off,
  },
  {
    // Revoking as well, and the same shape: `toggle_expansion` governs expanding and collapsing a
    // filter, so denying it hides the expand/collapse control. Hiding it does not change which
    // state a tile starts in — only the affordance to change it goes away.
    path: 'filtersPanel.actions.expandFilter.visible',
    permission: (userAuth) => userAuth.dashboards?.filters?.toggle_expansion,
  },
];

/**
 * Derives {@link DashboardConfig} defaults from a dashboard's user authorization.
 *
 * Sits between the code defaults and the developer's props, so props always win:
 * `code defaults → derived defaults → props`.
 *
 * When `userAuth` is absent — neither the V1 `expand` nor the legacy fallback returned it — nothing
 * is derived and the code defaults apply unchanged. An absent authorization object must never *grant* more than the
 * code default, and must never revoke a permissive default either: doing so would remove working
 * functionality from those deployments, and the server still rejects unauthorized writes.
 *
 * Never emits `widgetsPanel.editMode.isEditing`. The `Dashboard` component treats the mere presence
 * of that key as "the host controls edit state", so emitting it would take the runtime edit toggle
 * away from every consumer.
 *
 * @param userAuth - The dashboard's user authorization, when the server provided one
 * @returns Configuration defaults implied by the permissions, or an empty object when unavailable
 * @internal
 */
export function asPermissionDerivedConfig(userAuth?: DashboardUserAuth): Partial<DashboardConfig> {
  if (!userAuth) {
    return {};
  }

  return PERMISSION_MAPPINGS.reduce<Partial<DashboardConfig>>((config, { path, permission }) => {
    const allowed = permission(userAuth);
    return allowed === undefined ? config : set(config, path, allowed);
  }, {});
}

/**
 * Strips permission-derived flags that a developer set to an explicit `undefined`.
 *
 * The deep merge that layers props over the derived defaults treats a present-but-`undefined` key
 * as an override and drops the value beneath it. Since every derived flag is optional,
 * `enabled: someOptionalBoolean` is type-legal, so a developer can silently wipe a derived default
 * without meaning to. Removing those keys makes an explicit `undefined` behave exactly like leaving
 * the flag out — "no preference" — which is what it reads as.
 *
 * Only flags in {@link PERMISSION_MAPPINGS} are touched, so keys whose mere presence carries meaning
 * — `widgetsPanel.editMode.isEditing`, which hands edit state to the host — keep working as before.
 *
 * @param config - The developer's configuration, used as the highest-priority merge layer
 * @returns The same configuration without the no-preference flags
 * @internal
 */
export function withoutUndefinedDerivedFlags<T extends Partial<DashboardConfig>>(config: T): T {
  // `has` distinguishes a key that is present and set to `undefined` from one that is simply
  // absent — the whole point of this function, and something `get` with a fallback cannot express.
  const isNoPreference = (target: T, path: string) =>
    has(target, path) && get(target, path) === undefined;

  if (!PERMISSION_MAPPINGS.some(({ path }) => isNoPreference(config, path))) {
    return config;
  }

  const result = cloneDeep(config);
  PERMISSION_MAPPINGS.forEach(({ path }) => {
    if (isNoPreference(result, path)) {
      unset(result, path);
    }
  });
  return result;
}
