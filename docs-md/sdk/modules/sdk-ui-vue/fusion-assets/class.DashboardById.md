---
title: DashboardById
---

# Class DashboardById <Badge type="fusionEmbed" text="Fusion Embed" />

A component used for easily rendering a dashboard by its ID in a Sisense Fusion instance.

**Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.

## Example

Here's how you can use the DashboardById component in a Vue application:
```vue
<template>
   <DashboardById
     :dashboardOid="dashboardOid"
   />
</template>

<script setup lang="ts">
import { DashboardById } from '@sisense/sdk-ui-vue';

const dashboardOid = '6441e728dac1920034bce737';
</script>
```

To learn more about this and related dashboard components,
see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).

## Properties

### dashboardOid

> **`readonly`** **dashboardOid**?: `string`

The OID of the dashboard to render.

***

### persist <Badge type="alpha" text="Alpha" />

> **`readonly`** **persist**?: `boolean`

Boolean flag indicating whether changes to the embedded dashboard should be saved to the dashboard in Fusion.

If not specified, the default value is `false`.

Limitations:
- WAT authentication does not support persistence.
- As an alpha feature, currently only changes to dashboard filters are persisted.
