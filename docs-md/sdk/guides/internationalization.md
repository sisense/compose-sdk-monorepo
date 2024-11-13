---
title: Internationalization with Compose SDK (Alpha)
---

# Internationalization with Compose SDK (Alpha)
The Compose SDK utilizes the [i18next](https://www.i18next.com/) internationalization framework, making it straightforward to load your own translations.

## Changing the language
To facilitate language changes, the `AppConfig` of `SisenseContextProvider` includes a `translationConfig` property where you can easily set your desired language. For example, to set the language to **French**, use the following code:
```
<SisenseContextProvider appConfig={{ translationConfig: { language: 'fr' }}}>
```
## Loading Additional Translations
By default, the Compose SDK offers a limited number of translation resources. You can utilize `translationConfig` to load additional translation resources into the internationalization framework.

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
      language: 'fr',
      customTranslations: [{
        language: 'fr',
        resources: frenchTranslationResources,
      },
      {
        language: 'es',
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
	const frenchTranslationResourse = i18n.getResourceBundle('fr', 'sdkUi');
	console.log(`Loaded French translation ${JSON.stringify(frenchTranslationResourse)}`)
  }, [i18n]);

  return <></>;
}
```

For further details, please refer to the [i18next API documentation](https://www.i18next.com/overview/api).
