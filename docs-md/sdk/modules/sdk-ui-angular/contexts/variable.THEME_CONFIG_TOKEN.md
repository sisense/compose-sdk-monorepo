---
title: THEME_CONFIG_TOKEN
---

# Variable THEME\_CONFIG\_TOKEN

> **`const`** **THEME\_CONFIG\_TOKEN**: `InjectionToken`\< [`ThemeConfig`](../type-aliases/type-alias.ThemeConfig.md) \>

Token used to inject [ThemeConfig](../type-aliases/type-alias.ThemeConfig.md) into your application

## Example

Example of injecting both [SisenseContextConfig](../interfaces/interface.SisenseContextConfig.md) and [ThemeConfig](../type-aliases/type-alias.ThemeConfig.md) into your application:

```ts
export const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
  url="<instance url>" // replace with the URL of your Sisense instance
  token="<api token>" // replace with the API token of your user account
  defaultDataSource: DM.DataSource,
};

@NgModule({
  imports: [
    BrowserModule,
    SdkUiModule,
  ],
  declarations: [AppComponent],
  providers: [
    { provide: SISENSE_CONTEXT_CONFIG_TOKEN, useValue: SISENSE_CONTEXT_CONFIG },
    {
      provide: THEME_CONFIG_TOKEN,
      useValue: {
        // initial theme settings
      } as ThemeConfig,
    },
  ],
  bootstrap: [AppComponent],
})
```
