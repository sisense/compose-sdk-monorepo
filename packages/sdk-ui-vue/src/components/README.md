# Create a Vue Component

TypeDoc works with TypeScript files and cannot parse `.vue` files yet.
As a result, a majority of our components are defined in `.ts` files.

If you want to define a component in a `.vue` file to be included in the API Doc,
below is a step-by-step workaround:

1. Create a companion component in a `.ts` file, for example, `DrilldownWidgetTs` in `drilldown-widget.ts` for `DrilldownWidget` in `drilldown-widget.vue`
2. Define the component props and add TSDoc comments to the companion component, `DrilldownWidgetTs`
3. In `DrilldownWidget`, import component `DrilldownWidgetTs` to reuse its props
4. Export `DrilldownWidget` in `src/lib.ts` to be included in the package as usual.
5. Export `DrilldownWidgetTs` as `DrilldownWidget` and its related types in `src/index-typedoc.ts` to be included the API Doc

For reference on this approach, see [this discussion](https://github.com/TypeStrong/typedoc/issues/1030#issuecomment-786782774).
