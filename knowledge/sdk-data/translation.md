---
type: Module
title: i18n & translatable errors
description: Package-scoped i18next setup and the TranslatableError class that resolves error messages from translation keys.
resource: packages/sdk-data/src/translation
tags: [sdk-data, module, i18n]
---

# Purpose

Registers sdk-data's translation dictionaries (en, uk) under a dedicated i18next namespace and exposes `TranslatableError`, whose message is resolved from a translation key at construction time. Reach for it when throwing any user-facing error in sdk-data, or when adding/overriding translations.

# Entry point

| What                      | Where                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Side-effect init          | `import './translation/initialize-i18n.js'` — packages/sdk-data/src/index.ts:1                                     |
| Export                    | `initializeI18n()` — packages/sdk-data/src/translation/initialize-i18n.ts:5                                        |
| Export                    | `i18nextInstance` (module-level singleton) — packages/sdk-data/src/translation/initialize-i18n.ts:13               |
| Export                    | `PACKAGE_NAMESPACE` — packages/sdk-data/src/translation/resources/index.ts:11                                      |
| Export                    | `resources` (`{ en, uk }`) — packages/sdk-data/src/translation/resources/index.ts:12                               |
| Type                      | `TranslationDictionary` — packages/sdk-data/src/translation/resources/en.ts:49                                     |
| Export (package-internal) | `TranslatableError` — packages/sdk-data/src/translation/translatable-error.ts:6                                    |
| Dictionaries              | en — packages/sdk-data/src/translation/resources/en.ts:4; uk — packages/sdk-data/src/translation/resources/uk.ts:6 |
| Barrel re-export          | `TranslationDictionary`, `PACKAGE_NAMESPACE as translationNamespace` — packages/sdk-data/src/index.ts:122          |

# Contract

Namespace, verbatim (packages/sdk-data/src/translation/resources/index.ts:11):

```ts
export const PACKAGE_NAMESPACE = 'sdkData' as const;
```

Error keys are dot-paths into the dictionary object, e.g. (from en.ts:4):

```text
errors.dataModel.noName
errors.dataModel.noMetadata
errors.measure.unsupportedType
errors.filter.unsupportedType
errors.unsupportedDimensionalElement
```

Resolution: `new TranslatableError(key, interpolationOptions?)` calls `AbstractTranslatableError` (packages/sdk-common/src/i18n/abstract-translatable-error.ts:5) with `PACKAGE_NAMESPACE` and `i18nextInstance.t`; the constructor translates with `{ ns: 'sdkData', lng: 'en' }` — so `error.message` is always the English text, while `key`, `namespace`, and `interpolationOptions` stay on the instance for consumers to re-translate into the active language.

`TranslationDictionary = typeof translation` (en.ts:49) — the English dictionary is the source of truth; `uk.ts` is typed against it, so adding a key to en.ts forces uk.ts to follow.

# How it connects

- packages/sdk-data/src/index.ts:1 imports `initialize-i18n.js` for its side effect, so any import of `@sisense/sdk-data` registers the `sdkData` namespace before code can throw.
- `initializeI18n` delegates to `initI18next` from `@sisense/sdk-common` (packages/sdk-common/src/i18n/i18next.ts:47), which owns the shared i18next instance.
- `TranslatableError` is thrown across the package — e.g. factory dispatch (packages/sdk-data/src/dimensional-model/factory.ts:59) and data model validation (packages/sdk-data/src/dimensional-model/data-model.ts:17).
- `sdk-ui` consumes `translationNamespace` and `TranslationDictionary` (via the barrel, index.ts:122) to merge custom user translations for this namespace.

# Invariants and traps

1. The namespace string `'sdkData'` must never change — custom translation overrides shipped by consumers are keyed on it.
2. Never remove or rename a key in en.ts without treating it as a breaking change: keys are read programmatically by `TranslatableError` and by consumers' `Partial<TranslationDictionary>` overrides.
3. Every new key must be added to en.ts first; uk.ts compiles against `TranslationDictionary`, so the type-checker enforces parity — do not weaken uk.ts's type annotation to dodge that.
4. Throw `TranslatableError` (not plain `Error`) for any message a user can see; the key travels on the error, letting UI layers re-translate. The class itself is not exported from the package barrel — it is internal to sdk-data source.
5. The side-effect import must stay line 1 of packages/sdk-data/src/index.ts; moving it after other exports risks module-evaluation-order bugs where an error is constructed before the namespace exists.
6. Interpolation placeholders use i18next `{{name}}` syntax (e.g. `{{measureName}}`); pass matching keys in `interpolationOptions` or the raw placeholder leaks into the message.

# Related

- [data-model-generation.md](./data-model-generation.md) - factory/data-model validation throws these error keys
- [filters.md](./filters.md) - filter creation throws `errors.filter.*` keys
- [overview.md](./overview.md) - package map
