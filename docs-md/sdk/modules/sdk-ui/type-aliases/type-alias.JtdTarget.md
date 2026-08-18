---
title: JtdTarget
---

# Type alias JtdTarget

> **JtdTarget**: \{
  `caption`: `string`;
  `id`: `string`;
 } \| \{
  `caption`: `string`;
  `dashboard`: [`DashboardProps`](../interfaces/interface.DashboardProps.md);
 }

Target dashboard for Jump To Dashboard functionality.
Supports both dashboard ID reference and in-code dashboard object.

A target referenced by `id` is loaded from the Sisense instance, but — unlike
[DashboardById](../fusion-assets/function.DashboardById.md) — it is always rendered read-only by default: the loaded dashboard's
edit-mode default, which follows the current user's permission to edit that dashboard, is
intentionally ignored, so a drill-through popup never shows layout drag handles or widget
deletion. To allow editing in the popup, enable it explicitly through
`targetDashboardConfig.widgetsPanel.editMode.enabled` of [JumpToDashboardConfig](../interfaces/interface.JumpToDashboardConfig.md).

A target given as `dashboard` props skips that read-only default, since its configuration comes
from the calling code rather than from the user's permissions. `targetDashboardConfig`, when
provided, still merges over it with higher priority.

## See

 - JumpToDashboardConfig
 - DashboardProps
