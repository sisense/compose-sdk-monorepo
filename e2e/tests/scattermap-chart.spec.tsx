import { test, expect } from '@playwright/experimental-ct-react';
import { ScattermapChart, SisenseContextProvider } from "@sisense/sdk-ui";
import { attributes, data, measures } from "./__mocks__/dataMocks";

test.describe('React Scattermap Chart', () => {
  const { E2E_SISENSE_URL, E2E_SISENSE_TOKEN } = process.env;

  test('should render chart correctly and show tooltip', async ({ mount, page }) => {
    const component = await mount(
      <SisenseContextProvider
        url={E2E_SISENSE_URL}
        token={E2E_SISENSE_TOKEN}>
      <ScattermapChart
        dataSet={data}
        dataOptions={{
          geo: [attributes.country],
          size: measures.totalQuantity,
          colorBy: {
            color: {
              type: 'range',
              minColor: 'red',
              maxColor: 'green'
            },
            column: measures.totalUnits,
          }
        }}/>
      </SisenseContextProvider>
    );

    expect(await component.locator('.csdk-map-container')).toHaveCount(1);

    // Waiting till locations will loaded and markers will appear
    await page.locator('.leaflet-interactive').first().waitFor({timeout: 10000});
    // Skip animation
    await page.waitForTimeout(5000);

    const markers = page.locator('.leaflet-interactive');

    expect(markers).toHaveCount(data.rows.length);

    const markerColors = [];
    for (const marker of await markers.all()) {
      expect(await marker.getAttribute('stroke')).toBe('none');
      expect(await marker.getAttribute('fill-opacity')).toBe('0.5');
      expect(await marker.getAttribute('fill-rule')).toBe('evenodd');
      markerColors.push(await marker.getAttribute('fill'));
    }

    expect(markerColors).toEqual([
      '#f00', '#ea2912', '#3f6935', '#515151', '#4a5d44', '#815041', '#008000', '#2e7523', '#3f6935', '#d5391e'
    ]);

    // Trigger tooltip
    await markers.first().dispatchEvent('mouseover')

    // Match all tooltip content
    await expect(component).toContainText('USA');
    await expect(component).toContainText('Total Quantity');
    await expect(component).toContainText('6.78K');
    await expect(component).toContainText('Total Units');
    await expect(component).toContainText('10');
  });

});
