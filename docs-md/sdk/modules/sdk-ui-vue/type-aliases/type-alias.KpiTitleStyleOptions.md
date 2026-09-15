---
title: KpiTitleStyleOptions
---

# Type alias KpiTitleStyleOptions

> **KpiTitleStyleOptions**: `object`

Configuration that defines styling of the KPI card title.

## Type declaration

### `align`

**align**?: [`KpiTitleAlign`](type-alias.KpiTitleAlign.md)

Horizontal alignment of the title section's content — the title text and the
category caption.

#### Default

```ts
'space-between'
```

***

### `enabled`

**enabled**?: `boolean`

Boolean flag that defines whether the whole title section (title text and
category caption) is shown.

#### Default

```ts
true
```

***

### `showCategoryTitle`

**showCategoryTitle**?: `boolean`

Boolean flag that defines whether the current category bucket caption
(e.g. 'DEC 2013' for a date category, or the bucket's own text — 'FEMALE' — for one that
isn't) is shown within the title section. Applicable when
[KpiChartDataOptions.category](../interfaces/interface.KpiChartDataOptions.md#category) is set.

#### Default

```ts
true
```

***

### `showValueTitle`

**showValueTitle**?: `boolean`

Boolean flag that defines whether the title text (the `text` override, or the
value measure's title) is shown within the title section.

#### Default

```ts
true
```

***

### `text`

**text**?: `string`

Title text.

#### Default

the `value` measure's title
