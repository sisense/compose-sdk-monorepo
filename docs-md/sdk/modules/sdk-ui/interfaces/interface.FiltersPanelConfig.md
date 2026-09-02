---
title: FiltersPanelConfig
---

# Interface FiltersPanelConfig

Configuration for the filters panel

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
> ##### `actions.lockFilter`
>
> **lockFilter**?: `object`
>
> Configuration for locking a filter.
>
> A locked filter is rendered read-only: its value cannot be changed from the tile, and the
> tile's edit, delete, and enable/disable controls are hidden. Locked filters are also left
> untouched by cross-filtering.
>
> > ###### `lockFilter.enabled`
> >
> > **enabled**?: `boolean`
> >
> > Determines whether the possibility to lock a filter is enabled.
> >
> > In Fusion the lock action additionally requires the dashboard to be in edit mode at the
> > moment of use. This flag reproduces only the permission half of that requirement, so
> > enabling it offers locking in the filters panel even outside edit mode.
> >
> > On a dashboard loaded by `DashboardById` the Fusion permissions are the only thing that
> > grants locking, so it stays off when the instance reports none. A panel or dashboard
> > assembled from props has no permissions to consult and defaults to on.
> >
> > ###### Default
> >
> > `true`, or the user's permissions to both use advanced filters and
> > toggle edit mode on a dashboard loaded by `DashboardById`
> >
> >
>
>
