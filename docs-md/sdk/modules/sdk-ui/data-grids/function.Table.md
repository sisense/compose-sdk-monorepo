---
title: Table
---

# Function Table

> **Table**(`props`): `Promise`\< `ReactNode` \> \| `ReactNode`

Table with aggregation and pagination.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`TableProps`](../interfaces/interface.TableProps.md) | Table properties |

## Returns

`Promise`\< `ReactNode` \> \| `ReactNode`

Table component

## Example

Table displaying year, condition, and total revenue from the Sample ECommerce data model.

```ts
import { Table } from '@sisense/sdk-ui';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce';

const CodeExample = () => (
  <Table
    dataSet={DM.DataSource}
    dataOptions={{
      columns: [
        { column: DM.Commerce.Date.Years, name: 'Year', dateFormat: 'yyyy' },
        DM.Commerce.Condition,
        measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
      ],
    }}
    styleOptions={{
      rowsPerPage: 12,
      height: 420,
      header: { color: { enabled: true, backgroundColor: '#94F5F0', textColor: '#121A23' } },
      rows: { alternatingColor: { enabled: true, backgroundColor: '#f2f2f2' } },
    }}
  />
);

export default CodeExample;
```

<img src="../../../img/table-example-1.png" width="700px" />
