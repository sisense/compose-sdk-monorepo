---
title: PluginComponent
---

# Type alias PluginComponent <Badge type="alpha" text="Alpha" />`<DataOptions, StyleOptions>`

> **PluginComponent**: <`DataOptions`, `StyleOptions`> (`props`) => `ReactNode`

A user-defined widget component. This is can be specified when registering a
plugin with `registerPlugin` from the `usePlugins` hook.

## Type parameters

| Parameter | Default |
| :------ | :------ |
| `DataOptions` | [`GenericDataOptions`](type-alias.GenericDataOptions.md) |
| `StyleOptions` | `any` |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`PluginComponentProps`](../interfaces/interface.PluginComponentProps.md)\< `DataOptions`, `StyleOptions` \> |

## Returns

`ReactNode`
