---
title: DashboardConfig
---

# Interface DashboardConfig

Dashboard configuration

## Properties

### filtersPanel

> **filtersPanel**?: [`DashboardFiltersPanelConfig`](interface.DashboardFiltersPanelConfig.md)

Configuration for the filters panel

***

### toolbar

> **toolbar**?: `object`

Configuration for the toolbar

#### Type declaration

> ##### `toolbar.visible`
>
> **visible**: `boolean`
>
> Determines whether the toolbar is visible.
>
> If not specified, the default value is `false`.
>
>

***

### widgetsPanel

> **widgetsPanel**?: `object`

Configuration for the widgets panel

#### Type declaration

> ##### `widgetsPanel.editMode`
>
> **editMode**?: `boolean`
>
> If true, an 'Edit Layout' action is visible to users on the dashboard toolbar.
> Clicking 'Edit Layout' opens the dashboard in editing mode, where the user can resize or reposition widgets using drag and drop.
> Layout changes are temporarily stored during editing, with undo/redo buttons available on the toolbar.
> Finally, changes are confirmed or discarded with 'Apply' or 'Cancel' buttons.
>
> If persistence is enabled for the dashboard, changes to the layout will be saved to Fusion on clicking the 'Apply' button.
>
> This feature is in alpha.
>
> ##### `widgetsPanel.responsive`
>
> **responsive**?: `boolean`
>
> If true adjust layout based on available width of widgets panel.
>
> If not specified, the default value is `false`.
>
>
