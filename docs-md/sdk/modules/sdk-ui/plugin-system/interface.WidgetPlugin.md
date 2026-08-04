---
title: WidgetPlugin
---

# Interface WidgetPlugin <Badge type="beta" text="Beta" />`<Props>`

Declares a widget plugin for registration with the Compose SDK.

Pass an instance to the `plugins` prop on [SisenseContextProvider](../contexts/function.SisenseContextProvider.md) to register a custom
visualization that appears in the dashboard widget picker.

## Example

```ts
import { WidgetPlugin, CustomVisualization } from '@sisense/sdk-ui';

const MyChart: CustomVisualization = ({ dataOptions }) => <div>{String(dataOptions)}</div>;

const myPlugin: WidgetPlugin = {
  name: 'my-widget-plugin',
  version: '1.0.0',
  requiredApiVersion: '^2.9.0',
  pluginType: 'widget',
  customWidget: {
    name: 'my-widget',
    displayName: 'My Widget',
    visualization: { Component: MyChart },
  },
};
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `Props` *extends* [`CustomVisualizationProps`](interface.CustomVisualizationProps.md)\< `any`, `any`, `any`, `any` \> | [`CustomVisualizationProps`](interface.CustomVisualizationProps.md) | Props type for the custom visualization component, extending [CustomVisualizationProps](interface.CustomVisualizationProps.md). |

## Properties

### customWidget

> **customWidget**?: `object`

The custom widget declaration to be registered

#### Type declaration

> ##### `customWidget.config`
>
> **config**?: `object`
>
> Configuration options for the custom widget
>
> > ###### `config.header`
> >
> > **header**?: `object`
> >
> > Configuration options for the widget header
> >
> > > ###### `header.visible`
> > >
> > > **visible**?: `boolean`
> > >
> > > Whether the header is visible.
> > > If not specified, the header is visible by default.
> > >
> > > ###### Example
> > >
> > > ```ts
> > > true
> > > ```
> > >
> > >
> >
> >
>
> ##### `customWidget.dataPanel`
>
> **dataPanel**?: `object`
>
> Definition of the data panel for the custom widget
>
> > ###### `dataPanel.config`
> >
> > **config**?: `object`
> >
> > Configuration options for the data panel
> >
> > ###### Example
> >
> > ```ts
> > {
> > inputs: [
> > { name: 'category', displayName: 'Category', type: 'dimension' },
> > { name: 'value', displayName: 'Value', type: 'measure' },
> > ],
> > }
> > ```
> >
> > > ###### `config.inputs`
> > >
> > > **inputs**?: \{
> > > `canColor?`: `boolean`;
> > > `canFormat?`: `boolean`;
> > > `canSort?`: `boolean`;
> > > `displayName?`: `string`;
> > > `maxItems?`: `number`;
> > > `minItems?`: `number`;
> > > `name`: `string`;
> > > `type`: `"dimension"` \| `"measure"`;
> > > }[]
> > >
> > > Inputs for the data panel
> > >
> > > ###### Example
> > >
> > > ```ts
> > > [
> > > { name: 'category', displayName: 'Category', type: 'dimension' },
> > > { name: 'value', displayName: 'Value', type: 'measure' },
> > > ]
> > > ```
> > >
> > >
> >
> >
>
> ##### `customWidget.designPanel`
>
> **designPanel**?: `object`
>
> Definition of the design panel for the custom widget
>
> > ###### `designPanel.Component`
> >
> > **Component**?: [`DesignPanel`](type-alias.DesignPanel.md)\< `NonNullable`\< `Props`[`"styleOptions"`] \> \>
> >
> >
>
> ##### `customWidget.displayName`
>
> **displayName**: `string`
>
> The display name of the custom widget type (used for display in the UI)
>
> ###### Example
>
> ```ts
> 'My Custom Widget'
> ```
>
> ##### `customWidget.name`
>
> **name**: `string`
>
> The unique name of the custom widget type (used for registration and identification)
>
> ###### Example
>
> ```ts
> 'my-custom-widget'
> ```
>
> ##### `customWidget.visualization`
>
> **visualization**: `object`
>
> Definition of the custom visualization to be rendered in the new custom widget
>
> > ###### `visualization.Component`
> >
> > **Component**: [`CustomVisualization`](type-alias.CustomVisualization.md)\< `Props` \>
> >
> > The custom visualization component to be rendered in the new custom widget
> >
> >
>
>

***

### name

> **name**: `string`

Unique name identifier for the plugin

***

### pluginType

> **pluginType**: `"widget"`

The type of plugin

***

### requiredApiVersion

> **requiredApiVersion**: `string`

Required SDK API version range using simplified semver with standard AND/OR logic.
- **OR**: `||` separates alternative ranges (version must match at least one).
- **AND**: space-separated comparators (version must match all in that group).

Supported comparators: `^x.y.z`, `~x.y.z`, `x.y.z`, `>=x.y.z`, `>x.y.z`, `<=x.y.z`, `<x.y.z`

#### Example

```ts
"^2.9.0" — any 2.x from 2.9.0 up (same major)
```

#### Example

```ts
"2.20.0" — exact version only
```

#### Example

```ts
"~2.9.0" — 2.9.x only (same major and minor)
```

#### Example

```ts
">=2.0.0" — minimum version
```

#### Example

```ts
"^2.0.0 || ^3.0.0" — 2.x from 2.0.0 or 3.x from 3.0.0 (OR)
```

#### Example

```ts
">1.2.3 <=2.3.1" — between 1.2.3 and 2.3.1 inclusive (AND)
```

#### Example

```ts
">1.2.3 <=2.3.1 || ^3.0.0" — that range or any 3.x (AND + OR)
```

***

### version

> **version**: `string`

Semantic version of the plugin
