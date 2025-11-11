---
title: DashboardWidgetsPanelLayoutUpdatedEvent
---

# Interface DashboardWidgetsPanelLayoutUpdatedEvent

Event triggered when the widgets panel layout is updated.

## Remarks

When `config.widgetsPanel.editMode.applyChangesAsBatch.enabled` is `true` (default),
this event is only triggered when the user applies changes (clicks "Apply"),
not during the editing process. When `false`, this event is triggered immediately
after each layout change.

## Properties

### payload

> **payload**: [`WidgetsPanelColumnLayout`](interface.WidgetsPanelColumnLayout.md)

The new widgets panel layout

***

### type

> **type**: `"widgetsPanel/layout/updated"`

Event type
