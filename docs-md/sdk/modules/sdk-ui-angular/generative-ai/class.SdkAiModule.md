---
title: SdkAiModule
---

# Class SdkAiModule

SDK AI Module, which is a container for generative AI components and services.

## Example

Example of importing [SdkAiModule](class.SdkAiModule.md) and injecting [AiContextConfig](../interfaces/interface.AiContextConfig.md) into your application,
along with importing dependency [SdkUiModule](../contexts/class.SdkUiModule.md) and injecting [SisenseContextConfig](../interfaces/interface.SisenseContextConfig.md) to connect to a Sisense instance:

```ts
import { SdkUiModule, SisenseContextConfig } from '@sisense/sdk-ui-angular';
import { SdkAiModule, AI_CONTEXT_CONFIG_TOKEN, AiContextConfig } from '@sisense/sdk-ui-angular/ai';

const AI_CONTEXT_CONFIG: AiContextConfig = {
  volatile: true,
};
const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
  url: "<instance url>", // replace with the URL of your Sisense instance
  token: "<api token>", // replace with the API token of your user account
  defaultDataSource: DM.DataSource,
};

@NgModule({
  imports: [
    BrowserModule,
    SdkUiModule,
    SdkAiModule,
  ],
  declarations: [AppComponent],
  providers: [
    { provide: AI_CONTEXT_CONFIG_TOKEN, useValue: AI_CONTEXT_CONFIG },
    { provide: SISENSE_CONTEXT_CONFIG_TOKEN, useValue: SISENSE_CONTEXT_CONFIG },
  ],
  bootstrap: [AppComponent],
})
```

## Constructors

### constructor

> **new SdkAiModule**(): [`SdkAiModule`](class.SdkAiModule.md)

#### Returns

[`SdkAiModule`](class.SdkAiModule.md)
