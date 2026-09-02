import { useState } from 'react';

import { screen, waitFor } from '@testing-library/react';

import { setup } from '@/__test-helpers__';

import { CalendarSelect } from './calendar-select';
import { CalendarSelectTypes } from './types';

/**
 * Calendar dates name a calendar day rather than an instant, so they are anchored to UTC midnight
 * the same way the sections build their limits. Dropping the `Z` would make these assertions pass
 * only in UTC.
 */
const LIMITS = {
  minDate: new Date('2009-11-25T00:00:00Z'),
  maxDate: new Date('2013-12-31T00:00:00Z'),
};

/** Reads the month title rendered by the calendar's custom header. */
const getVisibleMonth = () => document.querySelector('.react-datepicker__header span')?.textContent;

function MultiSelectHarness({ initialValue = [] as Date[] }) {
  const [value, setValue] = useState<Date[]>(initialValue);
  return (
    <CalendarSelect
      type={CalendarSelectTypes.MULTI_SELECT}
      limits={LIMITS}
      value={value}
      onChange={setValue}
      placeholder="Select"
    />
  );
}

function SingleSelectHarness() {
  const [value, setValue] = useState<Date | undefined>(undefined);
  return (
    <CalendarSelect
      type={CalendarSelectTypes.SINGLE_SELECT}
      limits={LIMITS}
      value={value}
      onChange={setValue}
      placeholder="Select"
    />
  );
}

describe('CalendarSelect', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Places "today" after `maxDate`, so the calendar opens on the latest allowed month.
    vi.setSystemTime(new Date('2026-08-26T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('multi-select mode', () => {
    it('should switch the visible month to the earliest allowed date', async () => {
      const { user } = setup(<MultiSelectHarness />);

      await user.click(screen.getByLabelText('Value'));
      await waitFor(() => expect(screen.getByText('Earliest Date')).toBeInTheDocument());
      expect(getVisibleMonth()).toBe('Dec 2013');

      await user.click(screen.getByText('Earliest Date'));

      await waitFor(() => expect(screen.getByText('11/25/2009')).toBeInTheDocument());
      expect(getVisibleMonth()).toBe('Nov 2009');
    });

    it('should switch the visible month back to the latest allowed date', async () => {
      const { user } = setup(<MultiSelectHarness />);

      await user.click(screen.getByLabelText('Value'));
      await waitFor(() => expect(screen.getByText('Earliest Date')).toBeInTheDocument());

      await user.click(screen.getByText('Earliest Date'));
      await waitFor(() => expect(getVisibleMonth()).toBe('Nov 2009'));

      await user.click(screen.getByText('Latest Date'));

      await waitFor(() => expect(getVisibleMonth()).toBe('Dec 2013'));
    });

    it('should open on the earliest selected date instead of the latest allowed month', async () => {
      const { user } = setup(
        <MultiSelectHarness
          initialValue={[new Date('2011-06-15T00:00:00Z'), new Date('2010-03-04T00:00:00Z')]}
        />,
      );

      await user.click(screen.getByLabelText('Value'));

      await waitFor(() => expect(screen.getByText('Earliest Date')).toBeInTheDocument());
      expect(getVisibleMonth()).toBe('Mar 2010');
    });

    it('should keep the selected month after the popover is closed and reopened', async () => {
      const { user } = setup(<MultiSelectHarness />);

      await user.click(screen.getByLabelText('Value'));
      await waitFor(() => expect(screen.getByText('Earliest Date')).toBeInTheDocument());
      await user.click(screen.getByText('Earliest Date'));
      await waitFor(() => expect(getVisibleMonth()).toBe('Nov 2009'));

      // closes the popover, which unmounts the calendar
      await user.click(screen.getByLabelText('Value'));
      await waitFor(() => expect(screen.queryByText('Earliest Date')).not.toBeInTheDocument());

      await user.click(screen.getByLabelText('Value'));

      await waitFor(() => expect(screen.getByText('Earliest Date')).toBeInTheDocument());
      expect(getVisibleMonth()).toBe('Nov 2009');
    });
  });

  describe('single-select mode', () => {
    it('should switch the visible month to the earliest allowed date', async () => {
      const { user } = setup(<SingleSelectHarness />);

      await user.click(screen.getByLabelText('Value'));
      await waitFor(() => expect(screen.getByText('Earliest Date')).toBeInTheDocument());
      expect(getVisibleMonth()).toBe('Dec 2013');

      await user.click(screen.getByText('Earliest Date'));

      await waitFor(() => expect(screen.getByText('11/25/2009')).toBeInTheDocument());
      expect(getVisibleMonth()).toBe('Nov 2009');
    });
  });
});
