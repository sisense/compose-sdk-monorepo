---
title: DesignPanel
---

# Type alias DesignPanel <Badge type="beta" text="Beta" />`<StyleOptions>`

> **DesignPanel**: <`StyleOptions`> `FunctionComponent`\< [`DesignPanelProps`](interface.DesignPanelProps.md)\< `StyleOptions` \> \>

Defines a design panel component for a custom widget.

Renders inside the widget's style/design settings pane and receives the current
`styleOptions` and an `onChange` callback to persist style changes.

## Example

```ts
import { DesignPanel, CustomVisualizationStyleOptions } from '@sisense/sdk-ui';

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
