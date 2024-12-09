---
title: MembersFilterConfig
---

# Interface MembersFilterConfig

Configurations for members filter

## Properties

### Base Configurations

#### disabled

> **disabled**?: `boolean`

Boolean flag whether the filter is disabled

If not specified, the default value is `false`.

***

#### guid

> **`readonly`** **guid**?: `string`

Optional filter identifier

If not provided, a unique identifier will be generated.

***

#### locked

> **locked**?: `boolean`

Boolean flag whether the filter is locked

If not specified, the default value is `false`.

### Extended Configurations

#### deactivatedMembers

> **deactivatedMembers**?: `string`[]

Optional list of members to be shown as deactivated in the `MemberFilterTile` component.

This list should not contain members that are already included in the filter.

***

#### enableMultiSelection

> **enableMultiSelection**?: `boolean`

Boolean flag whether selection of multiple members is enabled

If not specified, the default value is `true`.

***

#### excludeMembers

> **excludeMembers**?: `boolean`

Boolean flag whether selected members are excluded or included in the filter

If not specified, the default value is false.

### Other

#### backgroundFilter

> **backgroundFilter**?: [`Filter`](interface.Filter.md)

Optional filter to be applied in the background
