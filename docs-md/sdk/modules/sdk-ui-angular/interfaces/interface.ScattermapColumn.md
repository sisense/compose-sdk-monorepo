---
title: ScattermapColumn
---

# Interface ScattermapColumn

Scattermap column that allows to specify the geographic location level.

## Extends

- [`StyledColumn`](interface.StyledColumn.md)

## Properties

### column

> **column**: [`Column`](../../sdk-data/interfaces/interface.Column.md)

Wrapped Column

#### Inherited from

[`StyledColumn`](interface.StyledColumn.md).[`column`](interface.StyledColumn.md#column)

***

### continuous

> **continuous**?: `boolean`

Boolean flag to toggle continuous timeline on this date column.

#### Inherited from

[`StyledColumn`](interface.StyledColumn.md).[`continuous`](interface.StyledColumn.md#continuous)

***

### dateFormat

> **dateFormat**?: `string`

Date format.

See [ECMAScript Date Time String Format](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format)

Note that 'YYYY' and 'DD' have been disabled since they often get confused with 'yyyy' and 'dd'
and can produce unexpected results.

#### Inherited from

[`StyledColumn`](interface.StyledColumn.md).[`dateFormat`](interface.StyledColumn.md#dateformat)

***

### granularity

> **granularity**?: `string`

Date granularity that works with continuous timeline.

Values from [@sisense/sdk-data!DateLevels](../../sdk-data/variables/variable.DateLevels.md).

#### Inherited from

[`StyledColumn`](interface.StyledColumn.md).[`granularity`](interface.StyledColumn.md#granularity)

***

### isColored

> **isColored**?: `boolean`

#### Inherited from

[`StyledColumn`](interface.StyledColumn.md).[`isColored`](interface.StyledColumn.md#iscolored)

***

### level

> **level**: [`ScattermapLocationLevel`](../type-aliases/type-alias.ScattermapLocationLevel.md)

***

### numberFormatConfig

> **numberFormatConfig**?: [`NumberFormatConfig`](../type-aliases/type-alias.NumberFormatConfig.md)

Configuration for number formatting.

#### Inherited from

[`StyledColumn`](interface.StyledColumn.md).[`numberFormatConfig`](interface.StyledColumn.md#numberformatconfig)

***

### sortType

> **sortType**?: [`SortDirection`](../type-aliases/type-alias.SortDirection.md)

Sorting direction, either by Ascending order, Descending order, or None

#### Inherited from

[`StyledColumn`](interface.StyledColumn.md).[`sortType`](interface.StyledColumn.md#sorttype)
