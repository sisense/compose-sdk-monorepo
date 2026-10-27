---
title: DataPanelInput
---

# Interface DataPanelInput <Badge type="beta" text="Beta" />

Describes one data slot (input) of a custom widget's data panel.

Each input declares which kind of data item it accepts and how many items can be dropped into it.
The custom visualization receives the selected items in `dataOptions`, keyed by the input name.

A list of inputs is a persistence format: a saved widget stores only each input's name and items,
and hosts may restore an input's other properties by its position in the list. So, once a widget
type is in use:

- Never rename or remove an input; deprecate it instead.
- Add new inputs only at the end of the list; never insert or reorder inputs.
- Never change an input's `type`.
- Only ever raise `maxItems`.
- Only ever turn on `canColor`, `allowDimensionColor` and `canColorMembers`: they own saved data.

## Example

```ts
import { DataPanelInput } from '@sisense/sdk-ui';

const inputs: DataPanelInput[] = [
  { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
  { name: 'value', displayName: 'Value', type: 'measure', minItems: 1 },
];
```

## Properties

### canColor

> **canColor**?: `boolean`

Whether the items can be colored.

***

### canFormat

> **canFormat**?: `boolean`

Whether the items can be formatted.

***

### canSort

> **canSort**?: `boolean`

Whether the items can be sorted.

***

### displayName

> **displayName**?: `string`

The display name of the input, shown in the data panel. Must not equal the `name` of another
input.

#### Example

```ts
'Category'
```

***

### maxItems

> **maxItems**?: `number`

The maximum number of items that can be selected: a whole number of at least 1. Omit for no
limit.

#### Example

```ts
5
```

***

### minItems

> **minItems**?: `number`

The minimum number of items that must be selected.

#### Example

```ts
1
```

***

### name

> **name**: `string`

The name of the input, used as the key of the input's items in `dataOptions`.

The name is a persistence key: a saved widget stores the input's items under this name, and
loading the widget reads them back into `dataOptions` under `camelCase(name)`. Use a camelCase
name, so that `camelCase(name) === name` (for example `breakBy`, not `break-by`); any other name
is renamed to its camelCase form after the first save and load.

The name must not be `filters` or `color`, which hosts reserve.

Registering a plugin logs a warning for each input name that breaks these rules.

#### Example

```ts
'category'
```

***

### type

> **type**: `"dimension"` \| `"measure"`

The type of data item the input accepts: a dimension (attribute) or a measure.
