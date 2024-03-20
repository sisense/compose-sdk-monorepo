---
title: SisenseContextProvider
---

# Class SisenseContextProvider

Sisense Context Provider Component allowing you to connect to
a Sisense instance and provide that context
to all Compose SDK components in your application.

## Example

Here's how to use the `SisenseContextProvider` component to wrap your Sisense-enabled application:
Add SisenseContextProvider to the main component of your app as below and then wrap
other SDK components inside this component.
```vue
<template>
  <SisenseContextProvider
    :url="sisenseUrl"
    :defaultDataSource="defaultDataSource"
    :ssoEnabled="true"
    :token="authToken"
    :wat="watToken"
    :appConfig="appConfigurations"
    :showRuntimeErrors="true"
    :enableTracking="false"
  >
    <!-- Your application components here -->
  </SisenseContextProvider>
</template>

<script>
import { ref } from 'vue';
import SisenseContextProvider from './SisenseContextProvider.vue';

export default {
  components: { SisenseContextProvider },
  setup() {
    const sisenseUrl = ref('https://your-sisense-instance.com');
    const defaultDataSource = ref('default_datasource_id');
    const authToken = ref('your_auth_token');
    const watToken = ref('your_wat_token');
    const appConfigurations = ref({});

    return { sisenseUrl, defaultDataSource, authToken, watToken, appConfigurations };
  }
};
</script>
```

## Param

Sisense context provider props

## Properties

### appConfig

> **appConfig**?: [`AppConfig`](../type-aliases/type-alias.AppConfig.md)

***

### defaultDataSource

> **defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

***

### ssoEnabled

> **ssoEnabled**?: `boolean`

***

### token

> **token**?: `string`

***

### url

> **url**?: `string`

***

### wat

> **wat**?: `string`
