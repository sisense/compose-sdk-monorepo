---
title: FiltersPanelComponent
---

# Class FiltersPanelComponent

Filters panel component that renders a list of filter tiles

## Example

Here's how to render a filters panel with a set of filters.

```html
<!--Component HTML template in example.component.html-->
<csdk-filters-panel
 [filters]="filtersPanelProps.filters"
 [defaultDataSource]="filtersPanelProps.defaultDataSource"
 (filtersChange)="filtersPanelProps.filtersChange($event)"
/>
```

```ts
// Component behavior in example.component.ts
import { Component } from '@angular/core';
import { type FiltersPanelProps } from '@sisense/sdk-ui-angular';
import { filterFactory } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';

@Component({
 selector: 'example',
 templateUrl: './example.component.html',
 styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
 filtersPanelProps: FiltersPanelProps = {
   filters: [
     filterFactory.members(DM.ER.Date.Years, ['2013-01-01T00:00:00']),
     filterFactory.members(DM.ER.Departments.Department, ['Cardiology']),
   ],
   defaultDataSource: DM.DataSource,
   filtersChange({ filters }) {
     this.filtersPanelProps.filters = filters;
   },
 };
}
```

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new FiltersPanelComponent**(`sisenseContextService`, `themeService`): [`FiltersPanelComponent`](class.FiltersPanelComponent.md)

Constructor for the `FiltersPanelComponent`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) | Sisense context service |
| `themeService` | [`ThemeService`](../contexts/class.ThemeService.md) | Theme service |

#### Returns

[`FiltersPanelComponent`](class.FiltersPanelComponent.md)

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

#### config

> **config**: [`FiltersPanelConfig`](../interfaces/interface.FiltersPanelConfig.md) \| `undefined`

The configuration for the filters panel

***

#### defaultDataSource

> **defaultDataSource**: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md) \| `undefined`

Default data source used for filter tiles

***

#### filters

> **filters**: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Array of filters to display

***

#### filtersChange

> **filtersChange**: `EventEmitter`\< [`FiltersPanelChangeEvent`](../type-aliases/type-alias.FiltersPanelChangeEvent.md) \>

Callback to handle changes in filters
