---
title: SISENSE_CONTEXT_CONFIG_TOKEN
---

# Variable SISENSE\_CONTEXT\_CONFIG\_TOKEN

> **`const`** **SISENSE\_CONTEXT\_CONFIG\_TOKEN**: `InjectionToken`\< [`SisenseContextConfig`](../interfaces/interface.SisenseContextConfig.md) \>

Token used to inject [SisenseContextConfig](../interfaces/interface.SisenseContextConfig.md) into your application

## Example

Example of importing [SdkUiModule](class.SdkUiModule.md) and injecting [SisenseContextConfig](../interfaces/interface.SisenseContextConfig.md) into your application:

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
  ],
  bootstrap: [AppComponent],
})
```
