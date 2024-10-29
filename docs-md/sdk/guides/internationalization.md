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
A translation resource is essentially a nested object comprising translation keys and their corresponding string values. A reference file is available on our GitLab as the [`en.ts` file](https://github.com/sisense/compose-sdk-monorepo/blob/main/packages/sdk-ui/src/translation/resources/en.ts) located in the `translation` folder. If you are providing translations for a package other than `sdk-ui`, refer to that package's `en.ts` file.

It’s important to note that you don’t have to specify all translation keys; any keys that are not provided will default to English.

**IMPORTANT:** Do not translate parts within double curly brackets (i.e., `{{chartType}}`), as these are placeholders for dynamic values that will be matched using the provided variable names.

#### Example: Translation Resources
Let’s create translation resources for some fields in `sdk-ui` in **French**, and one error message in `sdk-data` in **Spanish**:
```
const frenchTranslationResources = {
  errors: {
    invalidFilterType: 'Type de filtre invalide',
  },
  chartNoData: 'Aucun résultat'
};
```
```
const spanishTranslationResources = {
  errors: {
    measure: {
      unsupportedType: 'Tipo de medida no compatible',
    },
  },
};
```

As these files may grow larger, consider storing translations in separate files and loading them as needed. JSON format is a suitable option for nested objects like these.

###  Configuring Custom Translations
Similar to how we set the language, we can now provide additional translation resources through the `translationConfig`. Below is an example of loading both translations while setting the default language to **French**:
```
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
        packageName: 'sdkData',
        resources: spanishTranslationResources,
      }]
    }
  }}
 >
```
Note that we specified the package name for **Spanish**, as this translation is meant to be loaded for the `sdk-data` package.

Package names can be found in `src/translation/resources/index.ts` of every package - look for `PACKAGE_NAMESPACE` variable.
If `packageName` is not specified, the translation resource will be registered for `sdkUi` namespace that corresponds to `sdk-ui` package.


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
