---
title: DashboardWidgetsDeletedEvent
---

# Interface DashboardWidgetsDeletedEvent

Event triggered when widgets are deleted from the dashboard.

## Remarks

When `config.widgetsPanel.editMode.applyChangesAsBatch.enabled` is `true` (default),
this event is only triggered when the user applies changes (clicks "Apply"),
not during the editing process. When `false`, this event is triggered immediately
after widgets are deleted.

## Properties

### payload

> **payload**: `string`[]

The oids of the widgets deleted

***

### type

> **type**: `"widgets/deleted"`

Event type
