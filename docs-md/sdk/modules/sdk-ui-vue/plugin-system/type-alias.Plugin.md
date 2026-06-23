---
title: Plugin
---

# Type alias Plugin <Badge type="beta" text="Beta" />

> **Plugin**: [`WidgetPlugin`](../../sdk-ui/plugin-system/interface.WidgetPlugin.md)\< `any` \>

Declares a plugin for registration with the Compose SDK.
Currently only widget plugins are supported.

## Example

```ts
import { SisenseContextProvider } from '@sisense/sdk-ui';

const myPlugin: Plugin = {
  name: 'my-widget-plugin',
  version: '1.0.0',
  requiredApiVersion: '^2.9.0',
  pluginType: 'widget',
  customWidget: {
    name: 'my-widget',
    displayName: 'My Widget',
    visualization: { Component: MyVisualization },
  },
};

<SisenseContextProvider plugins={[myPlugin]} {...props} />
```
