import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import type { DateFilterProps } from '@sisense/sdk-ui';
import { DateFilter } from '@sisense/sdk-ui';

const props: DateFilterProps = {
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

test.describe.skip('React RangeDateFilter', () => {
  test('should render DateRangeFilter', async ({ mount }) => {
    const dateFilter = await mount(<DateFilter {...props} />);
    await expect(dateFilter).toHaveAttribute('aria-label', 'date range filter');
  });

  test('should render pickers from and to', async ({ mount, page }) => {
    const dateFilter = await mount(<DateFilter {...props} />);
    const fields = page.getByLabel('DateRangeField', {
      exact: true,
    });

    const numberOfFields = await fields.count();
    await expect(numberOfFields).toEqual(2);
  });

  test('should render icon for each field', async ({ mount }) => {
    const dateFilter = await mount(<DateFilter {...props} />);

    const DateRangeFieldIcons = await dateFilter.getByLabel('DateRangeFieldIcon', {
      exact: true,
    });
    await expect(DateRangeFieldIcons.nth(0)).toBeVisible();
    await expect(DateRangeFieldIcons.nth(1)).toBeVisible();
    const numberOfIcons = await DateRangeFieldIcons.count();
    await expect(numberOfIcons).toEqual(2);
  });

  test('should render calendar when clicking pickers', async ({ mount, page }) => {
    const calendarSelector = '.MuiDateRangeCalendar-root';

    const dateFilter = await mount(<DateFilter {...props} />);
    const button = dateFilter.getByLabel('DateRangeFieldButton');
    await button.nth(0).click();

    const calendar = dateFilter.locator(calendarSelector);
    const calendarThorughPage = await page.locator(calendarSelector);
    await expect(calendarThorughPage).toBeVisible();
  });

  test('should  display from date when from picker is clicked', async ({ mount, page }) => {
    const calendarMonthSelector = '.MuiPickersCalendarHeader-label';

    const dateFilter = await mount(<DateFilter {...props} />);
    const button = dateFilter.getByLabel('DateRangeFieldButton');
    await button.nth(0).click();

    const calendarMonth = page.locator(calendarMonthSelector);

    await expect(calendarMonth).toContainText('January 2021');
  });

  test('should  display to date when to picker is clicked', async ({ mount, page }) => {
    const calendarMonthSelector = '.MuiPickersCalendarHeader-label';

    const dateFilter = await mount(<DateFilter {...props} />);
    const button = dateFilter.getByLabel('DateRangeFieldButton');
    await button.nth(1).click();

    const calendarMonth = page.locator(calendarMonthSelector);

    await expect(calendarMonth).toContainText('January 2022');
  });

  // TODO: implemenet test for clicking on calendar and changing date range
});
