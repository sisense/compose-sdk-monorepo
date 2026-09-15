---
title: useExecuteCustomWidgetQuery
---

# Function useExecuteCustomWidgetQuery

> **useExecuteCustomWidgetQuery**(...`args`): [`QueryState`](../type-aliases/type-alias.QueryState.md)

React hook that takes a custom widget component's props and executes a data query.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`ExecuteCustomWidgetQueryParams`](../interfaces/interface.ExecuteCustomWidgetQueryParams.md)] |

## Returns

[`QueryState`](../type-aliases/type-alias.QueryState.md)

## Example

Used inside a [CustomWidgetComponent](../type-aliases/type-alias.CustomWidgetComponent.md) to fetch the data it needs to render, based on
the `dataSource`/`dataOptions`/`filters` props supplied by the dashboard:

```ts
import { CustomWidgetComponent, useExecuteCustomWidgetQuery } from '@sisense/sdk-ui';

const MyTableWidget: CustomWidgetComponent = (props) => {
  const { data } = useExecuteCustomWidgetQuery(props);
  if (!data) return null;

  return (
    <table>
      <thead>
        <tr>
          {data.columns.map((column, i) => (
            <th key={i}>{column.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell.text}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MyTableWidget;
```
