---
title: WidgetNarrativeConfig
---

# Type alias WidgetNarrativeConfig

> **WidgetNarrativeConfig**: `object`

Narrative configuration options for widgets.

Set on a chart or pivot widget via [WidgetConfig](type-alias.WidgetConfig.md).

## Type declaration

### `autoShow`

**autoShow**?: `boolean`

Whether the narrative auto-shows on load without user interaction.

When `true`, narrative is requested and displayed as soon as the widget loads.

When `false`, narrative is requested and displayed only after user interaction.

#### Default

```ts
true (for backwards compatibility with older narrative settings in Fusion widgets)
```

***

### `displayLocation`

**displayLocation**?: [`WidgetNarrativeDisplayLocation`](type-alias.WidgetNarrativeDisplayLocation.md)

Location where the narrative is displayed in the widget. See [WidgetNarrativeDisplayLocation](type-alias.WidgetNarrativeDisplayLocation.md) for more details.

#### Default

```ts
'above'
```

***

### `enabled`

**enabled**?: `boolean`

Whether the narrative is enabled for the widget.

When `true`, narrative is enabled for the widget.

When `false`, narrative is disabled for the widget and will not be generated.

#### Default

```ts
false
```

***

### `feedback`

**feedback**?: `object`

Settings for interactive AI feedback icons.

> #### `feedback.enabled`
>
> **enabled**?: `boolean`
>
> Whether the interactive AI feedback icons are enabled.
>
> When `true`, the interactive AI feedback icons are shown.
>
> When `false`, the interactive AI feedback icons are not shown.
>
> ##### Default
>
> ```ts
> false
> ```
>
>

***

### `heightFraction`

**heightFraction**?: `number`

Maximum fraction of the content area height the narrative area may occupy.

The content area is the space below the widget header — i.e. the area previously occupied
by the chart alone. `heightFraction = 0.5` therefore means the narrative receives half the space that
was available to the chart.

Accepts a value in the range `0`–`1`.
- `undefined` (default): narrative takes whatever vertical space it needs; the chart fills the rest.
- `0.3`: narrative is capped at 30 % of the content area; the chart always receives the remaining 70 %.

Practical guidelines:
- Values above `~0.8` leave very little room for the chart.
- Values below `~0.1` may clip the collapsed narrative text (~46 px).
- Has no effect when displayLocation is `'alone'`
  (the chart is already hidden in that mode).

***

### `includeTrendAndForecast`

**includeTrendAndForecast**?: `boolean`

Whether to include trend and forecast in the narrative.

When `true`, any trend and forecast companion measures present on the widget are included in the narrative request.

When `false`, they are not included in the narrative request.

#### Default

```ts
true
```

***

### `verbosity`

**verbosity**?: `"high"` \| `"low"`

Verbosity for narrative generation.

#### Default

```ts
low
```
