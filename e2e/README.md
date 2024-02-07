# e2e

This package uses experimental Component testing with Playwright. For more information, refer to the [Playwright documentation on testing components](https://playwright.dev/docs/test-components).

### WARNING:

You can't pass complex live objects to your component from the test. Only plain JavaScript objects and built-in types like strings, numbers, dates, etc., can be passed.

```tsx
test('this will not work', async ({ mount }) => {
  // `process` is a Node object; we can't pass it to the browser and expect it to work.
  const component = await mount(<ProcessViewer process={process} />);
});
```

Also, you can't pass data to your component synchronously in a callback:

```tsx
test('this will not work', async ({ mount }) => {
  const component = await mount(<ColorPicker colorGetter={() => 'red'} />);
});
```

That means you can't pass any CSDK instances from @sisense/sdk-data (like Dimensions, Measures, etc.) to the tested component props directly from the test, as it is necessary for them to inherit functions (like jaql()) in their prototypes. Otherwise, all functional properties of these objects will be silently skipped, leading to unexpected component behavior.

### REASON FOR LIMITATIONS:

When Playwright Test is used to test web components, tests run in Node.js, while components run in the real browser. This combines the best of both worlds: components run in the real browser environment, real clicks are triggered, real layout is executed, and visual regression is possible. At the same time, tests can use all the powers of Node.js as well as all the Playwright Test features. As a result, the same parallel, parameterized tests with the same post-mortem Tracing story are available during component testing. This means that props passed to your components must be serializable and stringifyable.

### WORKAROUND:

If you want to write a real E2E test with CSDK components communicating with a real server and pass CSDK data-instances, created by `@sisense/sdk-data`, you have to create a `*.story.tsx` file where you will wrap your component for the test with already defined complex params (kind of prepared 'demo' to test). These `*.story.tsx` files will be completely executed inside the browser, so all the variables inside will retain their functionality and prototypes.

```tsx
// areamap-chart.story.tsx

export const AreamapChartForCostPerCountry = ({
  sisenseUrl,
  sisenseToken,
}: {
  sisenseUrl: string;
  sisenseToken: string;
}) => {
  return (
    <SisenseContextProvider url={sisenseUrl} token={sisenseToken}>
      <Chart
        dataSet={DM.DataSource}
        chartType={'areamap'}
        dataOptions={{
          geo: [DM.Country.Country],
          color: [
            {
              column: DM.Measures.SumCost,
              title: 'Total Cost',
            },
          ],
        }}
      />
    </SisenseContextProvider>
  );
};
```

```tsx
// areamap-chart.spec.tsx

test('should render chart correctly and show tooltip', async ({ mount, page }) => {
  const { E2E_SISENSE_URL, E2E_SISENSE_TOKEN } = process.env;

  // only [string] props
  const component = await mount(
    <AreamapChartForCostPerCountry sisenseUrl={E2E_SISENSE_URL} sisenseToken={E2E_SISENSE_TOKEN} />,
  );
});
```
