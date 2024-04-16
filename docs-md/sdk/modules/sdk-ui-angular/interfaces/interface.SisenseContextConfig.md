---
title: SisenseContextConfig
---

# Interface SisenseContextConfig

Configurations and authentication for Sisense Context.

Use one of the following to authenticate:

- [ssoEnabled](interface.SisenseContextConfig.md#ssoenabled)
- [token](interface.SisenseContextConfig.md#token)
- [wat](interface.SisenseContextConfig.md#wat)

## Properties

### Authentication

#### ssoEnabled

> **ssoEnabled**?: `boolean`

[Single Sign-On](https://docs.sisense.com/main/SisenseLinux/using-single-sign-on-to-access-sisense.htm) toggle.

Set to `true` to use SSO authentication. When `true`, this overrides any other authentication methods. Defaults to `false`.

***

#### token

> **token**?: `string`

Token for [bearer authentication](https://sisense.dev/guides/restApi/using-rest-api.html).

***

#### wat

> **wat**?: `string`

[Web Access Token](https://docs.sisense.com/main/SisenseLinux/using-web-access-token.htm).

### Other

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
