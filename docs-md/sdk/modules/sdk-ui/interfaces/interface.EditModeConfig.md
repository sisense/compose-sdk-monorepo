---
title: EditModeConfig
---

# Interface EditModeConfig

Edit mode configuration

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
> @default: true
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

> **enabled**: `boolean`

If `true` the editable layout feature is enabled for the end user.

If `false` the end user is unable to edit the layout of widgets in the dashboard.

When persistence is enabled combined with `editMode` for a Fusion dashboard, changes to the layout will saved to Fusion.

#### Default

```ts
false
```

***

### isEditing

> **isEditing**?: `boolean`

Indicates whether the dashboard is currently in edit mode.

If set, this controls whether editing is currently in progress,
which by default is automatically managed from UI interactions with the dashboard toolbar menu/buttons.

***

### showDragHandleIcon

> **showDragHandleIcon**?: `boolean`

Determines whether the drag handle icon should be displayed on the
header of each widget when layout editing is possible.

#### Default

```ts
true
```
