---
title: DesignPanelProps
---

# Interface DesignPanelProps <Badge type="beta" text="Beta" />`<StyleOptions>`

Defines props passed to a custom design panel component.

## Example

```ts
import { DesignPanel, DesignPanelProps } from '@sisense/sdk-ui';

interface MyStyleOptions extends CustomVisualizationStyleOptions {
  color?: string;
}

const MyDesignPanel: DesignPanel<MyStyleOptions> = ({ styleOptions, onChange }) => (
  <input
    type="color"
    value={styleOptions.color ?? '#000000'}
    onChange={(e) => onChange({ ...styleOptions, color: e.target.value })}
  />
);
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `StyleOptions` | [`CustomVisualizationStyleOptions`](interface.CustomVisualizationStyleOptions.md) | The shape of style options managed by this design panel, extending [CustomVisualizationStyleOptions](interface.CustomVisualizationStyleOptions.md). |

## Properties

### onChange

> **onChange**: (`styleOptions`) => `void`

Callback invoked when the user changes a style option.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `styleOptions` | `StyleOptions` |

#### Returns

`void`

***

### styleOptions

> **styleOptions**: `StyleOptions`

Current style options managed by the design panel.
