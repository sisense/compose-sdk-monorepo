---
title: External Charts
---

# External Charts

You can use the data you retrieve from your Sisense instance with just about any JavaScript charting library. Use Compose SDK to query your Sisense instance for the data you need for your charts. Then use that data to populate charts from a 3rd party charting library.

In this guide we’ll use [Plotly.js](https://plotly.com/javascript/) charts, but the same principles apply to using any other charting library.

In order to display your Sisense data in a 3rd party chart, you need to:

- Query you Sisense instance for the data you want
- Transform the data you receive from Sisense to the format required by the charting library you’re using
- Apply the formatted data to the 3rd party chart.

Let’s see how you would perform these steps to create this chart that shows the total cost and total revenue for a number of age ranges.

![Plotly chart](../../img/chart-guides/plotly.png 'Plotly chart')

## Query

The first step you need to perform to use Sisense data in a 3rd party chart is to query the data.

There are a number of ways you can do this with Compose SDK. The two main ways are:

- Use `executeQuery()` (as a hook in React or as the `QueryService` method in Angular)
- Use the `<ExecuteQuery />` component (React only)

In this guide, we’ll take the first approach of using `executeQuery()`. So we simply call `executeQuery()` and pass it the information we want to query from our data model.

In this snippet, we’re querying the Sample ECommerce model to get total cost and total revenue categorized by age range.

##### React

<iframe
 src='https://csdk-playground.sisense.com/?example=charts-guide/external-chart&mode=docs'
 width=800
 height=875
 style='border:none;'
/>

##### Angular

```ts
import * as DM from '../../sample-ecommerce';
import { measures } from '@sisense/sdk-data';
import { QueryService } from '@sisense/sdk-ui-angular';

//...

constructor(private queryService: QueryService) {}

async ngOnInit(): Promise<void> {
  const { data } = await this.queryService.executeQuery({
    dataSource: DM.DataSource,
    dimensions: [DM.Commerce.AgeRange],
    measures: [
      measures.sum(DM.Commerce.Cost, 'Total Cost'),
      measures.sum(DM.Commerce.Revenue, 'Total Revenue'),
    ],
  });
  //..
}
```

## Transform

Now that we have the data from Sisense, we need to transform it to the format required by our 3rd party charting library. The code you need to write in this step will differ depending on what charting library you use.

For our Plotly chart, we need to take the data retrieved from Sisense, which is represented as a two-dimensional array of row data, and transpose it to an object containing 3 arrays, one for each column of our data.

We need to take this data from Sisense, organized as a two-dimensional array of row data, where each row is an object containing an age range and the corresponding cost and revenue totals:

```ts
data = [
  [
    { data: '0-18', text: '0-18', blur: false },
    { data: 4319951.642637288, text: '4319951.64263729', blur: false },
    { data: 1527753.0939548016, text: '1527753.0939548', blur: false },
  ],
  [
    { data: '19-24', text: '19-24', blur: false },
    { data: 8656480.951007009, text: '8656480.95100701', blur: false },
    { data: 3859902.864543805, text: '3859902.8645438', blur: false },
  ],
  [
    { data: '25-34', text: '25-34', blur: false },
    { data: 21185350.45013156, text: '21185350.4501316', blur: false },
    { data: 4877853.600113869, text: '4877853.60011387', blur: false },
  ],
  //...
];
```

And turn in into this data, organized as three arrays, one for the age ranges, one for the corresponding total cost values, and one for the corresponding total revenue values:

```ts
x1 = ['0-18', '19-24', '25-34', '35-44', '45-54', '55-64', '65+'];
x2 = [
  4319951.642637288, 8656480.951007009, 21185350.45013156,
  //...
];
x3 = [
  1527753.0939548016, 3859902.864543805, 4877853.600113869,
  //...
];
```

We can do that fairly easily with this code:

```ts
const x1: number[] = [];
const y1: number[] = [];
const y2: number[] = [];

data?.rows.forEach((row) => {
  x1.push(row[0].data);
  y1.push(row[1].data);
  y2.push(row[2].data);
});
```

Next, we need to take that data and create two “traces”, one for the total cost and another for the total revenue.

```ts
const trace1: Plotly.Data = {
  x: x1,
  y: y1,
  type: 'bar',
  name: 'Total Cost',
};

const trace2: Plotly.Data = {
  x: x1,
  y: y2,
  type: 'bar',
  name: 'Total Revenue',
};
```

Then, we can configure the layout of the chart.

```ts
const layout = {
  title: 'Total Cost and Revenue by Age Ranges',
  xaxis: { title: 'Age Range' },
  yaxis: { title: 'Cost and Revenue ($)' },
  width: 900,
  height: 500,
};
```

That concludes our data transformation. We just need to package it up in a variable that we’ll use to set the Plotly chart’s data in the next step.

```ts
const plotData = [trace1, trace2];
```

## Apply

Finally, we can apply our transformed data to our 3rd party chart.

In our case, we simply add a Plotly `<Plot />` component with the data we transformed and the layout configuration we created.

##### React

```ts
//...

import Plot from 'react-plotly.js';

//..

return <Plot data={plotData} layout={layout} />;

//...
```

##### Angular

```ts
// Component behavior in .component.ts

//..

this.graph = {
  data: plotData,
  layout: layout,
};

//...
```

```html
<!--Component HTML template in .component.html-->
<plotly-plot [data]="graph.data" [layout]="graph.layout"></plotly-plot>
```

## Full Code

When we put the steps together, the code for populating our 3rd party chart with data from Sisense looks like this:

##### React

```ts
import { useExecuteQuery } from '@sisense/sdk-ui';
import * as DM from '../sample-ecommerce';
import { measures } from '@sisense/sdk-data';

import Plot from 'react-plotly.js';

function MyPlotlyChart() {
  // Query
  const { data, isLoading, isError } = useExecuteQuery({
    dataSource: DM.DataSource,
    dimensions: [DM.Commerce.AgeRange],
    measures: [measures.sum(DM.Commerce.Cost, 'Total Cost'), measures.sum(DM.Commerce.Revenue, 'Total Revenue')],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  // Transform
  const x1: number[] = [];
  const y1: number[] = [];
  const y2: number[] = [];

  data?.rows.forEach((row) => {
    x1.push(row[0].data);
    y1.push(row[1].data);
    y2.push(row[2].data);
  });

  const trace1: Plotly.Data = {
    x: x1,
    y: y1,
    type: 'bar',
    name: 'Total Cost',
  };

  const trace2: Plotly.Data = {
    x: x1,
    y: y2,
    type: 'bar',
    name: 'Total Revenue',
  };

  const layout = {
    title: 'Total Cost and Revenue by Age Ranges',
    xaxis: { title: 'Age Range' },
    yaxis: { title: 'Cost and Revenue ($)' },
    width: 900,
    height: 500,
  };

  const plotData = [trace1, trace2];

  // Apply
  return <Plot data={plotData} layout={layout} />;
}

export default MyPlotlyChart;
```

##### Angular

```ts
import { Component } from '@angular/core';
import * as DM from '../../sample-ecommerce';
import { measures } from '@sisense/sdk-data';
import { QueryService } from '@sisense/sdk-ui-angular';

import { PlotData } from 'plotly.js-dist-min';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
})
export class AnalyticsComponent {
  graph: { data: Partial<PlotData>[]; layout: {} } = { data: [], layout: {} };

  constructor(private queryService: QueryService) {}

  async ngOnInit(): Promise<void> {
    const { data } = await this.queryService.executeQuery({
      dataSource: DM.DataSource,
      dimensions: [DM.Commerce.AgeRange],
      measures: [
        measures.sum(DM.Commerce.Cost, 'Total Cost'),
        measures.sum(DM.Commerce.Revenue, 'Total Revenue'),
      ],
    });

    const x1: number[] = [];
    const y1: number[] = [];
    const y2: number[] = [];

    data?.rows.forEach((row) => {
      x1.push(row[0].data);
      y1.push(row[1].data);
      y2.push(row[2].data);
    });

    const trace1: Plotly.Data = {
      x: x1,
      y: y1,
      type: 'bar',
      name: 'Total Cost',
    };

    const trace2: Plotly.Data = {
      x: x1,
      y: y2,
      type: 'bar',
      name: 'Total Revenue',
    };

    const layout = {
      title: 'Total Cost and Revenue by Age Ranges',
      xaxis: { title: 'Age Range' },
      yaxis: { title: 'Cost and Revenue ($)' },
      width: 900,
      height: 500,
    };

    const plotData = [trace1, trace2];

    this.graph = {
      data: plotData,
      layout: layout,
    };
  }
}
```

## Learn More

To learn more about using 3rd party chats with Compose SDK, including using [Material UI](https://mui.com/x/react-charts/) with React, see [Take control of your data visualizations: Connecting to third-party libraries with Compose SDK](https://www.sisense.com/blog/take-control-of-your-data-visualizations/).
