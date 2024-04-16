---
title: useGetSharedFormula
---

# Function useGetSharedFormula <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetSharedFormula**(...`args`): [`SharedFormulaState`](../type-aliases/type-alias.SharedFormulaState.md)

Fetch a [shared formula](https://docs.sisense.com/main/SisenseLinux/shared-formulas.htm) from the a Fusion Embed instance.

The formula can be identified either by `oid` or by name and data source pair.

When the retrieval is successful but the shared formula is not found, the resulting `formula` is `null`. When the retrieval is not successful the resulting `formula` is `undefined`.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`UseGetSharedFormulaParams`](../interfaces/interface.UseGetSharedFormulaParams.md)] |

## Returns

[`SharedFormulaState`](../type-aliases/type-alias.SharedFormulaState.md)

Formula load state that contains the status of the execution, the result formula, or the error if any

## Example

An example of retrieving a shared formula by oid:
   ```ts
   const { formula, isLoading, isError } = useGetSharedFormula({ oid: 'd61c337b-fabc-4e9e-b4cc-a30116857153' })
   ```

## Example

An example of retrieving a shared formula by name and data source:
   ```ts
   const { formula, isLoading, isError } = useGetSharedFormula({ name: 'My Shared Formula', datasource: DM.DataSource })
   ```
