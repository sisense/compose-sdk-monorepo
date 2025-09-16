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

### Sisense App

#### appConfig

> **`readonly`** **appConfig**?: [`AppConfig`](../type-aliases/type-alias.AppConfig.md)

Application specific configurations such as locale and date formats.

***

#### defaultDataSource

> **`readonly`** **defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Default data source explicitly set to be used by child components that are not defined with a data source.

***

#### url

> **`readonly`** **url**: `string`

URL of the Sisense environment the app connects to

### Sisense Authentication

#### ssoEnabled

> **`readonly`** **ssoEnabled**?: `boolean`

[Single Sign-On](https://docs.sisense.com/main/SisenseLinux/using-single-sign-on-to-access-sisense.htm) toggle.

Set to `true` to use SSO authentication. When `true`, this overrides any other authentication methods. Defaults to `false`.

***

#### token

> **`readonly`** **token**?: `null` \| `string`

Token for [bearer authentication](https://developer.sisense.com/guides/restApi/using-rest-api.html).

To signify that the token is pending (e.g., being generated), set the value to `null`. This is supported for React and Vue only.

***

#### wat

> **`readonly`** **wat**?: `null` \| `string`

[Web Access Token](https://docs.sisense.com/main/SisenseLinux/using-web-access-token.htm).

To signify that the token is pending (e.g., being generated), set the value to `null`. This is supported for React and Vue only.
