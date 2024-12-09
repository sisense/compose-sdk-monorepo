---
title: CommonFiltersOptions
---

# Type alias CommonFiltersOptions

> **CommonFiltersOptions**: `object`

Options for common filters defined at the dashboard level to be applied to certain widgets.

## Type declaration

### `applyMode`

**applyMode**?: \`$\{CommonFiltersApplyMode}\`

Apply mode for common filters: 'highlight' or 'filter'.

***

### `forceApplyBackgroundFilters`

**forceApplyBackgroundFilters**?: `boolean`

Boolean flag whether to apply all background filters as slice filters ignoring "disabled" state and "ignoreFilters" rules

If not specified, the default value is `true`.

***

### `ignoreFilters`

**ignoreFilters**?: [`FiltersIgnoringRules`](type-alias.FiltersIgnoringRules.md)

Filters to ignore when applying common filters.

***

### `shouldAffectFilters`

**shouldAffectFilters**?: `boolean`

Boolean flag whether widget interactions – for example, selection of bars on a bar chart –
should affect common filters.

If not specified, the default value is `true`.
