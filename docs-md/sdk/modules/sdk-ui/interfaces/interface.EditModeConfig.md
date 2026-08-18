---
title: EditModeConfig
---

# Interface EditModeConfig

Edit mode configuration

When using [DashboardById](../fusion-assets/function.DashboardById.md) or a dashboard model loaded with
[useGetDashboardModel](../fusion-assets/function.useGetDashboardModel.md) and translated by `dashboardModelTranslator.toDashboardProps()`,
some defaults below may be derived from the current user's permissions on that dashboard, if the
Sisense Fusion instance provides it. Otherwise the documented default will be used.
Explicit configuration values have the highest precedence, and will override any defaults.
If persistence is used when defaults derived from permissions are overridden, the Sisense Fusion
API will reject changes where the current user is not allowed to perform the update.

## Properties

### applyChangesAsBatch

> **applyChangesAsBatch**?: `object`

Configuration for the edit mode user experience

#### Type declaration

> ##### `applyChangesAsBatch.enabled`
>
> **enabled**: `boolean`
>
> If `true`, a history of changes will be accumulated during editing,
> and users may undo/redo through the history of changes made during the current edit.
>
> The current layout state will be applied to the dashboard when the user clicks 'Apply',
> or discarded when the user clicks 'Cancel'.
>
> If `false`, the layout changes will be applied immediately after the user makes each change,
> without confirmation or the ability to cancel/undo.
>
> ###### Default
>
> `true`
>
> ##### `applyChangesAsBatch.historyLimit`
>
> **historyLimit**?: `number`
>
> The maximum number of history items to keep while applying changes in batch mode.
>
> History will be temporarily stored in the browser during editing.
>
> ###### Default
>
> ```ts
> 20
> ```
>
>

***

### enabled

> **enabled**?: `boolean`

If `true` the editable layout feature is enabled for the end user.

If `false` the end user is unable to edit the layout of widgets in the dashboard.

When persistence is enabled combined with `editMode` for a Fusion dashboard, changes to the layout will saved to Fusion.

#### Default

`false`, or the user's permission to toggle edit mode on a Fusion dashboard

***

### isEditing

> **isEditing**?: `boolean`

Indicates whether the dashboard is currently in edit mode.

If set, this controls whether editing is currently in progress,
which by default is automatically managed from UI interactions with the dashboard toolbar menu/buttons.

***

### renameWidget

> **renameWidget**?: `object`

Configuration for the widget renaming feature.

#### Type declaration

> ##### `renameWidget.enabled`
>
> **enabled**: `boolean`
>
> When `true`, adds a "Rename widget" menu item to each widget header.
> On click, triggers inline title editing of the widget.
> Only has effect when edit mode is also enabled (`editMode.enabled`) and batch mode is disabled (`editMode.applyChangesAsBatch.enabled`).
> If batch mode is enabled, the "Rename widget" menu item won't be applied because it would not be possible to undo/redo the rename.
>
> ###### Default
>
> `false`, or the user's permission to rename widgets on a Fusion dashboard
>
>

***

### showDragHandleIcon

> **showDragHandleIcon**?: `boolean`

Determines whether the drag handle icon should be displayed on the
header of each widget when layout editing is possible.

#### Default

```ts
true
```
