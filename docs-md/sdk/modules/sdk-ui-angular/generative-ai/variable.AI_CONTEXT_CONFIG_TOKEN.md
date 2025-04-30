---
title: AI_CONTEXT_CONFIG_TOKEN
---

# Variable AI\_CONTEXT\_CONFIG\_TOKEN

> **`const`** **AI\_CONTEXT\_CONFIG\_TOKEN**: `InjectionToken`\< [`AiContextConfig`](../interfaces/interface.AiContextConfig.md) \>

Token used to inject [AiContextConfig](../interfaces/interface.AiContextConfig.md) into your application.

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
