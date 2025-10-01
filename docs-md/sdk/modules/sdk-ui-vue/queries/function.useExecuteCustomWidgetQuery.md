---
title: useExecuteCustomWidgetQuery
---

# Function useExecuteCustomWidgetQuery

> **useExecuteCustomWidgetQuery**(`params`): `ToRefs`\< [`QueryState`](../../sdk-ui/type-aliases/type-alias.QueryState.md) \>

Vue composable that takes a custom widget component's props and executes a data query.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`ExecuteCustomWidgetQueryParams`](../interfaces/interface.ExecuteCustomWidgetQueryParams.md) \> | Custom widget component props containing data source, data options, filters, etc. |

## Returns

`ToRefs`\< [`QueryState`](../../sdk-ui/type-aliases/type-alias.QueryState.md) \>

Query state object with data, loading, and error states

## Example

```vue
<script setup>
import {
  useExecuteCustomWidgetQuery,
  type CustomWidgetComponentProps,
  type ExecuteCustomWidgetQueryParams,
} from '@ethings-os/sdk-ui-vue';
import * as DM from './sample-ecommerce';

const props: CustomWidgetComponentProps = {
  dataSource: DM.DataSource,
  dataOptions: {
    category: [DM.Commerce.Gender],
    value: [DM.Measures.SumRevenue],
  },
  styleOptions: {},
};

const params: ExecuteCustomWidgetQueryParams = {
  ...props,
  count: 10,
  offset: 0,
};

const { data, isLoading, isError, isSuccess } = useExecuteCustomWidgetQuery(params);
</script>
```
