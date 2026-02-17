---
title: FormulaService
---

# Class FormulaService <Badge type="fusionEmbed" text="Fusion Embed" />

Service for working with shared formulas.

## Constructors

### constructor

> **new FormulaService**(`sisenseContextService`): [`FormulaService`](class.FormulaService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |

#### Returns

[`FormulaService`](class.FormulaService.md)

## Methods

### getSharedFormula

> **getSharedFormula**(`params`): `Promise`\< [`CalculatedMeasure`](../../sdk-data/interfaces/interface.CalculatedMeasure.md) \| `null` \>

Fetch a [shared formula](https://docs.sisense.com/main/SisenseLinux/shared-formulas.htm) from a Fusion instance.

The formula can be identified either by `oid` or by `name` and `dataSource` pair.

When the retrieval is successful but the shared formula is not found, the result is `null`. When the retrieval is not successful, the promise is rejected with an error.

## Example

Retrieve a shared formula by oid:

```ts
try {
  const formula = await formulaService.getSharedFormula({
    oid: 'd61c337b-fabc-4e9e-b4cc-a30116857153',
  });

  if (formula) {
    console.log('Formula found:', formula);
  } else {
    console.log('Formula not found');
  }
} catch (error) {
  console.error('Error:', error);
}
```

## Example

Retrieve a shared formula by name and data source:

```ts
try {
  const formula = await formulaService.getSharedFormula({
    name: 'My Shared Formula',
    dataSource: DM.DataSource,
  });

  if (formula) {
    console.log('Formula found:', formula);
  } else {
    console.log('Formula not found');
  }
} catch (error) {
  console.error('Error:', error);
}
```

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetSharedFormulaParams`](../interfaces/interface.GetSharedFormulaParams.md) | Parameters for retrieving the shared formula. Must include either `oid` or both `name` and `dataSource`. |

#### Returns

`Promise`\< [`CalculatedMeasure`](../../sdk-data/interfaces/interface.CalculatedMeasure.md) \| `null` \>

Promise that resolves to the shared formula, or `null` if not found
