---
title: FilterTileActionsConfig
---

# Interface FilterTileActionsConfig

Configuration for the actions available within a filter tile.

## Properties

### lockFilter

> **lockFilter**?: `object`

Configuration for locking a filter.

A locked filter is rendered read-only: its value cannot be changed from the tile, and the
tile's edit, delete, and enable/disable controls are hidden. Locked filters are also left
untouched by cross-filtering.

#### Type declaration

> ##### `lockFilter.enabled`
>
> **enabled**?: `boolean`
>
> Determines whether the possibility to lock a filter is enabled.
>
> Locking a filter reports the new state through the tile's change callback, like any other
> change made from the tile. Since the caller owns the filter's state, that handler has to pass
> the filter it receives through as-is — rebuilding it from its value drops the lock.
>
> A tile rendered inside a `FiltersPanel` follows the panel's
> `FiltersPanelConfig.actions.lockFilter.enabled` instead of this setting.
>
> ###### Default
>
> ```ts
> true
> ```
>
>
