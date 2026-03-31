# Deprecation of legacy custom widget registration

## Context

When we deprecate something - we need to propose alternative to migrate, but currently the new Plugin system is not available publicly. That's why we need to postpone deprecation of the legacy custom widget registration and related types.

Legacy custom widget registration and related types (`CustomWidgetsProvider`, `useCustomWidgets`, `registerCustomWidget`, `CustomWidgetComponent` / `CustomWidgetComponentProps`, `CustomWidgetsProviderAdapter`, `CustomWidgetDataPoint`, `CustomWidgetDataPointEventHandler`, `CustomWidgetDataPointContextMenuHandler`, `CustomWidgetDataPointsEventHandler`, `CustomWidgetEventProps`) were intentionally **not** deprecated yet. This file is the prompt/plan for an AI agent or developer to apply that deprecation later.

The replacement is the Plugin system: register custom widgets via the `plugins` prop on `SisenseContextProvider` and use `CustomVisualization` / `CustomVisualizationProps` from the widget plugin types.

---

## APIs to deprecate

| File                                                                                             | Symbol                                    | Kind      |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------- | --------- |
| `packages/sdk-ui/src/infra/contexts/custom-widgets-provider/use-custom-widgets.ts`               | `useCustomWidgets`                        | hook      |
| Same file                                                                                        | `UseCustomWidgetsResult`                  | type      |
| `packages/sdk-ui/src/infra/contexts/custom-widgets-provider/custom-widgets-provider-adapter.tsx` | `CustomWidgetsProviderAdapter`            | component |
| `packages/sdk-ui/src/infra/contexts/custom-widgets-provider/custom-widgets-provider.tsx`         | `CustomWidgetsProvider`                   | component |
| `packages/sdk-ui/src/infra/contexts/custom-widgets-provider/types.ts`                            | `CustomWidgetComponentProps`              | interface |
| Same file                                                                                        | `CustomWidgetComponent`                   | type      |
| `packages/sdk-ui/src/types.ts`                                                                   | `CustomWidgetDataPoint`                   | type      |
| Same file                                                                                        | `CustomWidgetDataPointEventHandler`       | type      |
| Same file                                                                                        | `CustomWidgetDataPointContextMenuHandler` | type      |
| Same file                                                                                        | `CustomWidgetDataPointsEventHandler`      | type      |
| Same file                                                                                        | `CustomWidgetEventProps`                  | interface |

---

## Exact TSDoc to add

Add these lines to each symbol’s JSDoc/TSDoc block (after the main description, before other tags like `@group` or `@internal`).

### useCustomWidgets (hook)

```text
 * @deprecated Use the `plugins` prop on `SisenseContextProvider` instead.
 * @see {@link SisenseContextProviderProps.plugins}
```

### UseCustomWidgetsResult (type)

Same as above:

```text
 * @deprecated Use the `plugins` prop on `SisenseContextProvider` instead.
 * @see {@link SisenseContextProviderProps.plugins}
```

### CustomWidgetsProviderAdapter (component)

```text
 * @deprecated Use the `plugins` prop on `SisenseContextProvider` instead.
```

### CustomWidgetsProvider (component)

```text
 * @deprecated No longer needed. Custom widgets are registered via the Plugin system.
```

### CustomWidgetComponentProps (interface)

```text
 * @deprecated Use `CustomVisualization` instead.
 * @see {@link CustomVisualization}
```

### CustomWidgetComponent (type)

Same as above:

```text
 * @deprecated Use `CustomVisualization` instead.
 * @see {@link CustomVisualization}
```

### CustomWidgetDataPoint (type)

```text
 * @deprecated Use `CustomVisualizationDataPoint` instead.
 * @see {@link CustomVisualizationDataPoint}
```

### CustomWidgetDataPointEventHandler (type)

```text
 * @deprecated Use `CustomVisualizationDataPointEventHandler` instead.
 * @see {@link CustomVisualizationDataPointEventHandler}
```

### CustomWidgetDataPointContextMenuHandler (type)

```text
 * @deprecated Use `CustomVisualizationDataPointContextMenuHandler` instead.
 * @see {@link CustomVisualizationDataPointContextMenuHandler}
```

### CustomWidgetDataPointsEventHandler (type)

```text
 * @deprecated Use `CustomVisualizationDataPointsEventHandler` instead.
 * @see {@link CustomVisualizationDataPointsEventHandler}
```

### CustomWidgetEventProps (interface)

```text
 * @deprecated Use `CustomVisualizationEventProps` instead.
 * @see {@link CustomVisualizationEventProps}
```

---

## Steps to apply deprecation

1. Open each file listed above and add the corresponding TSDoc lines to the symbol’s comment block.
2. Run `yarn type-check` in `packages/sdk-ui` to ensure no regressions.
3. If the project generates API docs, run the docs generation (e.g. `yarn docs:gen:md`) and confirm deprecations appear as intended.
4. Optionally add a short note in release notes that the legacy custom widget APIs are deprecated in favor of the Plugin system.
