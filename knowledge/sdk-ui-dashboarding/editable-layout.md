---
type: Component
title: Editable layout
description: The dnd-kit based widgets-panel editor (drag to move, drag lines to resize, header menu to delete) plus the layout-manager and undo/redo hooks that decide what the editor shows and when its result is applied.
resource: packages/sdk-ui/src/domains/dashboarding/components/editable-layout
tags: [sdk-ui, dashboarding, component, layout]
---

## Purpose

`EditableLayout` renders a `WidgetsPanelLayout` as resizable columns of resizable rows of draggable widget cells and emits a new immutable layout on every completed gesture. This doc also covers the two hooks that sit around it: `useWidgetsLayoutManagement` (`hooks/use-widgets-layout.ts`), which derives the displayed layout through managers such as the tabber, and `useEditModeWithHistory` (`hooks/use-edit-mode-with-history.tsx`), which buffers edits with undo/redo until Apply.

## Entry point

| What            | Where                                                                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component       | `EditableLayout` — `packages/sdk-ui/src/domains/dashboarding/components/editable-layout/editable-layout.tsx:192`; props `EditableLayoutProps` — `:150` (`layout`, `widgets`, `onLayoutChange`, `config.showDragHandleIcon`, `config.deleteWidgetEnabled`); `@internal`, not exported from sdk-ui |
| Mounted by      | `DashboardContainer` when `editMode` — `components/dashboard-container.tsx:110-118`                                                                                                                                                                                                              |
| Drag data       | `DropType`, `EditableLayoutDragData`, `EditableLayoutDropData` — `types.ts:6`, `:30`, `:50`                                                                                                                                                                                                      |
| Sensor          | `SmartPointerSensor` — `smart-pointer-sensor.ts:27`                                                                                                                                                                                                                                              |
| Layout math     | `helpers.ts` (see list below)                                                                                                                                                                                                                                                                    |
| Layout managers | `useWidgetsLayoutManagement`, `WidgetPanelLayoutManager` — `hooks/use-widgets-layout.ts:23`, `:7`                                                                                                                                                                                                |
| Undo/redo       | `useEditModeWithHistory` — `hooks/use-edit-mode-with-history.tsx:122` (`@internal`)                                                                                                                                                                                                              |
| Config          | `EditModeConfig` — `types.ts:319` (public type, `public-api/public.ts:46`)                                                                                                                                                                                                                       |

## Contract

Drop zone model (`types.ts:6-23`), every zone a `useDroppable` with id `DroppableZone/${id}` (`components/droppable-zone.tsx:41`):

```ts
export enum DropType {
  PLACE_LEFT = 'PLACE_LEFT',
  PLACE_RIGHT = 'PLACE_RIGHT',
  SWAP = 'SWAP',
  NEW_ROW = 'NEW_ROW',
}
```

| Overlay                                        | Rendered                                                                                                                                             | Zones (`id` passed to `DroppableZone`)                                                                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CellDropOverlay` (`cell-drop-overlay.tsx:74`) | on every cell except the dragged one, while dragging (`editable-layout.tsx:407-414`)                                                                 | full-cell `${DropType.SWAP}/${widgetId}`; left 35% `${DropType.PLACE_LEFT}/${widgetId}`; right 35% `${DropType.PLACE_RIGHT}/${widgetId}` (`:85`, `:98`, `:109`) |
| `RowDropOverlay` (`row-drop-overlay.tsx:54`)   | above each row (`id` `${columnIndex}-${rowIndex}`, `editable-layout.tsx:331-335`) and once per column as `isLastRow` (`id` `${columnIndex}`, `:427`) | `${DropType.NEW_ROW}/${id}` (`:59`)                                                                                                                             |

Collision detection prefers `pointerWithin`, falling back to `rectIntersection` (`editable-layout.tsx:295-298`), so overlapping side/swap zones resolve by pointer position.

Drag handle: `DraggableWidgetWrapper` (`draggable-widget-wrapper.tsx:87`) registers `useDraggable` id `DraggableWidgetWrapper/${widgetId}` (`:94`) and renders `data-testid={`draggable-widget-${id}`}` (`:130`, inline template literal, not a constant). It hands `WidgetDragHandle` (`:38`) to the header: `withActivator` wraps the drag icon (`createDragIconItem`, `drag-icon-header-item.tsx:30`, `aria-label="drag-handle"` `:42`, header id `WidgetHeaderTargets.DragIcon`), `withGrabArea` wraps the other title-row items listed in `DRAGGABLE_HEADER_ITEM_IDS` (`editable-layout.tsx:60-66`) so the whole title row drags. Activation requires `DRAG_ACTIVATION_DISTANCE_PX = 5` (`const.ts:1`).

Resize: `ResizableColumns` (`resizable-columns.tsx:84`, `data-testid={`resizable-column-${i}`}` `:188`, `aria-label` `column-resize-handle` `:208`) is used twice — for dashboard columns (`editable-layout.tsx:305`) and for the cells inside each row (`:338`, resizing disabled while a row has hidden cells, `:339`). The delta is clamped so both neighbours stay within min/max and the pair still sums to 100% (`resizable-columns.tsx:137-139`); widths round to 2 decimals (`:147`) and `onWidthsChange` fires once on drag end (`:175-180`). `ResizableRow` (`resizable-row.tsx:72`, `data-testid={`resizable-row-${id}`}` `:115`, `aria-label` `row-resize-handle` `:124`) reports height on drag end (`:93-98`); `EditableLayout` subtracts `WIDGET_HEADER_HEIGHT = 32` before storing (`editable-layout.tsx:254`) and adds it back in the cell CSS (`:133-138`). A row whose widgets all have `isAutoHeight` renders as a plain `SimpleRow` with no resize line (`editable-layout-row.tsx:34`).

Limits (`const.ts:4-8`): `MIN_ROW_HEIGHT = 60`, `MAX_ROW_HEIGHT = 1500`, `MIN_COLUMN_WIDTH = 128`, `MAX_COLUMN_WIDTH = Infinity`; cell-level `minHeight/maxHeight/minWidth/maxWidth` override them (`helpers.ts:675-719`).

Header menu items added per cell (`editable-layout.tsx:382-403`): `WidgetHeaderMenuTargets.DeleteWidget` when `deleteWidgetEnabled` (default `true`), and `WidgetHeaderMenuTargets.DistributeEqualWidth` always.

Layout helpers (`helpers.ts`, all pure, return a new layout): `updateRowHeight :32`, `updateLayoutWidths :77` (columns when no parent indexes, else cells), `swapWidgetsInLayout :140`, `addCellInNewColumnRow :189`, `removeWidgetFromLayoutColumn :228`, `moveWidgetInNewRow :258`, `removeWidgetsFromLayoutRow :305`, `clearColumnFromEmptyRows :329`, `moveWidgetAsideAnother :352`, `deleteWidgetFromLayout :435`, `deleteWidgetsFromLayout :470`, `findDeletedWidgetsFromLayout :494`, `distributeEqualWidthInRow :534`, `updateLayoutAfterDragAndDrop :569` (dispatch on `DropType`), `updateColumnsCountInLayout :613`, `getRowHeight :653`, `getRowMaxHeight :675`, `getRowMinHeight :689`, `getColumnMinWidths :703`, `getColumnMaxWidths :712`.

`useEditModeWithHistory` (`use-edit-mode-with-history.tsx:122`): wraps `useStateWithHistory(initialLayout, { capacity: historyCapacity })` (default `20`, `:126`); `hasChanges = currentIndex !== 0` (`:158`); Apply calls `onApply(layout)` then `clearHistory()` (`:160-163`); Cancel resets to `initialLayout`, clears history, then `onCancel()` (`:165-168`); a deep change of `initialLayout` (JSON compare) also resets (`:148-156`). Toolbar `data-testid="csdk-edit-mode-toolbar"` (`:172`) with undo/redo icon buttons and Cancel/Apply, Apply disabled while `!hasChanges` (`:187`).

`useWidgetsLayoutManagement` (`use-widgets-layout.ts:23`): displayed layout is `flow(...managers.map(m => m.manageLayout))(layout)` unless `setLayout` forced one (`:30`).

## How it connects

- `Dashboard` (`dashboard.tsx:100-164`): `isHistoryEnabled = editMode.enabled && applyChangesAsBatch.enabled`; when on, `EditableLayout.onLayoutChange` goes to `setEditModeLayoutWithHistory` and only Apply calls `handleLayoutChange`; when off every gesture calls it immediately. `handleLayoutChange` emits `'widgetsPanel/layout/updated'` and, via `findDeletedWidgetsFromLayout`, `'widgets/deleted'` (`:132-149`). See [dashboard-components](./dashboard-components.md) and [dashboard-header](./dashboard-header.md) for where the toolbar item is placed.
- `DashboardById` maps `'widgetsPanel/layout/updated'` to `UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE` (`dashboard-model/use-dashboard-model/use-dashboard-model-utils.ts:24-29`) — persistence is in [dashboard-model-reducer](./dashboard-model-reducer.md) / [persistence-manager](./persistence-manager.md).
- `useComposedDashboardInternal` feeds `useWidgetsLayoutManagement` with the tabber's manager (`use-composed-dashboard.tsx:360-369`) and exposes its `setLayout` as `setWidgetsLayout` ([composed-dashboard](./composed-dashboard.md)); hidden tabber cells are what `EditableLayout` skips (`editable-layout.tsx:309-318`). See [widget-actions](./widget-actions.md).
- `config.widgetsPanel.editMode.showDragHandleIcon` / `deleteWidget.enabled` reach the component through `DashboardContainer` (`dashboard-container.tsx:114-117`); duplicate/rename items come from [widget-actions](./widget-actions.md), not from here.

## Invariants and traps

1. `SmartPointerSensor` exists because dnd-kit's `PointerSensor` would steal pointer-down from the inline title editor; it refuses non-primary buttons and anything matching `NON_DRAGGABLE_SELECTOR` (`input, textarea, select, button, [contenteditable]..., [data-no-dnd]`, `smart-pointer-sensor.ts:6-7`). Mark new interactive header content with `data-no-dnd`.
2. Each resize line lives in its _own_ `DndContext` (`resizable-columns.tsx:192`, `resizable-row.tsx:118`), separate from the move context; a drag-end in one never reaches the other. `DraggableLine` ids are bare indexes (`${columnIndex}`, row `id`), unique only inside their context.
3. `EditableLayout` keeps an internal `useSyncedState(layout)` copy and calls `onLayoutChange` _and_ `setInternalLayout` on every gesture (`editable-layout.tsx:228-230`); callers must still pass the new layout back or the next sync resets it.
4. Hidden cells (tabber) are excluded from `rowWidths` and widths are evened out (`:309-314`) — do not persist those evened values; they never reach `onLayoutChange` because resize is disabled for such rows (`:339`).
5. `updateLayoutWidths` silently returns the input when the widths array length mismatches (`helpers.ts:84-86`, `:113-115`); a no-op resize is the symptom of a stale `widths` array.
6. The `DeleteWidget` menu item removes the cell only; the dashboard filter behind a deleted FilterWidget is removed by `useComposedDashboardInternal` (`use-composed-dashboard.tsx:421-449`), driven by `findDeletedWidgetsFromLayout`.
7. Batch mode disables duplicate and rename (`use-composed-dashboard.tsx:279-284`, `:299-304`) because those are persisted immediately and could not be undone; keep that coupling if `applyChangesAsBatch` changes.

## Related

- [Dashboard components](./dashboard-components.md) - `Dashboard`/`DashboardContainer`, the edit toggle and view-mode `ContentPanel`
- [Widget actions](./widget-actions.md) - tabber layout manager, duplicate/rename items that share the header menu
- [Dashboard model](./dashboard-model.md) - `WidgetsPanelLayout` / `WidgetsPanelCell` schema the helpers transform
- [Dashboard model reducer](./dashboard-model-reducer.md) - `WIDGETS_PANEL_LAYOUT_UPDATE` and widget deletion persistence
