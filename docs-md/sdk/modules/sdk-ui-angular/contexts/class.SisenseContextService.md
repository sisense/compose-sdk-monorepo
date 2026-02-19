---
title: SisenseContextService
---

# Class SisenseContextService

Service for managing Sisense Fusion context and client application lifecycle.

This service provides a centralized way to configure and manage the connection to a Sisense instance within Angular applications.

## Constructors

### constructor

> **new SisenseContextService**(`sisenseContextConfig`?): [`SisenseContextService`](class.SisenseContextService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextConfig`? | [`SisenseContextConfig`](../interfaces/interface.SisenseContextConfig.md) |

#### Returns

[`SisenseContextService`](class.SisenseContextService.md)

## Methods

### getConfig

> **getConfig**(): [`SisenseContextConfig`](../interfaces/interface.SisenseContextConfig.md) \| `undefined`

Retrieves the current [SisenseContextConfig](../interfaces/interface.SisenseContextConfig.md) configuration object.

#### Returns

[`SisenseContextConfig`](../interfaces/interface.SisenseContextConfig.md) \| `undefined`

The current configuration object, or undefined if not yet configured

***

### setConfig

> **setConfig**(`config`): `Promise`\< `void` \>

Configures and initializes the Sisense context with the provided settings.

This method allows to establish a connection to a Sisense instance.
It could be used as runtime alternative to [SISENSE_CONTEXT_CONFIG_TOKEN](variable.SISENSE_CONTEXT_CONFIG_TOKEN.md) based configuration.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `config` | [`SisenseContextConfig`](../interfaces/interface.SisenseContextConfig.md) | Configuration object |

#### Returns

`Promise`\< `void` \>

Promise that resolves when configuration is complete (success or failure)

#### Example

Basic configuration:
```ts
await SisenseContextService.setConfig({
  url: 'https://your-sisense-instance.com',
  token: 'your-api-token',
  defaultDataSource: 'Sample ECommerce'
});
```
