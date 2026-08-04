---
title: DashboardHeaderItemComponent
---

# Type alias DashboardHeaderItemComponent

> **DashboardHeaderItemComponent**: `Type`\< [`DashboardHeaderItemComponentProps`](../interfaces/interface.DashboardHeaderItemComponentProps.md) \>

An Angular component class that renders the content of a custom dashboard header item.

The item size resolved by the header layout is provided via the `size` input, which the component
declares even when it renders at a fixed size.

## Example

An Angular header item component rendering an export button that uses its resolved size:
```ts
import { Component, Input } from '@angular/core';
import { type DashboardHeaderItemComponentProps } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'app-export-button',
  template: '<button [style.height.px]="size.height" (click)="onExport()">Export</button>',
})
export class ExportButtonComponent {
  @Input() size!: DashboardHeaderItemComponentProps['size'];

  onExport() {
    // trigger the export
  }
}
```
