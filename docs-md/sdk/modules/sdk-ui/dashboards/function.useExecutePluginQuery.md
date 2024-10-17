---
title: useExecutePluginQuery
---

# Function useExecutePluginQuery <Badge type="alpha" text="Alpha" />

> **useExecutePluginQuery**(`__namedParameters`): `object`

React hook that takes a plugin component's props and executes a data query.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | [`PluginComponentProps`](../interfaces/interface.PluginComponentProps.md)\< [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md), `any` \> |

## Returns

### `data`

**data**: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) \| `undefined`

### `isError`

**isError**: `boolean`

### `isLoading`

**isLoading**: `boolean`
