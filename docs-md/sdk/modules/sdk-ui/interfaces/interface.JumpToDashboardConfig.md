---
title: JumpToDashboardConfig
---

# Interface JumpToDashboardConfig

Configuration for Jump To Dashboard functionality.
Allows users to navigate from a widget to another dashboard with contextual filtering.

## Properties

### enabled

> **enabled**?: `boolean`

Whether Jump To Dashboard functionality is enabled

#### Default

```ts
true
```

***

### filtering

> **filtering**?: `object`

Configuration for filter handling between source and target dashboards

#### Type declaration

> ##### `filtering.extraFilters`
>
> **extraFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]
>
> Additional filters to apply to the target dashboard
>
> ###### Example
>
> ```ts
> const extraFilters = [dashboardProps.filters[0], dashboardProps.widgets[0].filters[0]]
> ```
>
> ###### Default
>
> ```ts
> []
> ```
>
> ##### `filtering.includeDashboardFilters`
>
> **includeDashboardFilters**?: `string`[]
>
> Dashboard-level filter dimensions to pass through
>
> undefined - include all
> [] - include nothing
> [string] - include specific dimensions
>
> example: ["[ER.Date (Calendar)]", "[Doctors.Specialty]"]
>
> ###### Default
>
> ```ts
> undefined
> ```
>
> ##### `filtering.includeWidgetFilters`
>
> **includeWidgetFilters**?: `string`[]
>
> Widget-level filter dimensions to pass through
>
> undefined - include all
> [] - include nothing
> [string] - include specific dimensions
>
> example: ["[ER.Date (Calendar)]", "[Doctors.Specialty]"]
>
> ###### Default
>
> ```ts
> undefined
> ```
>
> ##### `filtering.mergeWithTargetFilters`
>
> **mergeWithTargetFilters**?: `boolean`
>
> Whether to merge filters with existing target dashboard filters or replace them
>
> ###### Default
>
> ```ts
> false
> ```
>
>

***

### interaction

> **interaction**?: `object`

Configuration for user interaction behavior

#### Type declaration

> ##### `interaction.captionPrefix`
>
> **captionPrefix**?: `string`
>
> Caption prefix for jumping action (i.e in context menu)
>
> ###### Default
>
> ```ts
> 'Jump to'
> ```
>
> ##### `interaction.showIcon`
>
> **showIcon**?: `boolean`
>
> Whether to show the Jump To Dashboard icon in the toolbar of the source widget
>
> ###### Default
>
> ```ts
> true
> ```
>
> ##### `interaction.triggerMethod`
>
> **triggerMethod**?: [`TriggerMethod`](../type-aliases/type-alias.TriggerMethod.md)
>
> How users trigger the jump action
> Note that not all widgets support both trigger methods
>
> ###### Default
>
> ```ts
> 'rightclick'
> ```
>
>

***

### modal

> **modal**?: `object`

Configuration for the modal window that will display the target dashboard

#### Type declaration

> ##### `modal.height`
>
> **height**?: `number`
>
> Height of the modal window
>
> ###### Default
>
> ```ts
> 85 (when measurementUnit is '%') or 800 (when measurementUnit is 'px')
> ```
>
> ##### `modal.measurementUnit`
>
> **measurementUnit**?: `"%"` \| `"px"`
>
> Unit of measurement for width/height
>
> ###### Default
>
> ```ts
> 'px'
> ```
>
> ##### `modal.width`
>
> **width**?: `number`
>
> Width of the modal window
>
> ###### Default
>
> ```ts
> 85 (when measurementUnit is '%') or 1200 (when measurementUnit is 'px')
> ```
>
>

***

### targetDashboardConfig

> **targetDashboardConfig**?: [`DashboardConfig`](interface.DashboardConfig.md)

Configuration for the target dashboard display.
This configuration will be merged with target dashboard config, having higher priority

#### Default

```ts
{}
```

***

### targets

> **targets**: [`JtdTarget`](../type-aliases/type-alias.JtdTarget.md)[]

List of target dashboards that can be navigated to
