---
title: EditModeConfig
---

# Interface EditModeConfig

Edit mode configuration

## Properties

### applyChangesAsBatch

> **applyChangesAsBatch**?: `object`

Configuration for the edit mode history

#### Type declaration

> ##### `applyChangesAsBatch.enabled`
>
> **enabled**: `boolean`
>
> If true, changes are applied when the user clicks 'Apply'
> or discarded when the user clicks 'Cancel'.
>
> If false, changes will be applied immediately as the user makes each change
> without confirmation or the ability to cancel/undo.
>
> @default: true
>
> ##### `applyChangesAsBatch.historyLimit`
>
> **historyLimit**?: `number`
>
> The maximum number of history items to keep.
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

Flag indicating whether the edit layout feature is enabled

#### Default

```ts
false
```

***

### isEditing

> **isEditing**?: `boolean`

Flag indicating whether the dashboard is currently in edit mode.
If specified, will override inner mode state.

***

### showDragHandleIcon

> **showDragHandleIcon**?: `boolean`

Flag indicating whether the drag handle icon is visible

#### Default

```ts
true
```
