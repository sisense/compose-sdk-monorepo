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
import { DashboardById } from '@ethings-os/sdk-ui-vue';

const dashboardOid = '6441e728dac1920034bce737';
</script>
```

To learn more about this and related dashboard components,
see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).

## Properties

### config

> **`readonly`** **config**?: [`DashboardByIdConfig`](../interfaces/interface.DashboardByIdConfig.md)

The configuration for the dashboard

***

### dashboardOid

> **`readonly`** **dashboardOid**: `string`

The OID of the dashboard to render.
