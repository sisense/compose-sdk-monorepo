---
title: CustomTranslationObject
---

# Type alias CustomTranslationObject

> **CustomTranslationObject**: `object`

Custom translation object.

## Type declaration

### `language`

**language**: `string`

The language code of the translations.

***

### `namespace`

**namespace**?: `string`

The translation namespace (usually a package name in camelCase). It identifies the specific context in which the translation is being registered.
If not specified, the default value is `sdkUi`.

***

### `resources`

**resources**: [`NestedTranslationResources`](type-alias.NestedTranslationResources.md)

The translation resources.
