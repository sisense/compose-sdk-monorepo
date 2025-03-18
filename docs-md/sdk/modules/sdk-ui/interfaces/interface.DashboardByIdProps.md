---
title: DashboardByIdProps
---

# Interface DashboardByIdProps

Props of the [DashboardById](../fusion-assets/function.DashboardById.md) component.

## Properties

### dashboardOid

> **dashboardOid**: `string`

The OID of the dashboard to render.

***

### persist <Badge type="alpha" text="Alpha" />

> **persist**?: `boolean`

Boolean flag indicating whether changes to the embedded dashboard should be saved to the dashboard in Fusion.

If not specified, the default value is `false`.

Limitations:
- WAT authentication does not support persistence.
- As an alpha feature, currently only changes to dashboard filters are persisted.
