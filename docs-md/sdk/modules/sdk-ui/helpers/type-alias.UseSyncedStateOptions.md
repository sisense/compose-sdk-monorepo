---
title: UseSyncedStateOptions
---

# Type alias UseSyncedStateOptions <Badge type="beta" text="Beta" />`<T>`

> **UseSyncedStateOptions**: <`T`> `object`

Options for [useSyncedState](function.useSyncedState.md).

## Type parameters

| Parameter |
| :------ |
| `T` |

## Type declaration

### `onLocalStateChange`

**onLocalStateChange**?: (`state`) => `void`

A callback function that is triggered when the state is updated via the local setter,
but not through synchronization with `syncValue`.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `state` | `T` |

#### Returns

`void`

***

### `syncCompareFn`

**syncCompareFn**?: (`currentState`, `syncValue`) => `boolean`

A custom comparison function to determine if the external `syncValue` is different
from the current state. The default function performs a deep equality check using `isEqual`.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `currentState` | `T` |
| `syncValue` | `T` |

#### Returns

`boolean`
