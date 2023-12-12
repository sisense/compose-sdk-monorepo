import { expect, test } from '@playwright/experimental-ct-react';
import { Data } from '@sisense/sdk-data';
import { Chart, SisenseContextProvider } from '@sisense/sdk-ui';
import { attributes, data, measures } from './__mocks__/dataMocks';

const props = {
  chartType: 'line' as const,
  dataSet: data,
  dataOptions: {
    category: [attributes.years],
    value: [
      {
        column: measures.totalQuantity,
        showOnRightAxis: false,
      },
      {
        column: measures.totalUnits,
        showOnRightAxis: true,
        color: '#0000FF',
      },
    ],
    breakBy: [],
  },
};

test.describe('React ChartErrorBoundary', () => {
  test('should render error when broken context provided', async ({ mount, page }) => {
    const errorBoundary = await mount(
      <SisenseContextProvider url={'http://unexisting.com'} token={'broken-token'}>
        <Chart {...props} />
      </SisenseContextProvider>,
    );
    // check for error picture
    const svgElement = await page.waitForSelector('div#root svg[width="53px"][height="53px"]');
    expect(svgElement).toBeTruthy();

    // check for error message on hover
    await errorBoundary.hover();
    await expect(errorBoundary).toContainText(
      // different browsers have different error messages for network errors
      /Load failed|NetworkError|Network error/,
    );
  });

  test('should render chart when nothing went wrong', async ({ mount }) => {
    const errorBoundary = await mount(<Chart {...props} />);

    // chart legend will contain column title
    await expect(errorBoundary).toContainText(props.dataOptions.value[0].column.title);
  });

  test('should render error just for a chart with broken dataSet provided', async ({
    mount,
    page,
  }) => {
    const errorBoundary = await mount(
      <div>
        <Chart {...props} dataSet={4 as unknown as Data} />
        <Chart {...props} />
      </div>,
    );

    // check for error picture
    const svgElement = await page.waitForSelector('div#root svg[width="53px"][height="53px"]');
    expect(svgElement).toBeTruthy();

    // chart legend will contain column title
    await expect(errorBoundary).toContainText(props.dataOptions.value[0].column.title);
  });
});
