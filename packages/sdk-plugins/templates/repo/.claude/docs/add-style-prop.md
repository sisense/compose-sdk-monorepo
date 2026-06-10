Add a new style property to this plugin — a setting that dashboard editors can configure in the design panel sidebar.

The user will specify: property name, TypeScript type, and preferred UI control type (select, number input, checkbox, color picker, etc.).

Make the following changes in order:

## 1. `src/types.ts` — add the property to `StyleOptions`

```ts
export interface StyleOptions extends CustomVisualizationStyleOptions {
  myNewProp?: string; // or: boolean, number, 'optA' | 'optB' | 'optC', etc.
}
```

**All properties must be optional (`?`)** — `styleOptions` starts as `{}` on first render (before the user configures anything in the design panel), so required properties would cause TypeScript errors at the call site. Always provide a fallback value when reading in `Visualization.tsx`.

Keep style options serializable — no functions, class instances, or circular references (they are persisted as JSON in the dashboard configuration).

## 2. `src/components/DesignPanel.tsx` — add a UI control

The design panel reads `styleOptions` and calls `onChange` with an updated copy.
**Always spread `styleOptions`** to preserve all other properties:

```tsx
// Select (for enum/union types)
<label>
  My Label
  <select
    value={styleOptions.myNewProp ?? 'defaultValue'}
    onChange={(e) =>
      onChange({ ...styleOptions, myNewProp: e.target.value as MyType })
    }
  >
    <option value="optA">Option A</option>
    <option value="optB">Option B</option>
  </select>
</label>

// Number input
<label>
  My Number
  <input
    type="number"
    min={1} max={100}
    value={styleOptions.myNewProp ?? 10}
    onChange={(e) =>
      onChange({ ...styleOptions, myNewProp: Number(e.target.value) })
    }
  />
</label>

// Checkbox (boolean)
<label>
  <input
    type="checkbox"
    checked={styleOptions.myNewProp ?? false}
    onChange={(e) =>
      onChange({ ...styleOptions, myNewProp: e.target.checked })
    }
  />
  My Toggle
</label>
```

Use inline styles or CSS modules for layout — no external UI library is required.

## 3. `src/components/Visualization.tsx` — consume the style option

```tsx
const { styleOptions } = props;
const myValue = styleOptions.myNewProp ?? 'defaultValue'; // always provide a fallback
```

`styleOptions` is `{}` on first render (before the user configures anything), so defaults are essential.

## 4. `src/dev-preview-props.ts` — set an initial value for dev preview

```ts
styleOptions: {
  myNewProp: 'defaultValue',
}
```

## Additional control patterns

### Range slider (numeric with visual feedback)

```tsx
<div>
  <label
    style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
  >
    <span>Opacity</span>
    <span>{Math.round((styleOptions.opacity ?? 0.8) * 100)}%</span>
  </label>
  <input
    type="range"
    min={0}
    max={100}
    value={Math.round((styleOptions.opacity ?? 0.8) * 100)}
    onChange={(e) =>
      onChange({ ...styleOptions, opacity: Number(e.target.value) / 100 })
    }
    style={{ width: '100%' }}
  />
</div>
```

### Color picker

```tsx
<label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
  Bar color
  <input
    type="color"
    value={styleOptions.barColor ?? '#1976D2'}
    onChange={(e) => onChange({ ...styleOptions, barColor: e.target.value })}
  />
</label>
```

## Complete before/after example

**Before** — no style options:

```ts
// src/types.ts
export type StyleOptions = CustomVisualizationStyleOptions;
```

**After** — adding `showLabels` toggle and `colorScheme` select:

```ts
// src/types.ts
export interface StyleOptions extends CustomVisualizationStyleOptions {
  showLabels?: boolean;
  colorScheme?: 'blue' | 'green' | 'orange';
}
```

```tsx
// src/components/DesignPanel.tsx
export const DesignPanel: React.FC<DesignPanelProps<StyleOptions>> = ({
  styleOptions,
  onChange,
}) => (
  <div
    style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
  >
    <label
      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
    >
      <input
        type="checkbox"
        checked={styleOptions.showLabels ?? true}
        onChange={(e) =>
          onChange({ ...styleOptions, showLabels: e.target.checked })
        }
      />
      Show labels
    </label>
    <label style={{ fontSize: 13 }}>
      Color scheme
      <select
        value={styleOptions.colorScheme ?? 'blue'}
        onChange={(e) =>
          onChange({
            ...styleOptions,
            colorScheme: e.target.value as StyleOptions['colorScheme'],
          })
        }
        style={{ display: 'block', marginTop: 4, width: '100%' }}
      >
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="orange">Orange</option>
      </select>
    </label>
  </div>
);
```

```tsx
// src/components/Visualization.tsx — consume with defaults
const showLabels = props.styleOptions?.showLabels ?? true;
const colorScheme = props.styleOptions?.colorScheme ?? 'blue';
```
