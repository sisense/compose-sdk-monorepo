---
title: Chart Types
indexTopics:
    - title: Compose SDK Charts
      description: Learn how to use Compose SDK charts
      link: ./guide-compose-sdk-charts
    - title: Sisense Fusion Widgets
      description: Learn how to use your existing Sisense Fusion widgets with Compose SDK
      link: ./guide-fusion-widgets
    - title: External Charts
      description: Learn how to use external charting libraries with Compose SDK
      link: ./guide-external-charts
---

# Chart Types

When working with Compose SDK, there are several different ways you can visualize data using charts:

-   Compose SDK Charts - Charts found in the `sdk-ui*` modules built specifically for Compose SDK
-   Sisense Fusion Widgets - Charts that are already defined as widgets within a Sisense Fusion dashboard
-   External Charts - Charts from 3rd party charting libraries, such as [D3](https://d3js.org/),
    [Material UI](https://mui.com/x/react-charts/), [nivo](https://nivo.rocks/), and others

You can choose to use one type of chart or mix and match to fit your specific needs.

<SectionIndex />

## Compose SDK Charts

Compose SDK charts are the components found in the `sdk-ui` modules of Compose SDK. These charts can be used with data from a Sisense instance or 3rd party data.

These components provide an easy way to build data visualizations directly against a Sisense data model or other data source. They also allow for customizing the data that is presented, how that data is styled, and how your users can interact with that data.

Compose charts are currently available as React, Angular, and Vue components.

Compose SDK charts should be your default choice for any project where you’ll be creating new charts, especially with data from a Sisense instance.

To learn more about Compose SDK charts, see [Compose SDK Charts](./guide-compose-sdk-charts.md).

## Sisense Fusion Widgets

Sisense Fusion widgets are charts rendered from dashboard widgets that already exist in your Sisense Fusion environment. You can reuse most charts you already defined using Sisense Fusion and optionally customize them using Compose SDK.

Note: Sisense Fusion widgets can also be used to update existing projects that embed Sisense Fusion widgets using Sisense.JS. Using Compose SDK instead of Sisense.JS usually leads to improved performance, lower latency, and simpler code.

Use Fusion charts when you already have the charts you need in your Sisense instance.

To learn more about Fusion charts, see [Sisense Fusion Widgets](./guide-fusion-widgets.md).

## External Charts

Using the query APIs of Compose SDK, you can use the data you retrieve from your Sisense environment with just about any JavaScript charting library. Use Compose SDK to query Sisense for the data you need for your charts. Then use that data to populate charts from a 3rd party charting library.

Use external charting libraries if you are already familiar with them and want to continue using them or if they offer functionality not currently available in Compose SDK charts.

To learn more about External Charts, see [External Charts](./guide-external-charts.md).
