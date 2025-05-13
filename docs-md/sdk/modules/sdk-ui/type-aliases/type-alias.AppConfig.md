---
title: AppConfig
---

# Type alias AppConfig

> **AppConfig**: `object`

Application configuration

## Type declaration

### `accessibilityConfig`

**accessibilityConfig**?: `object`

Accessibility configuration. Set the `accessibilityConfig.enabled` property to `true` to enable accessibility features for charts built with Highcharts.

Once the accessibility configuration in enabled, you can use the default descriptions or choose to create custom configurations for the descriptions of a chart, its axes, its series, and values description formatting. To create custom configurations, use the `highchartsOptions` object that is passed to the [BeforeRenderHandler](type-alias.BeforeRenderHandler.md) of the chart's `onBeforeRender` callback. Modify the object using the accessibility options as described in the [Accessibility module documentation](https://www.highcharts.com/docs/accessibility/accessibility-module).

Note that enabling accessibility also causes markers to appear in charts even if they are disabled using the chart's `styleOptions`.

This feature is in alpha.

> #### `accessibilityConfig.enabled`
>
> **enabled**?: `boolean`
>
> Whether to enable accessibility features
>
> If not specified, the default value is `false`
>
>

***

### `dateConfig`

**dateConfig**?: [`DateConfig`](type-alias.DateConfig.md)

Date Configurations

***

### `errorBoundaryConfig`

**errorBoundaryConfig**?: `object`

Configuration of the component that is rendered in case of an error

> #### `errorBoundaryConfig.alwaysShowErrorText`
>
> **alwaysShowErrorText**?: `boolean`
>
> Whether to show error text without hovering over the error icon
>
> If not specified, the default value is `false`
>
>

***

### `loadingIndicatorConfig`

**loadingIndicatorConfig**?: [`LoadingIndicatorConfig`](type-alias.LoadingIndicatorConfig.md)

Loading Indicator Configurations

***

### `locale`

**locale**?: `Locale`

A [date-fns Locale](https://date-fns.org/v2.30.0/docs/Locale)

***

### `queryCacheConfig`

**queryCacheConfig**?: `object`

Query Cache Configurations.

See [Client query caching guide](/guides/sdk/guides/client-query-caching.html) for more details.

> #### `queryCacheConfig.enabled`
>
> **enabled**?: `boolean`
>
> Whether to enable client-side query caching.
>
> If not specified, the default value is `false`
>
>

***

### `queryLimit`

**queryLimit**?: `number`

Query limit (max rows count that will be fetched in query)

#### Default

```ts
20000
```

***

### `tabberConfig`

**tabberConfig**?: `object`

Configuration of the tabber widget

Set the `tabberConfig.enabled` property to `true` to enable the tabber widget support. Otherwise, the tabber widget will be treated as 'unknown plugin type'.
Only tabber widgets that are configured using the Fusion UI as documented [here](https://docs.sisense.com/main/SisenseLinux/tabber.htm#Creating) are supported.

> #### `tabberConfig.enabled`
>
> **enabled**?: `boolean`
>
> Whether to enable tabber widget support
>
> If not specified, the default value is `true`
>
>

***

### `trackingConfig`

**trackingConfig**?: `object`

Tracking configuration

> #### `trackingConfig.onTrackingEvent`
>
> **onTrackingEvent**?: (`payload`) => `void`
>
> Callback to be invoked when tracking event occurs
>
> ##### Parameters
>
>
> | Parameter | Type |
> | :------ | :------ |
> | `payload` | `TrackingEventDetails` |
>
>
> ##### Returns
>
> `void`
>
>
>
>

***

### `translationConfig`

**translationConfig**?: [`TranslationConfig`](type-alias.TranslationConfig.md)

Translation Configuration
