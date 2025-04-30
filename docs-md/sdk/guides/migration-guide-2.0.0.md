---
title: Migrating Compose SDK from 1.x.x to 2.0.0
---
# Migrating Compose SDK from 1.x.x to 2.0.0

Released in April 2025, the major version `2.0.0` of the Compose SDK introduces several breaking changes.
If your application is still using a Compose SDK version earlier than `2.0.0`, follow this guide to migrate.

## Minimum React Version

The minimum supported version of <img src="./../img/react-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> **React** is now v17.0.0.

## Minimum Angular Version

The minimum supported version of <img src="./../img/angular-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> **Angular** is now v17.

## Removed Deprecated Entities

1. ### `DashboardWidget` Component

   If your app uses `DashboardWidget` (React/Vue) or `\<csdk-dashboard-widget\>` (Angular) explicitly, replace them with the equivalent as described in the list below.

   The `DashboardWidget` component was renamed to `WidgetById` and deprecated in version `1.23.0`.
   It has now been removed in version `2.0.0`.

   <img src="./../img/react-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> **React**, <img src="./../img/vue-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> **Vue**
   - The `DashboardWidget` component has been removed. Use the `WidgetById` component instead.
   - The `DashboardWidgetProps` interface has been removed. Use the `WidgetByIdProps` interface instead.
   - The `DashboardWidgetStyleOptions` interface has been removed. Use the `WidgetByIdStyleOptions` interface instead.

   <img src="./../img/angular-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> **Angular**
   - The `<csdk-dashboard-widget>` component has been removed. Use the `<csdk-widget-by-id>` component instead.
   - The `DashboardWidgetProps` interface has been removed. Use the `WidgetByIdProps` interface instead.
   - The `DashboardWidgetStyleOptions` interface has been removed. Use the `WidgetByIdStyleOptions` interface instead.

2. ### `WidgetModel` Interface

   In previous versions, `WidgetModel` was a class instance that included methods to convert its data into component props.
   In version `1.20.0`, these methods were moved into separate `widgetModelTranslator` utility functions and deprecated on the `WidgetModel` interface.
   In version `2.0.0`, these methods have been removed, and `WidgetModel` is now a plain object.

   Removed deprecated `WidgetModel` methods:
   - `getExecuteQueryParams` – use `widgetModelTranslator.toExecuteQueryParams` instead.
   - `getExecutePivotQueryParams` – use `widgetModelTranslator.toExecutePivotQueryParams` instead.
   - `getChartProps` – use `widgetModelTranslator.toChartProps` instead.
   - `getTableProps` – use `widgetModelTranslator.toTableProps` instead.
   - `getPivotTableProps` – use `widgetModelTranslator.toPivotTableProps` instead.
   - `getPivotTableWidgetProps` – use `widgetModelTranslator.toPivotTableWidgetProps` instead.
   - `getChartWidgetProps` – use `widgetModelTranslator.toChartWidgetProps` instead.
   - `getTableWidgetProps` – use `widgetModelTranslator.toTableWidgetProps` instead.
   - `getTextWidgetProps` – use `widgetModelTranslator.toTextWidgetProps` instead.

   Example:
   ```tsx
   // Before
   const chartProps = widgetModel.getChartProps();

   // After
   const chartProps = widgetModelTranslator.toChartProps(widgetModel);
   ```

3. ### Widget type
    Previously, the `WidgetModel` relied on the `Fusion` list of widget types. To improve consistency, the `WidgetModel` now uses the Compose SDK's own simplified list of widget types compatible with `Widget` component and `WidgetProps`.
    If you create/modify `WidgetModel` objects directly, you need to update the `widgetType` property to use the new type.
    ```ts
    type WidgetType = 'chart' | 'pivot' | 'text' | 'plugin';
    ```
    Example:
    ```tsx
    // Before
    const widgetModel: WidgetModel = {
        widgetType: 'chart/scatter',
        chartType: 'scatter',
        // ... other properties
    };

    // After
    const widgetModel: WidgetModel = {
        widgetType: 'chart',
        chartType: 'scatter',
        // ... other properties
    };
    ```

4. ### `TableStyleOptions` Interface

   - Removed deprecated `TableStyleOptions.headersColor` – use `TableStyleOptions.header.color.enabled` instead.
   - Removed deprecated `TableStyleOptions.alternatingRowsColor` – use `TableStyleOptions.rows.alternatingColor.enabled` instead.
   - Removed deprecated `TableStyleOptions.alternatingColumnsColor` – use `TableStyleOptions.columns.alternatingColor.enabled` instead.

   ```ts
   // Before
   const styleOptions: TableStyleOptions = {
     headersColor: true,
     alternatingColumnsColor: true,
     alternatingRowsColor: true,
   };

   // After
   const styleOptions: TableStyleOptions = {
     header: {
       color: {
         enabled: true,
       },
     },
     columns: {
       alternatingColor: {
         enabled: true,
       },
     },
     rows: {
       alternatingColor: {
         enabled: true,
       },
     },
   };
   ```

5. ### `PivotGrandTotals.title`

   The deprecated `PivotGrandTotals.title` property has been removed.
   To customize the title of grand totals, use the translation mechanism (see [Translation Guide](./internationalization.md) for details).

   Example:
   ```tsx
   const frenchTranslationResources: Partial<TranslationDictionary> = {
     pivotTable: {
       grandTotal: 'Total général',
       subTotal: '{{value}} total',
     },
   };
   ```

6. ### Widget drilldown

   - `DrilldownWidgetProps.drilldownDimensions` and `DrilldownOptions.drilldownDimensions` were deprecated in version `1.20.0` and have now been removed. Use `DrilldownWidgetProps.drilldownPaths` and `DrilldownOptions.drilldownPaths` instead.

   ```ts
   // Before
   const drilldownOptions = {
     drilldownDimensions: [DM.Commerce.AgeRange, DM.Commerce.Gender, DM.Commerce.Condition],
   };

   // After
   const drilldownOptions = {
     drilldownPaths: [DM.Commerce.AgeRange, DM.Commerce.Gender, DM.Commerce.Condition],
   };
   ```

7. ### Dashboard Helpers

   - The deprecated `modifyFilter` utility has been removed. Rename usages to `replaceFilter` instead.

8. ### `ThemeSettings`

   - The deprecated `themeSettings.chart.panelBackgroundColor` property has been removed. Use `themeSettings.filter.panel.backgroundColor` instead for theming filter panel.

9. ### Query Params

   <img src="./../img/angular-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> **Angular**:
   - The deprecated `onBeforeQuery` property in `ExecuteQueryParams` has been removed. Use the `beforeQuery` parameter instead.

---

## Type Fixes

   <img src="./../img/react-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> <img src="./../img/vue-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> <img src="./../img/angular-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> **All frameworks**:
   - The deprecated `CriteriaFilterType` type has been removed. Use the regular `Filter` type instead.

   <img src="./../img/vue-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> **Vue**:

   In version `2.0.0` prop types were aligned across frameworks, with the following changes:
   - The `dataOptions` and `chartType` props for all charts and `ChartWidget` are now required.
   - The `dataOptions` prop for `Table` and `PivotTable` is now required.
   - The `url` prop for `SisenseContextProvider` is now required.
   - The `widgets` prop for `Dashboard` is now required.
   - The `closeContextMenu` prop for `ContextMenu` is now required.
   - The `clearDrilldownSelections`, `currentDimension`, `filtersDisplayValues`, and `sliceDrilldownSelections` props for `DrilldownBreadcrumbs` are now required.
   - The `filter`, `onUpdate`, and `title` props for `CriteriaFilterTile` and `RelativeDateFilterTile` are now required.
   - The `attribute`, `filter`, `onChange`, and `title` props for `DateRangeFilterTile` and `MemberFilterTile` are now required.
   - The `onChange` prop for `FilterTile` is now required.
   - The `dashboardOid` prop for `DashboardById` is now required.
   - The `dashboardOid` and `widgetOid` props for `WidgetById` are now required.
   - The `dataSource` prop for `GetNlgInsights` is now required.

   <img src="./../img/angular-logo.png" height="14px" style="vertical-align: text-bottom; padding-bottom: 3px" /> **Angular**:

   - The `dataPointsSelect` prop for multiple charts has been renamed to `dataPointsSelected`.
   - The callbacks `dataPointClick`, `dataPointContextMenu`, `dataPointsSelect`, and `beforeRender` for specific charts are now strictly typed, referencing the values specific to each chart.
