---
title: Internationalization with Compose SDK
---

# Internationalization with Compose SDK
The Compose SDK utilizes the [i18next](https://www.i18next.com/) internationalization framework, making it straightforward to load your own translations.

## Changing the language
To facilitate language changes, the `AppConfig` of `SisenseContextProvider` includes a `translationConfig` property where you can easily set your desired language. For example, to set the language to **French**, use the following code:
```
<SisenseContextProvider appConfig={{ translationConfig: { language: 'fr-FR' }}}>
```
## Loading Additional Translations
By default, the Compose SDK offers a limited number of translation resources. You can utilize `translationConfig` to load additional translation resources into the internationalization framework.

### Pre-built translation submodules (`@sisense/sdk-ui/translations/*`)
The `@sisense/sdk-ui` package exposes pre-built translation bundles as subpath exports. Each submodule exports an array of translation objects (language, namespace, resources) ready to use in `customTranslations`.

| Submodule | Code | Language |
|-----------|------|----------|
| `@sisense/sdk-ui/translations/en-us` | `en-US` | English (US) |
| `@sisense/sdk-ui/translations/de-de` | `de-DE` | German |
| `@sisense/sdk-ui/translations/es-ar` | `es-AR` | Spanish (Argentina) |
| `@sisense/sdk-ui/translations/es-es` | `es-ES` | Spanish (Spain) |
| `@sisense/sdk-ui/translations/fr-fr` | `fr-FR` | French |
| `@sisense/sdk-ui/translations/it-it` | `it-IT` | Italian |
| `@sisense/sdk-ui/translations/ja-jp` | `ja-JP` | Japanese |
| `@sisense/sdk-ui/translations/ko-kr` | `ko-KR` | Korean |
| `@sisense/sdk-ui/translations/nl-nl` | `nl-NL` | Dutch |
| `@sisense/sdk-ui/translations/pt-br` | `pt-BR` | Portuguese (Brazil) |
| `@sisense/sdk-ui/translations/ru-ru` | `ru-RU` | Russian |
| `@sisense/sdk-ui/translations/tr-tr` | `tr-TR` | Turkish |
| `@sisense/sdk-ui/translations/zh-cn` | `zh-CN` | Chinese (Simplified) |

**Example: using a pre-built translation**

```tsx
import { SisenseContextProvider } from '@sisense/sdk-ui';
import sdkUiFrench from '@sisense/sdk-ui/translations/fr-fr';

<SisenseContextProvider
  appConfig={{
    translationConfig: {
      language: 'fr-FR',
      customTranslations: [sdkUiFrench],
    },
  }}
>
  {/* Your app */}
</SisenseContextProvider>
```

**Example: combining pre-built translations with custom overrides**

```tsx
import { SisenseContextProvider, TranslationDictionary } from '@sisense/sdk-ui';
import sdkUiGerman from '@sisense/sdk-ui/translations/de-de';

const myOverrides: Partial<TranslationDictionary> = {
  chartNoData: 'Keine Daten in dieser Ansicht',
};

<SisenseContextProvider
  appConfig={{
    translationConfig: {
      language: 'de-DE',
      customTranslations: [
        sdkUiGerman,
        {
          language: 'de-DE',
          namespace: 'sdkUi',
          resources: myOverrides,
        },
      ],
    },
  }}
>
  {/* Your app */}
</SisenseContextProvider>
```

Later bundles for the same language and namespace extend or override earlier ones, so custom keys will take precedence when registered after the pre-built bundle.

### Preparing Translation Resources
A translation resource consists of translation keys paired with their corresponding string values. This resource is typically structured as a nested object, making it easier to manage different translations. You can register multiple languages by creating separate translation resources for each language and then adding them to your configuration.

**IMPORTANT:** Do not translate parts within double curly brackets (i.e., `{{chartType}}`), as these are placeholders for dynamic values that will be matched using the provided variable names.

#### TranslationDictionary type
Each package with translations provides a `TranslationDictionary` type listing all keys used within that package. Use this type to ensure your custom translation includes all relevant keys.

**Example: complete translation for the `sdk-ui` package**
```
import { TranslationDictionary } from '@sisense/sdk-ui';

const customTranslationResources: TranslationDictionary = {
  ...
};
```

Note that specifying all translation keys is not required; any keys you do not provide will default to English. Using the `TranslationDictionary` type as a Partial can help prevent typos in your custom translation.

#### Example: Translation Resources
Let’s create translation resources for some fields in `sdk-ui` in **French**, and one error message in `sdk-data` in **Spanish**:
```
import { TranslationDictionary } from '@sisense/sdk-ui';

const frenchTranslationResources: Partial<TranslationDictionary> = {
  errors: {
    invalidFilterType: 'Type de filtre invalide',
  },
  chartNoData: 'Aucun résultat'
};
```
```
import { TranslationDictionary } from '@sisense/sdk-data';

const spanishTranslationResources: Partial<TranslationDictionary> = {
  errors: {
    measure: {
      unsupportedType: 'Tipo de medida no compatible',
    },
  },
};
```

As these files may grow larger, consider storing translations in separate files and loading them as needed. JSON format is a suitable option for nested objects like these.

###  Configuring Custom Translations
Similar to how we set the language, we can now provide additional translation resources through the `translationConfig`

Below is an example of loading both translations while setting the default language to **French**:
```
import { translationNamespace as sdkDataNamespace } from '@sisense/sdk-data';

<SisenseContextProvider
  appConfig={{
    translationConfig: {
      language: 'fr-FR',
      customTranslations: [{
        language: 'fr-FR',
        resources: frenchTranslationResources,
      },
      {
        language: 'es-ES',
        namespace: sdkDataNamespace, // 'sdkData'
        resources: spanishTranslationResources,
      }]
    }
  }}
 >
```
Note that we specified the namespace for **Spanish**, as this translation is meant to be loaded for the `sdk-data` package.

Translation namespace values can be found in `translationNamespace` constant exported from every package that has translations.
If `namespace` is not specified, the translation resource will be registered for `sdkUi` namespace that corresponds to the `sdk-ui` package.

## Advanced Configuration
For more advanced internationalization configurations, the `i18n` instance is accessible through the [`useTranslation` hook](https://react.i18next.com/latest/usetranslation-hook) from the `react-i18next` package.

**Note:** The `i18n` instance is initialized within the `SisenseContextProvider`. Therefore, it is important to use the `useTranslation` hook either within the `SisenseContextProvider` or in its child components. Attempting to access `i18n` outside of this context will not yield the instance utilized by the Compose SDK.

#### Example: Checking Loaded Resources
To verify if the **French** resource bundle is loaded for the `sdk-ui` package, you can use the following code:
```
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const MyComponent = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
	const frenchTranslationResourse = i18n.getResourceBundle('fr-FR', 'sdkUi');
	console.log(`Loaded French translation ${JSON.stringify(frenchTranslationResourse)}`)
  }, [i18n]);

  return <></>;
}
```

For further details, please refer to the [i18next API documentation](https://www.i18next.com/overview/api).
