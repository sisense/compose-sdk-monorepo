# Runtime Troubleshooting

This troubleshooting guide provides possible solutions to common issues that may arise when executing Compose SDK code.

<!--
Additional categories of potential troubleshooting.
## Data Models

Use of invalid data options. - Solution is to validate data correctly.

-->
## Chart Configurations

**Issue:**
There are double labels in my chart.

**Solution:**
You may be using multiple categories with labels. Use only one category instead.

<!--
Additional categories of potential troubleshooting.
### Filter configurations

-->
## Event Handlers

**Issue:**

My chart isn’t updating when I select filter values.

**Solution:**

1. Check the callback for filter change in the filter component.
2. Check to make sure that your callback affects the state of the chart.

**Issue:**

When clicking a point in my chart nothing happens.

**Solution:**

1. Check to make sure you provide a callback.
2. Check to make sure that your callback affects the state of the chart.
