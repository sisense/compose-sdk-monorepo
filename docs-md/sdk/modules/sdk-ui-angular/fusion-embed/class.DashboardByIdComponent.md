---
title: DashboardByIdComponent
---

# Class DashboardByIdComponent <Badge type="fusionEmbed" text="Fusion Embed" /> <Badge type="beta" text="Beta" />

An Angular component used for easily rendering a dashboard by its ID created in a Sisense Fusion instance.

**Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.

## Example

```ts
import { Component } from '@angular/core';
@Component({
  selector: 'code-example',
  template: `
    <div style="width: 100vw;">
      `<csdk-dashboard-by-id *ngIf="dashboardOid" [dashboardOid]="dashboardOid" />`
    </div>
  `,
 })
export class CodeExampleComponent {
  dashboardOid = 'your-dashboard-oid';
}
```

To learn more about this and related dashboard components,
see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new DashboardByIdComponent**(`sisenseContextService`, `themeService`): [`DashboardByIdComponent`](class.DashboardByIdComponent.md)

Constructor for the `DashboardById` component.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) | Sisense context service |
| `themeService` | [`ThemeService`](../contexts/class.ThemeService.md) | Theme service |

#### Returns

[`DashboardByIdComponent`](class.DashboardByIdComponent.md)

## Properties

### Constructor

#### sisenseContextService

> **sisenseContextService**: [`SisenseContextService`](../contexts/class.SisenseContextService.md)

Sisense context service

***

#### themeService

> **themeService**: [`ThemeService`](../contexts/class.ThemeService.md)

Theme service

### Other

#### dashboardOid

> **dashboardOid**: `string`

The OID of the dashboard to render.
