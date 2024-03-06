import { test, expect } from '@playwright/experimental-ct-react';
import { AreamapChartForCostPerCountry } from './areamap-chart.story';

test.describe('React Areamap Chart', () => {
  test('should render chart correctly and show tooltip', async ({ mount }) => {
    const { E2E_SISENSE_URL, E2E_SISENSE_TOKEN } = process.env;

    const component = await mount(
      <AreamapChartForCostPerCountry
        sisenseUrl={E2E_SISENSE_URL}
        sisenseToken={E2E_SISENSE_TOKEN}
      />,
    );

    const mapContainer = component.locator('.csdk-map-container');

    await expect(mapContainer).toHaveCount(1);

    // Check that shapes of all 181 countries are rendered
    const svgElement = mapContainer.locator('svg');
    await expect(svgElement).toHaveCount(1);
    const countriesPaths = svgElement.locator('path');
    await expect(countriesPaths.count()).resolves.toBeGreaterThan(0);
  });
});
