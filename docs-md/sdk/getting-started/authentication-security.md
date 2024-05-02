---
title: Authentication & Security
---

# Authentication & Security

There are some authentication and security concerns you need to address in order to start using Compose SDK in an application.

## Authentication

To retrieve data using Compose SDK you need to authenticate your application against a Sisense instance.

There are several ways you can authenticate your application:

- [API Token](#api-token)
- [Web Access Token (WAT)](#web-access-token)
- [Single Sign On (SSO)](#single-sign-on)

### API Token

Sisense API Tokens are issued per user. Typically, in a production environment you create a Sisense user specifically for using Compose SDK. You grant that user the permissions you want to expose in your application and use that user's API Token.

#### Create an API Token

You can get an API Token to use in your application in one of the following ways:

- [Go to a user profile in the Sisense UI](https://sisense.dev/guides/restApi/using-rest-api.html#getting-the-api-token-from-user-profiles)
- Send a request to the [authentication/login](https://sisense.dev/guides/restApi/v1/?platform=linux&spec=L2023.6#/authentication/login) endpoint of the Sisense REST API
- Run the following command using the Compose SDK CLI tool:

```sh
npx @sisense/sdk-cli@latest get-api-token --url <your_instance_url> --username <username>
```

Notes:

- Be sure to replace `<your_instance_url>` with the URL to your Sisense instance and `<username>` with the username of the user you want to create the API token for.
- For Windows, use double quotes around the URL and username arguments. For Mac/Linux, only use double quotes for arguments that contain white space.

#### Authenticate with an API token

Once you’ve obtained an API token, you can use it to authenticate within your application:

- For React apps use the `token` property of the `<SisenseContextProvider />` component:

```ts
<SisenseContextProvider
  url="http://sisense-instance-url"
  token="eRykZjVxkFdhMaGYzYmqJl..."
>
```

- For Angular apps use the `token` property of the `SisenseContextConfig` object:

```ts
export const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
  url="http://sisense-instance-url"
  token="eRykZjVxkFdhMaGYzYmqJl..."
};
```

### Web Access Token

Sisense Web Access Tokens (WATs) impersonate specific Sisense users. Typically, in a production environment you create a Sisense user specifically for using Compose SDK. You grant that user the permissions you want to expose in your application and use a WAT that impersonates that user.

::: tip Note
Compose SDK only supports Opaque Tokens (By Reference).
:::

#### Create a WAT

Before creating a WAT, you need to [create a token configuration](https://docs.sisense.com/main/SisenseLinux/using-web-access-token.htm?tocpath=Security%7CSecuring%20Users%7C_____4#CreatingaTokenConfiguration) to generate a token secret and key ID.

Once you have a token secret and key ID, you can generate a WAT to use in your application in one of the following ways:

- [Go to Web Access Tokens in the Sisense UI](https://docs.sisense.com/main/SisenseLinux/using-web-access-token.htm?tocpath=Security%7CSecuring%20Users%7C_____4#OptionsforCreatingWebAccessTokens)
- Send a request to the [wat/generate](https://sisense.dev/guides/restApi/v1/?platform=linux&spec=L2023.6#/web-access-tokens/generateWebAccessToken) endpoint of the Sisense REST API
- [Use self-hosted token generation](https://docs.sisense.com/main/SisenseLinux/using-web-access-token.htm?tocpath=Security%7CSecuring%20Users%7C_____4#OptionsforCreatingWebAccessTokens)

#### Authenticate with a WAT

Once you’ve created a WAT, you can use it to authenticate within your application:

- For React apps use the `wat` property of the `<SisenseContextProvider />` component:

```ts
<SisenseContextProvider
  url="http://sisense-instance-url"
  wat="eykZjkFhMGYzYmJl…"
>
```

- For Angular apps use the `wat` property of the `SisenseContextConfig` object:

```ts
export const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
  url="http://sisense-instance-url"
  wat="eykZjkFhMGYzYmJl…"
};
```

### Single Sign On

Single Sign On (SSO) allows the users of your application to authenticate with Sisense using an external identity provider.

#### Set up SSO

Set up your Sisense instance to authenticate users with SSO using one of the following:

- [JSON Web Token (JWT)](https://docs.sisense.com/main/SisenseLinux/single-sign-on-using-json-web-token.htm?tocpath=Security%7CImplementing%20Single%20Sign-On%7C_____3)
- [Security Assertion Markup Language 2.0 (SAML)](https://docs.sisense.com/main/SisenseLinux/single-sign-on-using-security-assertion-markup-language-20.htm?tocpath=Security%7CImplementing%20Single%20Sign-On%7C_____2)
- [OpenID Connect](https://docs.sisense.com/main/SisenseLinux/single-sign-on-using-openid-connect.htm?tocpath=Security%7CImplementing%20Single%20Sign-On%7C_____4)

::: tip Note
If you're experiencing difficulties or unexpected behavior when using SSO, the cause may be a hidden feature configuration. To resolve the issue, you can:

- Contact [support](https://www.sisense.com/support/) to validate you Fusion configuration settings
- See this [community post](https://community.sisense.com/t5/developer-forum/issue-with-sisense-compose-sdk-and-sso-authentication/m-p/18601/highlight/true#M40) to try to resolve the issue yourself
:::

#### Authenticate with SSO

Once you’ve set up SSO access, you can use it to authenticate within your application:

- For React apps use the `ssoEnabled` property of the `<SisenseContextProvider />` component:

```ts
<SisenseContextProvider
  url="https://sisense-instance-url"
  ssoEnabled=true
>
```

- For Angular apps use the `ssoEnabled` property of the `SisenseContextConfig` object:

```ts
export const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
  url="https://sisense-instance-url"
  ssoEnabled=true
};
```

## Cross-Origin Resource Sharing (CORS)

By default, browser same-origin policy prevents client-side web applications located in one domain from obtaining data from a different domain. That means an application you build with Compose SDK can't get data from your Sisense instance without some initial setup.

To get around this problem, you enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) for specific origins for which you want to allow resource sharing. Doing so instructs the Sisense server to respond to requests from your application with a header that tells the browser your application can use the data returned from Sisense even though it comes from a different domain.

#### Set up CORS

Set up CORS on your Sisense instance using one of the following:

- [Add your application's domain to the **CORS Allowed Origins** in the Sisense UI](https://docs.sisense.com/main/SisenseLinux/cross-origin-resource-sharing.htm?Highlight=cors#EnablingCORS)
- Send a request to the [settings/system](https://sisense.dev/guides/restApi/v1/?platform=linux&spec=L2023.6#/settings/setSystemSettings) endpoint of the Sisense REST API and include your application's domain in the `allowedOrigins` array:

```json
"cors": {
  "enabled": true,
  "allowedOrigins": [
    "https://your-application-url"
  ]
}
```

::: tip Notes

- **Do not** include the trailing slash (`/`) when adding a domain to the **CORS Allowed Origins**
- Save your settings changes after adding your domain.

:::
