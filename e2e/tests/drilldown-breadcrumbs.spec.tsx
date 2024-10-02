import { test, expect } from '@playwright/experimental-ct-react';
import { DrilldownBreadcrumbs } from '@sisense/sdk-ui';
import { Attribute } from '@sisense/sdk-data';

test.describe('DrilldownBreadcrumbs Component', () => {
  const filtersDisplayValues = [['Apple Macbooks'], ['Category'], ['Gender']];
  const currentDimension = {
    name: 'Age Range',
    type: 'text-attribute',
    expression: '[Commerce.Age Range]',
  } as Attribute;

  const clearDrilldownSelections = () => filtersDisplayValues.slice(0, 2);
  const sliceDrilldownSelections = (i: any) =>
    filtersDisplayValues.filter((item) => item[0] !== item[i]);

  test('should render without errors', async ({ mount }) => {
    const component = await mount(
      <DrilldownBreadcrumbs
        filtersDisplayValues={filtersDisplayValues}
        currentDimension={currentDimension}
        clearDrilldownSelections={clearDrilldownSelections}
        sliceDrilldownSelections={sliceDrilldownSelections}
      />,
    );
    expect(component).not.toBeNull();
  });

  test('should display first active drill', async ({ mount }) => {
    const component = await mount(
      <DrilldownBreadcrumbs
        filtersDisplayValues={filtersDisplayValues}
        currentDimension={currentDimension}
        clearDrilldownSelections={clearDrilldownSelections}
        sliceDrilldownSelections={sliceDrilldownSelections}
      />,
    );

    const firstActiveDrill = component.getByRole('button', { name: filtersDisplayValues[0][0] });
    await expect(firstActiveDrill).toHaveText(filtersDisplayValues[0][0]);
  });

  test('should display second active drill', async ({ mount }) => {
    const component = await mount(
      <DrilldownBreadcrumbs
        filtersDisplayValues={filtersDisplayValues}
        currentDimension={currentDimension}
        clearDrilldownSelections={clearDrilldownSelections}
        sliceDrilldownSelections={sliceDrilldownSelections}
      />,
    );

    const secondActiveDrill = component.getByRole('button', { name: filtersDisplayValues[1][0] });
    await expect(secondActiveDrill).toHaveText(filtersDisplayValues[1][0]);
  });

  test('should display third drill', async ({ mount }) => {
    const component = await mount(
      <DrilldownBreadcrumbs
        filtersDisplayValues={filtersDisplayValues}
        currentDimension={currentDimension}
        clearDrilldownSelections={clearDrilldownSelections}
        sliceDrilldownSelections={sliceDrilldownSelections}
      />,
    );

    const thirdActiveDrill = component.getByRole('button', { name: filtersDisplayValues[2][0] });
    await expect(thirdActiveDrill).toHaveText(filtersDisplayValues[2][0]);
  });

  test('should display the current category with "(All)" being added ', async ({ mount }) => {
    const currentDrillText = currentDimension.name;
    const component = await mount(
      <DrilldownBreadcrumbs
        filtersDisplayValues={filtersDisplayValues}
        currentDimension={currentDimension}
        clearDrilldownSelections={clearDrilldownSelections}
        sliceDrilldownSelections={sliceDrilldownSelections}
      />,
    );
    const currentDrill = component.locator('li').filter({ hasText: currentDrillText });
    await expect(currentDrill).toHaveText(`${currentDrillText} (All)`);
  });
});
