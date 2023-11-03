---
title: SdkUiModule
---

# Class SdkUiModule

SDK UI Module, which is a container for components.

## Example

Example of importing `SdkUiModule` and injecting [SisenseContextConfig](../interfaces/interface.SisenseContextConfig.md) into your application:

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

## Constructors

### constructor

> **new SdkUiModule**(): [`SdkUiModule`](class.SdkUiModule.md)

#### Returns

[`SdkUiModule`](class.SdkUiModule.md)
