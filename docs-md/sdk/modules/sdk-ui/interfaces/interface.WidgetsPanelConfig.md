---
title: WidgetsPanelConfig
---

# Interface WidgetsPanelConfig

Widgets panel configuration

## Properties

### editMode <Badge type="alpha" text="Alpha" />

> **editMode**?: [`EditModeConfig`](interface.EditModeConfig.md)

Edit mode configuration.
If enabled, an 'Edit Layout' action is visible to users on the dashboard toolbar.
Clicking 'Edit Layout' opens the dashboard in editing mode, where the user can resize or reposition widgets using drag and drop.
If history enabled, layout changes are temporarily stored during editing, with undo/redo buttons available on the toolbar.
Finally, changes are confirmed or discarded with 'Apply' or 'Cancel' buttons.

If persistence is enabled for the dashboard, changes to the layout will be saved to Fusion on clicking the 'Apply' button.

This feature is in alpha.

***

### responsive

> **responsive**?: `boolean`

If true adjust layout based on available width of widgets panel.

If not specified, the default value is `false`.
