---
title: DashboardFiltersPanelConfig
---

# Interface DashboardFiltersPanelConfig

Dashboard filters panel configuration

## Properties

### actions

> **actions**?: `object`

Configures the available actions within the filters panel.

When using `DashboardById` or a dashboard model loaded with `useGetDashboardModel` and
translated by `dashboardModelTranslator.toDashboardProps()`, each default below will be derived
from the current user's permissions on that dashboard, if the Sisense Fusion instance provides
it. Otherwise the documented default will be used. Explicit configuration values have the
highest precedence, and will override any defaults.

#### Type declaration

> ##### `actions.addFilter`
>
> **addFilter**?: `object`
>
> Configuration for adding a new filter.
>
> > ###### `addFilter.enabled`
> >
> > **enabled**?: `boolean`
> >
> > Determines whether the possibility to create a new filter is enabled.
> >
> > ###### Default
> >
> > `false`, or the user's permission to create filters on a Fusion dashboard
> >
> >
>
> ##### `actions.deleteFilter`
>
> **deleteFilter**?: `object`
>
> Configuration for deleting a filter.
>
> > ###### `deleteFilter.enabled`
> >
> > **enabled**?: `boolean`
> >
> > Determines whether the possibility to delete a filter is enabled.
> >
> > ###### Default
> >
> > `false`, or the user's permission to delete filters on a Fusion dashboard
> >
> >
>
> ##### `actions.editFilter`
>
> **editFilter**?: `object`
>
> Configuration for editing an existing filter.
>
> > ###### `editFilter.enabled`
> >
> > **enabled**?: `boolean`
> >
> > Determines whether the possibility to edit an existing filter is enabled.
> >
> > This governs the editor for an existing filter, which is a different editor from the one
> > `addFilter` opens. Changing a filter's value from its tile is always available and is not
> > affected by this setting.
> >
> > ###### Default
> >
> > `false`, or `true` on a Fusion dashboard, where opening this editor is not
> > permission-gated and editing a filter changes only the current user's own view of the
> > dashboard
> >
> >
>
>

***

### collapsedInitially

> **collapsedInitially**?: `boolean`

Boolean flag that controls the initial "collapsed" state of the filters panel.

If not specified, the default value is `false`.

***

### persistCollapsedStateToLocalStorage

> **persistCollapsedStateToLocalStorage**?: `boolean`

Setting this to `true` will use the isCollapsed state from local storage, if available, and store any changes to local storage.
This state is shared across all dashboards.
This state has a higher priority than `collapsedInitially` when enabled.

***

### showFilterIconInToolbar

> **showFilterIconInToolbar**?: `boolean`

If enabled, the expand/collapse arrow on the divider between the filters panel and the dashboard content will be replaced with a filter toggle icon on the dashboard toolbar.

If the dashboard toolbar is configured to be not visible, this setting will be ignored.

If not specified, the default value is `false`.

***

### visible

> **visible**?: `boolean`

Determines whether the filters panel is visible.

If not specified, the default value is `true`.
