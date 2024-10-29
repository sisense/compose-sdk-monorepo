---
title: DashboardById
---

# Class DashboardById <Badge type="fusionEmbed" text="Fusion Embed" /> <Badge type="beta" text="Beta" />

A component used for easily rendering a dashboard by its ID in a Sisense Fusion instance.

**Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.

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
