---
title: DashboardByIdComponent
---

# Class DashboardByIdComponent <Badge type="fusionEmbed" text="Fusion Embed" />

An Angular component used for easily rendering a dashboard by its ID created in a Sisense Fusion instance.

**Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.

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

***

#### persist <Badge type="alpha" text="Alpha" />

> **persist**: `boolean` \| `undefined`

Boolean flag indicating whether changes to the embedded dashboard should be saved to the dashboard in Fusion.

If not specified, the default value is `false`.

Limitations:
- WAT authentication does not support persistence.
- As an alpha feature, currently only changes to dashboard filters are persisted.
