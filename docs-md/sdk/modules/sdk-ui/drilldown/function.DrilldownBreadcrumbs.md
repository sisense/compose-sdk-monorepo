---
title: DrilldownBreadcrumbs
---

# Function DrilldownBreadcrumbs

> **DrilldownBreadcrumbs**(`props`): `Promise`\< `ReactNode` \> \| `ReactNode`

Drilldown breadcrumbs component

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`DrilldownBreadcrumbsProps`](../interfaces/interface.DrilldownBreadcrumbsProps.md) |

## Returns

`Promise`\< `ReactNode` \> \| `ReactNode`

## Example

Used as the `breadcrumbsComponent` in a [DrilldownWidget](function.DrilldownWidget.md) config, so the breadcrumbs
can be rendered separately from the chart via `isBreadcrumbsDetached`.

```ts
import { measureFactory } from '@sisense/sdk-data';
import { Chart, DataPoint, DrilldownBreadcrumbs, DrilldownWidget } from '@sisense/sdk-ui';
import * as DM from './sample-ecommerce';

const CodeExample = () => (
  <DrilldownWidget
    drilldownPaths={[DM.Category.Category, DM.Commerce.Gender, DM.Commerce.Condition]}
    initialDimension={DM.Commerce.AgeRange}
    config={{ isBreadcrumbsDetached: true, breadcrumbsComponent: DrilldownBreadcrumbs }}
  >
    {({
      drilldownFilters,
      drilldownDimension,
      onDataPointsSelected,
      onContextMenu,
      breadcrumbsComponent,
    }) => {
      const onPointsSelected = (points: DataPoint[], nativeEvent: MouseEvent) => {
        onDataPointsSelected(points, nativeEvent);
        onContextMenu({ left: nativeEvent.clientX, top: nativeEvent.clientY });
      };

      return (
        <>
          <Chart
            dataSet={DM.DataSource}
            chartType={'column'}
            dataOptions={{
              category: [drilldownDimension],
              value: [measureFactory.sum(DM.Commerce.Revenue)],
              breakBy: [],
            }}
            filters={drilldownFilters}
            onDataPointsSelected={onPointsSelected}
          />
          <div>{breadcrumbsComponent}</div>
        </>
      );
    }}
  </DrilldownWidget>
);

export default CodeExample;
```
