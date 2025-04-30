---
title: TranslationConfig
---

# Type alias TranslationConfig

> **TranslationConfig**: `object`

Translation Configuration

## Type declaration

### `customTranslations`

**customTranslations**?: [`CustomTranslationObject`](../../sdk-ui/type-aliases/type-alias.CustomTranslationObject.md)[]

Additional translation resources to be loaded.

You can find the list of available translation keys in the translation folder of every package.

Translation keys that are not provided will default to the English translation.
If translation is provided for a package other than sdk-ui, please specify the namespace property.

Important: Do not translate parts in {{}} - these are placeholders for dynamic values and will be matched using provided variable names.

#### Example

```ts
customTranslations: [
  {
    language: 'fr',
    resources: {
      errors: {
       invalidFilterType: 'Type de filtre invalide',
      },
    },
  },
  {
    language: 'es',
    namespace: 'sdkData'
    resources: {
      errors: {
        measure: {
          unsupportedType: 'Tipo de medida no compatible',
        },
      },
    },
  },
]
```

***

### `language`

**language**?: `string`

Language code to be used for translations.
