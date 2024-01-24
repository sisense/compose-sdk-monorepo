---
title: SisenseContextProviderProps
---

# Interface SisenseContextProviderProps

Configurations for Sisense Context

## Properties

### Authentication

#### ssoEnabled

> **ssoEnabled**?: `boolean`

[Single Sign-On](https://docs.sisense.com/main/SisenseLinux/using-single-sign-on-to-access-sisense.htm) toggle

This is used when user wants to use sso authentication. Default is false.
If set to true, this will override any other authentication method.

***

#### token

> **token**?: `string`

Token for [bearer authentication](https://sisense.dev/guides/restApi/using-rest-api.html).

This is used only when basic username/password authentication is not specified.

***

#### wat

> **wat**?: `string`

[Web Access Token](https://docs.sisense.com/main/SisenseLinux/using-web-access-token.htm).

This is used only when neither username, password, and token is specified.

### Other

#### appConfig

> **appConfig**?: [`AppConfig`](../../sdk-ui/type-aliases/type-alias.AppConfig.md)

Application specific configurations such as locale and date formats.

***

#### defaultDataSource

> **defaultDataSource**?: `string`

Default data source explicitly set to be used by child components that are not defined with a data source.

***

#### url

> **url**: `string`

URL of the Sisense environment the app connects to
