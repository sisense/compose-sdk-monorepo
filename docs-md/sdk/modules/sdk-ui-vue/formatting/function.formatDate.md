---
title: formatDate
---

# Function formatDate

> **formatDate**(
  `value`,
  `format`,
  `options`?): `string`

Formats a single date value (Date instance or ISO 8601 string) using the
provided format mask.

Accepts standard [date-fns format tokens](https://date-fns.org/v2.30.0/docs/format)
plus the SDK's extended Angular-style masks (locale-aware; examples use en-US):

```
shortDate   → '3/15/26'                  (M/d/yy)
mediumDate  → 'Mar 15, 2026'             (MMM d, y)
longDate    → 'March 15, 2026'           (MMMM d, y)
fullDate    → 'Sunday, March 15, 2026'   (EEEE, MMMM d, y)
shortTime   → '1:45 PM'                  (h:mm a)
mediumTime  → '1:45:00 PM'               (h:mm:ss a)
short       → '3/15/26 1:45 PM'          (M/d/yy h:mm a)
medium      → 'Mar 15, 2026 1:45:00 PM'  (MMM d, y h:mm:ss a)
```

Returns the input unchanged if it matches the reserved "not available" value (`'N\A'`).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `Date` \| `string` | Date value to format. |
| `format` | `string` | Format mask string (date-fns tokens or SDK extended masks). |
| `options`? | [`FormatDateOptions`](../type-aliases/type-alias.FormatDateOptions.md) | Optional locale and date configuration. |

## Returns

`string`

Formatted date string.

## Example

```ts
formatDate(new Date('2026-03-15'), 'MM/yyyy');
// returns '03/2026'

formatDate('2026-03-15T13:45:00Z', 'shortDate');
// returns '3/15/26'  (en-US locale)

formatDate('2026-03-15T13:45:00Z', 'mediumDate');
// returns 'Mar 15, 2026'
```
