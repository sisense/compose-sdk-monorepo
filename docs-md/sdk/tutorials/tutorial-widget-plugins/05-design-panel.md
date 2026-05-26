---
title: 5 | Design Panel
hidden: true
---

# Design Panel

The design panel lets users customize your widget's appearance at design time. It appears in the Fusion widget editor sidebar and controls the `styleOptions` passed to your visualization component.

## Design Panel Component

A design panel implements [`DesignPanelProps`](../../modules/sdk-ui/interfaces/interface.DesignPanelProps.md) — it receives the current style options and an `onChange` callback:

```tsx
import type { DesignPanelProps } from '@sisense/sdk-ui';

interface MyStyleOptions {
  colorScheme: 'warm' | 'cool' | 'monochrome';
  showLegend: boolean;
}

const MyDesignPanel: React.FC<DesignPanelProps<MyStyleOptions>> = ({ styleOptions, onChange }) => {
  return (
    <div>
      <label>
        Color Scheme
        <select
          value={styleOptions.colorScheme ?? 'warm'}
          onChange={(e) =>
            onChange({
              ...styleOptions,
              colorScheme: e.target.value as MyStyleOptions['colorScheme'],
            })
          }
        >
          <option value="warm">Warm</option>
          <option value="cool">Cool</option>
          <option value="monochrome">Monochrome</option>
        </select>
      </label>
    </div>
  );
};
```

**Important:** Always spread the existing `styleOptions` when calling `onChange` to preserve other properties:

```tsx
// Correct — preserves other properties
onChange({ ...styleOptions, showLegend: false });

// Wrong — overwrites everything
onChange({ showLegend: false });
```

## Registering the Design Panel

Include it in your plugin declaration. The [`DesignPanel`](../../modules/sdk-ui/type-aliases/type-alias.DesignPanel.md) type alias describes the accepted component shape:

```tsx
const plugin: WidgetPlugin<VisualizationProps> = {
  name: 'my-custom-chart',
  version: '1.0.0',
  requiredApiVersion: '^2.27.0',
  pluginType: 'widget',
  customWidget: {
    name: 'my-custom-chart',
    displayName: 'My Custom Chart',
    visualization: { Component: Visualization },
    designPanel: {
      Component: MyDesignPanel,
    },
    dataPanel: { ... },
  },
};
```

If your widget doesn't need style customization, omit the `designPanel` field entirely.

## Organizing Sections

For complex design panels, split into focused section components:

```tsx
// sections/ColorSection.tsx
export const ColorSection: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <div>
    <h4>Colors</h4>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="warm">Warm</option>
      <option value="cool">Cool</option>
    </select>
  </div>
);

// DesignPanels.tsx
import { ColorSection } from './sections/ColorSection';

export const DesignPanels: React.FC<DesignPanelProps<MyStyleOptions>> = ({
  styleOptions,
  onChange,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <ColorSection
      value={styleOptions.colorScheme ?? 'warm'}
      onChange={(colorScheme) => onChange({ ...styleOptions, colorScheme })}
    />
  </div>
);
```

## Best Practices

1. **Define defaults** — Always provide sensible defaults in your visualization component so it renders correctly even with an empty `styleOptions`.

2. **Use `Pick` for SDK style types** — If wrapping a built-in chart, pick only the properties your design panel controls:

   ```tsx
   import type { LineStyleOptions } from '@sisense/sdk-ui';

   interface MyStyleOptions extends Pick<LineStyleOptions, 'subtype' | 'legend' | 'markers'> {}
   ```

3. **Keep types serializable** — Style options are persisted. Avoid functions, classes, or non-serializable values.

4. **Use `React.memo`** — Wrap your design panel to avoid unnecessary re-renders.

Use any CSS approach for styling your design panel (CSS modules, Emotion, Tailwind, inline styles).

---

**Next lesson:** [Event Handling and Cross-Filtering](./06-event-handling.md)
