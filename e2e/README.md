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

## Visual Regression Tests

Visual regression testing is essential for ensuring that changes in code do not unintentionally alter the visual appearance of ComposeSDK components. It allows to compare the "actual" appearance with the "expected" one by analyzing screenshots. This section outlines how to run visual regression tests both locally and within Docker to maintain consistent testing environments.

Prerequisites:

- Install/start docker on your system.
- Configure `.env.local` file, see the `.env.local.example` file for reference.
  IMPORTANT: It contains different environment variables compared to other locations in the monorepo.

The following scripts are available:

- `yarn run test:visual` - Runs end-to-end (e2e) visual difference tests against the expected screenshots.
- `yarn run test:visual:update` - Updates the expected screenshots (stored in the nested **screenshots** folders).
- `yarn run test:visual:ui` - Runs the UI mode to explore tests with advanced debugging tools.
- `yarn run test:visual:report` - Runs the Report page with a results of a previous test run.

NOTE: The above scripts automatically run tests within the Docker image, eliminating environment-related differences.

The following applications are used as target apps for visual regression testing:

- `react-demo` - React demo app from `/examples/react-demo`
- `angular-demo` - Angular demo app from `/examples/angular-demo`
- `vue-demo` - Vue demo app from `/examples/vue-demo`
- `react-local-demo` - React demo app from `packages/sdk-ui`
- `react-storybook` - Storybook app from `packages/sdk-ui`

See `./visual-tests/appsConfig.ts` and `./scripts/start-servers.sh` for details of taget apps configuration.

Testing helpers (see `./visual-tests/__test-helpers__/makeScreenshot.ts`):

- `makeScreenshotsOverPage(page: Page)` - performs automatic screenshots verification over the page elements marked by `data-visual-testid` attribute. The value of this attribute will be used as part of the target screenshot name.
- `makeScreenshots(page: Page, locators: Locator[], name?: string)` - performs screenshots verification over the array of locators
- `makeScreenshot(page: Page, locator: Locator, name?: string)` - performs screeshot verification over the target locator

### Test Suites with Predefined Dashboards

The visual regression tests are designed to automatically verify test suites that utilize predefined dashboards, each representing a distinct test case.

These tests automatically validate each dashboard listed on the `TestSuiteDashboards` page within the `react-local-demo` application. Dashboard assets are stored in the `packages/sdk-ui/__demo__/assets/test-suite-dashboards/` directory.

To add a new dashboard asset, simply place a `*.dash` file exported from "Sisense Analytics" into the aforementioned directory. This addition will be automatically verified by the `react-local-demo/test-suites.spec.ts` test suite.

### Known issues:

- The default system font is used in all screenshots to prevent flaky test results caused by differences in rendered text when custom fonts are used.
- Possibility to catch a flaky test due to a temporal network communication slowness of connected Fusion Embed app.\
  Note: the testing strategy with 2 retries for failed test should eliminate this problem.
