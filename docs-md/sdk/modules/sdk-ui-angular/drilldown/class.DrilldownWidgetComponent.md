---
title: DrilldownWidgetComponent
---

# Class DrilldownWidgetComponent

An Angular component designed to add drilldown functionality to any type of chart.

It acts as a wrapper around a given chart component, enhancing it with drilldown capabilities

The widget offers several features including:
- A context menu for initiating drilldown actions (can be provided as a custom component)
- Breadcrumbs that not only allow for drilldown selection slicing but also
provide an option to clear the selection (can be provided as a custom component)
- Filters specifically created for drilldown operation
- An option to navigate to the next drilldown dimension

When an `initialDimension` is specified, the `drilldownDimension` will automatically inherit its value,
even before any points on the chart are selected.
This allows for complete control over the chart's dimensions to be handed over to the DrilldownWidget

## Example

An example of using the `csdk-drilldown-widget` component to plot a `csdk-column-chart`
over the Sample Healthcare data source hosted in a Sisense instance:
```ts
// Component behavior in .component.ts
chart = {
  dataOptions: {
    category: [DM.Divisions.Divison_name],
    value: [measureFactory.sum(DM.Admissions.Cost_of_admission)],
    breakBy: [],
  },
  dataPointContextMenu: ({ point, nativeEvent }: { point: any; nativeEvent: MouseEvent }) => {
    this.drilldownResult?.onDataPointsSelected?.([point], nativeEvent);
    this.drilldownResult?.onContextMenu({
      left: nativeEvent.clientX,
      top: nativeEvent.clientY,
    });
  }
}

drilldownResult?: CustomDrilldownResult;

drilldown = {
  drilldownPaths: [DM.Patients.Gender, DM.Admissions.Surgical_Procedure],
  initialDimension: DM.Divisions.Divison_name,
  drilldownChange: (drilldownResult: CustomDrilldownResult) => {
    this.drilldownResult = drilldownResult;
    this.chart.dataOptions = {
      ...this.chart.dataOptions,
      category: [drilldownResult.drilldownDimension]
    }
  }
};
```
```html
<!--Component HTML template in .component.html-->
<csdk-drilldown-widget
  [drilldownPaths]="drilldown.drilldownPaths"
  [initialDimension]="drilldown.initialDimension"
  (drilldownResultChange)="drilldown.drilldownChange($event)"
>
  <csdk-column-chart
    [dataSet]="DM.DataSource"
    [dataOptions]="chart.dataOptions"
    [filters]="drilldownResult?.drilldownFilters || []"
    (dataPointContextMenu)="chart.dataPointContextMenu($event)"
  />
</csdk-drilldown-widget>
```
<img src="../../../img/angular-drilldown-widget-example.png" width="800px" />

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new DrilldownWidgetComponent**(`sisenseContextService`, `themeService`): [`DrilldownWidgetComponent`](class.DrilldownWidgetComponent.md)

Constructor for the `DrilldownWidgetComponent`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) | Sisense context service |
| `themeService` | [`ThemeService`](../contexts/class.ThemeService.md) | Theme service |

#### Returns

[`DrilldownWidgetComponent`](class.DrilldownWidgetComponent.md)

## Properties

### Widget

#### config

> **config**?: `Omit`\< [`DrilldownWidgetConfig`](../../sdk-ui/type-aliases/type-alias.DrilldownWidgetConfig.md) \| `undefined`, "breadcrumbsComponent \| contextMenuComponent" \> & \{
  `breadcrumbsComponent`: (`drilldownBreadcrumbsProps`) => `HTMLDivElement`;
  `contextMenuComponent`: (`contextMenuProps`) => `HTMLDivElement`;
 }

An object that allows users to pass advanced configuration options as a prop for the `DrilldownWidget` component

> ##### `config.breadcrumbsComponent`
>
> **breadcrumbsComponent**?: (`drilldownBreadcrumbsProps`) => `HTMLDivElement`
>
> ###### Parameters
>
>
> | Parameter | Type |
> | :------ | :------ |
> | `drilldownBreadcrumbsProps` | [`DrilldownBreadcrumbsProps`](../../sdk-ui/interfaces/interface.DrilldownBreadcrumbsProps.md) |
>
>
> ###### Returns
>
> `HTMLDivElement`
>
>
>
> ##### `config.contextMenuComponent`
>
> **contextMenuComponent**?: (`contextMenuProps`) => `HTMLDivElement`
>
> ###### Parameters
>
>
> | Parameter | Type |
> | :------ | :------ |
> | `contextMenuProps` | [`ContextMenuProps`](../../sdk-ui/interfaces/interface.ContextMenuProps.md) |
>
>
> ###### Returns
>
> `HTMLDivElement`
>
>
>
>

***

#### drilldownPaths

> **drilldownPaths**: ([`Attribute`](../../sdk-data/interfaces/interface.Attribute.md) \| [`Hierarchy`](../interfaces/interface.Hierarchy.md))[] \| `undefined`

Dimensions and hierarchies available for drilldown on.

***

#### initialDimension

> **initialDimension**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Initial dimension to apply first set of filters to

### Callbacks

#### drilldownResultChange

> **drilldownResultChange**: `EventEmitter`\< [`CustomDrilldownResult`](../type-aliases/type-alias.CustomDrilldownResult.md) \>

Drilldown result change handler callback

### Constructor

#### sisenseContextService

> **sisenseContextService**: [`SisenseContextService`](../contexts/class.SisenseContextService.md)

Sisense context service

***

#### themeService

> **themeService**: [`ThemeService`](../contexts/class.ThemeService.md)

Theme service
