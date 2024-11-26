---
title: GetHierarchyModelsParams
---

# Interface GetHierarchyModelsParams

Parameters for [useGetHierarchyModels](../fusion-assets/function.useGetHierarchyModels.md) hook.

## Properties

### alwaysIncluded

> **alwaysIncluded**?: `boolean`

A flag indicating whether to filter the retrieved hierarchies based on the `alwaysIncluded` field.

When set to true, only hierarchies with `alwaysIncluded: true` will be returned.
When set to false, only hierarchies with `alwaysIncluded: false` will be returned.
If not specified, all hierarchies will be returned.

***

### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

The data source from which to retrieve the hierarchies - e.g. `Sample ECommerce`.

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

### dimension

> **dimension**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

The dimension for which to retrieve the hierarchies.

***

### enabled

> **enabled**?: `boolean`

Boolean flag to control if the hook is executed

If not specified, the default value is `true`

***

### ids

> **ids**?: `string`[]

A list of hierarchy IDs to retrieve specific hierarchies.
