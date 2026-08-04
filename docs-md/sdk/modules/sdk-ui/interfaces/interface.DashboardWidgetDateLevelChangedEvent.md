---
title: DashboardWidgetDateLevelChangedEvent
---

# Interface DashboardWidgetDateLevelChangedEvent <Badge type="beta" text="Beta" />

`DashboardWidgetDateLevelChangedEvent` is emitted when a filter widget's date
granularity is changed on the dashboard, letting an embedding host sync the widget's
stored dimension metadata to the new level. The payload carries the affected widget's
`oid` plus a JAQL-level descriptor of the new date granularity.

## Properties

### payload

> **payload**: `object`

Widget oid and the JAQL level descriptor of the new granularity

#### Type declaration

> ##### `payload.levelJaql`
>
> **levelJaql**: \{
> `bucket?`: `string`;
> `dateTimeLevel?`: `string`;
> `dim?`: `string`;
> `level?`: `string`;
> } & `Record`\< `string`, `unknown` \>
>
> JAQL of the attribute at the new date level
>
> > ###### `levelJaql.bucket`
> >
> > **bucket**?: `string`
> >
> > Bucket size in minutes for the `minutes` level
> >
> > ###### `levelJaql.dateTimeLevel`
> >
> > **dateTimeLevel**?: `string`
> >
> > Date level of non-aggregated datetime attributes
> >
> > ###### `levelJaql.dim`
> >
> > **dim**?: `string`
> >
> > Dimension expression (e.g. `[Commerce.Date (Calendar)]`)
> >
> > ###### `levelJaql.level`
> >
> > **level**?: `string`
> >
> > Date level of aggregated datetime attributes (e.g. `years`)
> >
> >
>
> ##### `payload.widgetId`
>
> **widgetId**: `string`
>
> The oid of the changed widget
>
>

***

### type

> **type**: `"widget/dateLevelChanged"`

Event type
