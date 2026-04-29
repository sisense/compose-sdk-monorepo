---
title: Lesson 5 | Dynamic Charts
---

# Lesson 5 | Dynamic Charts

One of the main advantages to creating charts in code, is that you can build them and manipulate them dynamically with code.

In this lesson we change our charts dynamically in a couple of ways. First, we’ll add functionality so our users can change what dimension the bottom chart is broken down by. Then, we also let users decide if they want to see the chart data in a column chart, as we’ve been presenting it until now, or as a bar chart.

These are only some examples of how you can dynamically change a chart. You can, of course, choose to change just about anything in a chart dynamically.

## Dynamic break by

Let’s start by adding a way for users to change the break down of the bottom chart.

To start off this process, we need to add a new state variable that will track which dimension we want to break by. Here we set it to default to color.

```ts
const [breakBy, setBreakBy] = useState('color');
```

Next, we need another toggle button group. We’ll add this one so it appears under the bottom chart. To keep things simple, we hard code the different choices we want to let users break the chart by.

```ts
<ToggleButtonGroup value={breakBy} onChange={handleBreakChange} exclusive>
  <ToggleButton key={'color'} value={'color'}>
    Color
  </ToggleButton>
  <ToggleButton key={'region'} value={'region'}>
    Region
  </ToggleButton>
  <ToggleButton key={'manager'} value={'manager'}>
    Team Manager
  </ToggleButton>
</ToggleButtonGroup>
```

Now we need to add a function to handle changes to the toggle button group. All this function needs to do is to set the state variable that tracks what we’re currently breaking our chart by.

```ts
const handleBreakChange = (
    _event: React.MouseEvent<HTMLElement>,
    newBreak: string
) => {
    setBreakBy(newBreak);
};
```

After setting all that up, we need to apply the changes in state to our chart. But before we do that, we’ll need to add a utility function to change the the state variable value, which is stored as a string, to a dimension from our imported data model.

```ts
const breakStringToColumn = (breakString: string) => {
  if (breakString === 'manager') {
    return DM.DimEmployees.TeamManager;
  } else if (breakString === 'region') {
    return DM.DimCountries.Region;
  } else {
    return DM.DimProducts.Color;
  }
};
```

Then we call that function and pass it the `breakBy` state variable to dynamically assign the dimension we want to break by in the bottom charts `breakBy` property.

```ts
breakBy: [breakStringToColumn(breakBy)],
```

Finally, to finish things off we can add another couple of values to the mapping of the data series to colors. Here we add mappings for the series we get when breaking by region.

```ts
seriesToColorMap: {
  Black: '#1b1b1b',
  Blue: '#0000cd',
  Gold: '#fcc200',
  Red: '#ce2029',
  Silver: '#acacac',
  Yellow: '#eee600',
  USA: '#00008b',
  Europe: '#dc143c',
},
```

::: tip
The code up until this point can be found in branch [5a-dynamic-charts](https://github.com/sisense/compose-sdk-charts-tutorial/tree/5a-dynamic-charts).
:::

## Dynamic chart type

For the final feature of this tutorial, we’ll let users decide what type of chart they want use to view the data. A lot of what we need to do should be familiar to you already.

We start by adding another state variable to track the current chart type.

```ts
const [chartType, setChartType] = useState<ChartType>('column');
```

Next, we’ll add another toggle button group for users to make their choices. But this time we’ll use icons in our buttons. So first we need to install the Material UI icons by running the following command:

```sh
npm install @mui/icons-material
```

Then, we can add the toggle button group. Here we’ll use two bar chart icons, which actually depict Compose SDK column charts. So we rotate the second icon 90 degrees to look like a Compose SDK bar chart. Let's add this group between the two charts.

```ts
<ToggleButtonGroup value={chartType} onChange={handleTypeChange} exclusive>
  <ToggleButton key={'column'} value={'column'}>
    <BarChartIcon />
  </ToggleButton>
  <ToggleButton key={'bar'} value={'bar'}>
    <BarChartIcon style={{ transform: 'rotate(90deg)' }} />
  </ToggleButton>
</ToggleButtonGroup>
```

After that, we add a simple handler function that handles changes to the toggle button group by updating the the state variable that tracks the chart type.

```ts
const handleTypeChange = (
  _event: React.MouseEvent<HTMLElement>,
  newType: ChartType
) => {
  if (newType) setChartType(newType);
};
```

Finally, we can go to both of our charts and update their chart types to read from the `chartType` state variable instead of a hardcoded string.

```ts
chartType = {chartType}
```

Now you can go back to your charts and use the toggle button to change the chart types.

::: tip
The code up until this point can be found in branch [5b-dynamic-charts](https://github.com/sisense/compose-sdk-charts-tutorial/tree/5b-dynamic-charts).
:::

## The end

That concludes our tutorial. You now have a great foundation to go out and integrate Compose SDK into your own projects.
