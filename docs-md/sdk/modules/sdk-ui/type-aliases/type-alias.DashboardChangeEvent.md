---
title: DashboardChangeEvent
---

# Type alias DashboardChangeEvent

> **DashboardChangeEvent**: [`DashboardFiltersPanelCollapseChangedEvent`](../interfaces/interface.DashboardFiltersPanelCollapseChangedEvent.md) \| [`DashboardFiltersUpdatedEvent`](../interfaces/interface.DashboardFiltersUpdatedEvent.md) \| [`DashboardWidgetsDeletedEvent`](../interfaces/interface.DashboardWidgetsDeletedEvent.md) \| [`DashboardWidgetsPanelIsEditingChangedEvent`](../interfaces/interface.DashboardWidgetsPanelIsEditingChangedEvent.md) \| [`DashboardWidgetsPanelLayoutUpdatedEvent`](../interfaces/interface.DashboardWidgetsPanelLayoutUpdatedEvent.md)

Events that can be triggered by the Dashboard component

## Example

Example of a filters update event:

```ts
{ type: 'filters/updated', payload: filters }
```
