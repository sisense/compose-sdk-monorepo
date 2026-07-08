# Design Panel

The design panel is the settings sidebar shown in the Fusion editor when a user selects your widget. It reads `styleOptions` and emits an updated copy whenever a control changes.

---

## Signature

```tsx
import type { StyleOptions } from '../types.js';
import type { DesignPanelProps } from '@sisense/sdk-ui';
import React from 'react';

export const DesignPanel = React.memo(
  ({ styleOptions, onChange }: DesignPanelProps<StyleOptions>) => {
    // Always spread styleOptions when calling onChange
    const update = <K extends keyof StyleOptions>(
      key: K,
      value: StyleOptions[K]
    ) => onChange({ ...styleOptions, [key]: value });

    return <div>...</div>;
  }
);
DesignPanel.displayName = 'DesignPanel';
```

**Key rules:**

- **Always spread `styleOptions`** in every `onChange` call — partial updates silently discard other properties.
- **Always provide defaults** — `styleOptions` is `{}` on first render before the user configures anything.
- Wrap in `React.memo` to avoid unnecessary re-renders.

> **Not the same `onChange` as the visualization's.** The design panel's `onChange` takes the **full** `StyleOptions` object (spread it). The `onChange` on `CustomVisualizationProps` (used inside the rendered widget) takes a **partial patch** `{ styleOptions?, customOptions? }` and is how view-time interactions persist across reloads — see `.claude/docs/add-persistence.md`.

---

## Registration

```tsx
// src/index.tsx
import { DesignPanel } from './components/DesignPanel.js';

const plugin: WidgetPlugin = {
  customWidget: {
    designPanel: { Component: DesignPanel },
    // ...
  },
};
```

Omit `designPanel` entirely if your widget has no configurable style options.

---

## Control patterns

### Select (enum / union type)

```tsx
<select
  value={styleOptions.chartType ?? 'bar'}
  onChange={(e) =>
    update('chartType', e.target.value as StyleOptions['chartType'])
  }
>
  <option value="bar">Bar</option>
  <option value="line">Line</option>
</select>
```

### Number input

```tsx
<input
  type="number"
  min={1}
  max={100}
  value={styleOptions.itemsPerPage ?? 10}
  onChange={(e) => update('itemsPerPage', Number(e.target.value))}
/>
```

### Checkbox (boolean toggle)

```tsx
<label>
  <input
    type="checkbox"
    checked={styleOptions.showLabels ?? true}
    onChange={(e) => update('showLabels', e.target.checked)}
  />
  Show labels
</label>
```

### Range slider with live value display

```tsx
<div>
  <span>Opacity: {Math.round((styleOptions.opacity ?? 0.8) * 100)}%</span>
  <input
    type="range"
    min={0}
    max={100}
    value={Math.round((styleOptions.opacity ?? 0.8) * 100)}
    onChange={(e) => update('opacity', Number(e.target.value) / 100)}
    style={{ width: '100%' }}
  />
</div>
```

### Color picker

```tsx
<input
  type="color"
  value={styleOptions.primaryColor ?? '#1976D2'}
  onChange={(e) => update('primaryColor', e.target.value)}
/>
```

---

## Rendering environment

The design panel renders inside Fusion's widget editor sidebar at roughly **280 px wide**. A few things to keep in mind:

- **Avoid `<fieldset>` / `<legend>`** — they pick up browser-default styling (border box, gray background, indented padding) that looks out of place inside Fusion's panel. Use plain `<div>` elements with flex layout instead.
- **Font sizes:** 11–12 px for labels; 13 px for values. The panel is compact — larger text crowds quickly.
- **Width:** controls with `width: '100%'` fill the panel correctly. Fixed pixel widths wider than ~240 px will overflow.

```tsx
// Prefer this over <fieldset>/<legend>
const SectionHeader = ({ title }: { title: string }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 600,
      color: '#888',
      textTransform: 'uppercase',
      padding: '8px 0 4px',
    }}
  >
    {title}
  </div>
);
```

---

## Organizing into sections

For panels with many options, split into focused section components:

```tsx
// src/components/sections/AppearanceSection.tsx
export const AppearanceSection: React.FC<{
  styleOptions: StyleOptions;
  onChange: (updated: StyleOptions) => void;
}> = ({ styleOptions, onChange }) => (
  <div>
    <SectionHeader title="Appearance" />
    {/* controls */}
  </div>
);

// src/components/DesignPanel.tsx
export const DesignPanel = React.memo(
  ({ styleOptions, onChange }: DesignPanelProps<StyleOptions>) => (
    <div>
      <AppearanceSection styleOptions={styleOptions} onChange={onChange} />
      <DataSection styleOptions={styleOptions} onChange={onChange} />
    </div>
  )
);
```

---

## StyleOptions best practices

```ts
// src/types.ts
export interface StyleOptions extends CustomVisualizationStyleOptions {
  showLabels?: boolean; // optional with defaults in Visualization
  colorScheme?: 'blue' | 'green'; // union type — use select control
  opacity?: number; // 0–1 range — use slider
  primaryColor?: string; // hex string — use color picker
}
```

- All values must be **JSON-serializable** (no functions, class instances, Dates, or `undefined` in nested objects).
- Use `Pick<SomeSdkStyleOptions, 'field1' | 'field2'>` to reuse SDK style option types directly when wrapping built-in charts.
