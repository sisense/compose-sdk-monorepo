---
title: useGetSharedFormula
---

# Function useGetSharedFormula <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetSharedFormula**(`params`): `ToRefs`\< [`SharedFormulaState`](../../sdk-ui/type-aliases/type-alias.SharedFormulaState.md) \>

A Vue composable function `useGetSharedFormula` for retrieving shared formulas from Sisense.
This function enables fetching a shared formula either by its unique OID or by its name and associated data source,
providing flexibility in how shared formulas are accessed. It manages the fetch operation's state, including loading,
success, and error states, offering a reactive way to integrate Sisense formulas into Vue applications.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`UseGetSharedFormulaParams`](../interfaces/interface.UseGetSharedFormulaParams.md) \> | Parameters for fetching the shared formula, including the formula's OID,<br />or its name and the data source. This allows for precise specification of the formula to be fetched, supporting dynamic<br />values through Vue refs for reactive fetching based on user interactions or other application states. |

## Returns

`ToRefs`\< [`SharedFormulaState`](../../sdk-ui/type-aliases/type-alias.SharedFormulaState.md) \>

## Example

How to use `useGetSharedFormula` within a Vue component to fetch a shared formula:
```vue
<script setup>
import { ref } from 'vue';
import { useGetSharedFormula } from '@ethings-os/sdk-ui-vue';

// To fetch by OID
const paramsByOid = ref({
  oid: 'your_formula_oid',
});

// Or to fetch by name and dataSource
const paramsByName = ref({
  name: 'your_formula_name',
  dataSource: 'your_data_source_id',
});

const { data: formula, isLoading, isError, error } = useGetSharedFormula(paramsByOid);
// Or use `paramsByName` instead of `paramsByOid` depending on the fetching method
</script>
```

The composable returns an object with reactive properties to manage the state of the shared formula fetching process:
- `data`: The fetched shared formula, which is `undefined` until the operation completes successfully. It can be either a `CalculatedMeasure` or `DimensionalCalculatedMeasure` based on the fetch result.
- `isLoading`: Indicates whether the fetch operation is currently in progress.
- `isError`: Indicates whether an error occurred during the fetch operation.
- `isSuccess`: Indicates whether the fetch operation completed successfully without any errors.
- `error`: Contains the error object if an error occurred during the fetch.

This composable provides a streamlined, reactive approach to fetching shared formulas from Sisense, facilitating their integration into Vue applications for enhanced data analytics capabilities.
