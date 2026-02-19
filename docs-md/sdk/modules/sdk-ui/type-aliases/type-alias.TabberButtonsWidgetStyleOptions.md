---
title: TabberButtonsWidgetStyleOptions
---

# Type alias TabberButtonsWidgetStyleOptions

> **TabberButtonsWidgetStyleOptions**: `object`

Configuration options that define style of the various elements of the tabbers buttons widget.

## Type declaration

### `descriptionColor`

**descriptionColor**?: `string`

Color of the widget description text

***

### `selectedBackgroundColor`

**selectedBackgroundColor**?: `string`

Background color of the selected tab

***

### `selectedColor`

**selectedColor**?: `string`

Text color of the selected tab

***

### `showDescription`

**showDescription**?: `boolean`

Whether to display the widget description

#### Default Value

```ts
true
```

***

### `showSeparators`

**showSeparators**?: `boolean`

Whether to show visual separators between tabs

#### Default Value

```ts
true
```

***

### `tabCornerRadius`

**tabCornerRadius**?: `"large"` \| `"medium"` \| `"none"` \| `"small"`

Corner radius style for tabs

***

### `tabsAlignment`

**tabsAlignment**?: `"center"` \| `"left"` \| `"right"`

Horizontal alignment of tabs within the widget

***

### `tabsInterval`

**tabsInterval**?: `"large"` \| `"medium"` \| `"small"` \| `number`

Spacing interval between tabs.
Can be a predefined size ('small', 'medium', 'large') or a number (treated as pixels).

#### Default

```ts
'medium'
```

#### Example

```typescript
tabsInterval: 'small'
tabsInterval: 16  // treated as 16px
```

***

### `tabsSize`

**tabsSize**?: `"large"` \| `"medium"` \| `"small"` \| `number`

Size of the tabs.
Can be a predefined size ('small', 'medium', 'large') or a number (treated as pixels).

#### Default

```ts
'medium'
```

#### Example

```typescript
tabsSize: 'medium'
tabsSize: 14  // treated as 14px
```

***

### `unselectedBackgroundColor`

**unselectedBackgroundColor**?: `string`

Background color of unselected tabs

***

### `unselectedColor`

**unselectedColor**?: `string`

Text color of unselected tabs
