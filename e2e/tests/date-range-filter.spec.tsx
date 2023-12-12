import { test, expect } from '@playwright/experimental-ct-react';
import type { DateRangeFilterProps } from '@sisense/sdk-ui';
import { DateFilter } from '@sisense/sdk-ui';

const props: DateRangeFilterProps = {
  onChange: (dateFilter) => {
    console.log(dateFilter);
  },
  value: {
    from: '2021-01-01',
    to: '2022-01-31',
  },
  limit: {
    minDate: '2021-01-01',
    maxDate: '2022-01-31',
  },
};

test.describe('React RangeDateFilter', () => {
  test('should render DateRangeFilter', async ({ mount }) => {
    const dateFilter = await mount(<DateFilter {...props} />);
    await expect(dateFilter.getByLabel('date range filter')).toBeInViewport();
  });

  test('should render pickers from and to', async ({ mount, page }) => {
    await mount(<DateFilter {...props} />);
    const fields = page.getByLabel('DateRangeField', {
      exact: true,
    });

    const numberOfFields = await fields.count();
    expect(numberOfFields).toEqual(2);
  });

  test('should render icon for each field', async ({ mount }) => {
    const dateFilter = await mount(<DateFilter {...props} />);

    const DateRangeFieldIcons = dateFilter.getByLabel('DateRangeFieldIcon', {
      exact: true,
    });
    await expect(DateRangeFieldIcons.nth(0)).toBeVisible();
    await expect(DateRangeFieldIcons.nth(1)).toBeVisible();
    const numberOfIcons = await DateRangeFieldIcons.count();
    expect(numberOfIcons).toEqual(2);
  });
});
