---
title: SisenseContextProviderProps
---

# Interface SisenseContextProviderProps

Configurations and authentication for Sisense Context.

Use one of the following to authenticate:

- [`ssoEnabled`](interface.SisenseContextProviderProps.md#ssoenabled)
- [`token`](interface.SisenseContextProviderProps.md#token)
- [`wat`](interface.SisenseContextProviderProps.md#wat)

## Properties

### Sisense App

#### appConfig

> **appConfig**?: [`AppConfig`](../type-aliases/type-alias.AppConfig.md)

Application specific configurations such as locale and date formats.

***

#### defaultDataSource

> **defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Default data source explicitly set to be used by child components that are not defined with a data source.

***

#### url

> **url**: `string`

URL of the Sisense environment the app connects to

### Sisense Authentication

#### enableSilentPreAuth

> **enableSilentPreAuth**?: `boolean`

Boolean flag to enable sending silent pre-authentication requests to the Sisense instance.
Used to check if user is already authenticated, check is performed in an ivisible iframe.
Used only with SSO authentication.
If not specified, the default value is `false`.

***

#### ssoEnabled

> **ssoEnabled**?: `boolean`

[Single Sign-On](https://docs.sisense.com/main/SisenseLinux/using-single-sign-on-to-access-sisense.htm) toggle.

Set to `true` to use SSO authentication. When `true`, this overrides any other authentication methods. Defaults to `false`.

***

#### token

> **token**?: `null` \| `string`

Token for [bearer authentication](https://developer.sisense.com/guides/restApi/using-rest-api.html).

To signify that the token is pending (e.g., being generated), set the value to `null`. This is supported for React and Vue only.

***

#### useFusionAuth

> **useFusionAuth**?: `boolean`

Flag to delegate authentication to Fusion.

Defaults to `false`.

***

#### wat

> **wat**?: `null` \| `string`

[Web Access Token](https://docs.sisense.com/main/SisenseLinux/using-web-access-token.htm).

To signify that the token is pending (e.g., being generated), set the value to `null`. This is supported for React and Vue only.
