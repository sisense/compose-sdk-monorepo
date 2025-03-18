---
title: GetFilterMembersParams
---

# Interface GetFilterMembersParams

Params for [useGetFilterMembers](../filter-tiles/function.useGetFilterMembers.md)

## Properties

### defaultDataSource

> **defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Default data source to use if filter does not have one

***

### enabled

> **enabled**?: `boolean`

Boolean flag to control if the hook is executed

If not specified, the default value is `true`

***

### filter

> **filter**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Provided members filter

***

### parentFilters

> **parentFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

List of filters this filter is dependent on
