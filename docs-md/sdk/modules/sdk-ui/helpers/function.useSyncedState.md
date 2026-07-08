---
title: useSyncedState
---

# Function useSyncedState <Badge type="beta" text="Beta" />

> **useSyncedState**<`T`>(`syncValue`, `options` = `{}`): [`T`, `Dispatch`\< `SetStateAction`\< `T` \> \>]

A custom React hook that behaves like the regular `useState`, but also synchronizes the state
with an external `syncValue`.

## Type parameters

| Parameter |
| :------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `syncValue` | `T` | The external value to synchronize with. When this value changes (as<br />  determined by `syncCompareFn`), the local state is updated to match it. |
| `options` | [`UseSyncedStateOptions`](type-alias.UseSyncedStateOptions.md)\< `T` \> | Optional configuration object. See [UseSyncedStateOptions](type-alias.UseSyncedStateOptions.md) for the<br />  `onLocalStateChange` and `syncCompareFn` fields. |

## Returns

[`T`, `Dispatch`\< `SetStateAction`\< `T` \> \>]

A tuple of `[localState, setState]` — the current local state and a setter that
  both updates state and fires `onLocalStateChange`.

## Example

```ts
const [localState, setLocalState] = useSyncedState(externalValue, {
  onLocalStateChange: (s) => console.log('local update', s),
});
```
